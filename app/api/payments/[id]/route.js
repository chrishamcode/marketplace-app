import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Payment from '@/lib/db/models/Payment';
import User from '@/lib/db/models/User';
import { connectToDatabase } from '@/lib/db/connection';
import { retrievePaymentIntent, createRefund } from '@/lib/transactions/stripe';

// Get a specific payment by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get current user
    await connectToDatabase();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get payment
    const payment = await Payment.findById(id)
      .populate('offerId')
      .populate('listingId', 'title price images status')
      .populate('buyerId', 'name email image')
      .populate('sellerId', 'name email image');

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if user is buyer or seller
    const isBuyer = payment.buyerId._id.toString() === currentUser._id.toString();
    const isSeller = payment.sellerId._id.toString() === currentUser._id.toString();

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'You do not have permission to view this payment' },
        { status: 403 }
      );
    }

    // Get the latest payment status from Stripe
    let stripePaymentIntent = null;
    try {
      stripePaymentIntent = await retrievePaymentIntent(payment.paymentIntentId);
      
      // Update payment status if it has changed
      if (stripePaymentIntent.status === 'succeeded' && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.paymentDate = new Date();
        await payment.save();
      } else if (stripePaymentIntent.status === 'canceled' && payment.status !== 'failed') {
        payment.status = 'failed';
        await payment.save();
      }
    } catch (error) {
      console.error('Error retrieving payment intent from Stripe:', error);
      // Continue with local payment data
    }

    // Format payment for response
    const formattedPayment = {
      id: payment._id,
      offer: payment.offerId ? {
        id: payment.offerId._id,
        amount: payment.offerId.amount,
        status: payment.offerId.status
      } : null,
      listing: {
        id: payment.listingId._id,
        title: payment.listingId.title,
        price: payment.listingId.price,
        status: payment.listingId.status,
        image: payment.listingId.images && payment.listingId.images.length > 0 
          ? payment.listingId.images[0].url 
          : null
      },
      buyer: {
        id: payment.buyerId._id,
        name: payment.buyerId.name,
        email: payment.buyerId.email,
        image: payment.buyerId.image
      },
      seller: {
        id: payment.sellerId._id,
        name: payment.sellerId.name,
        email: payment.sellerId.email,
        image: payment.sellerId.image
      },
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      paymentIntentId: payment.paymentIntentId,
      paymentDate: payment.paymentDate,
      refundAmount: payment.refundAmount,
      refundReason: payment.refundReason,
      refundDate: payment.refundDate,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      isUserBuyer: isBuyer,
      isUserSeller: isSeller,
      stripeStatus: stripePaymentIntent ? stripePaymentIntent.status : null
    };

    // Return the payment
    return NextResponse.json({ payment: formattedPayment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update payment status or process refund
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get current user
    await connectToDatabase();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get payment
    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const data = await request.json();
    const { action, refundReason, refundAmount } = data;

    // Validate action
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Process action
    switch (action) {
      case 'refund':
        // Only seller can issue refund
        if (payment.sellerId.toString() !== currentUser._id.toString()) {
          return NextResponse.json(
            { error: 'Only the seller can issue a refund' },
            { status: 403 }
          );
        }
        
        // Check if payment is completed
        if (payment.status !== 'completed') {
          return NextResponse.json(
            { error: 'Only completed payments can be refunded' },
            { status: 400 }
          );
        }
        
        // Check if already refunded
        if (payment.status === 'refunded') {
          return NextResponse.json(
            { error: 'Payment has already been refunded' },
            { status: 400 }
          );
        }
        
        // Validate refund reason
        if (!refundReason) {
          return NextResponse.json(
            { error: 'Refund reason is required' },
            { status: 400 }
          );
        }
        
        // Process refund with Stripe
        try {
          const refund = await createRefund(
            payment.paymentIntentId,
            refundAmount || payment.amount,
            'requested_by_customer'
          );
          
          // Update payment record
          payment.status = 'refunded';
          payment.refundAmount = refundAmount || payment.amount;
          payment.refundReason = refundReason;
          payment.refundDate = new Date();
          
          await payment.save();
          
          return NextResponse.json({
            success: true,
            payment: {
              id: payment._id,
              status: payment.status,
              refundAmount: payment.refundAmount,
              refundReason: payment.refundReason,
              refundDate: payment.refundDate
            }
          });
        } catch (error) {
          console.error('Error processing refund with Stripe:', error);
          return NextResponse.json(
            { error: 'Failed to process refund with payment provider' },
            { status: 500 }
          );
        }
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
