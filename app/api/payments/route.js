import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Payment from '@/lib/db/models/Payment';
import Offer from '@/lib/db/models/Offer';
import User from '@/lib/db/models/User';
import Listing from '@/lib/db/models/Listing';
import { connectToDatabase } from '@/lib/db/connection';
import { createPaymentIntent, formatAmountForStripe } from '@/lib/transactions/stripe';

// Create a payment intent for an accepted offer
export async function POST(request) {
  try {
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

    // Parse request body
    const data = await request.json();
    const { offerId } = data;

    // Validate required fields
    if (!offerId) {
      return NextResponse.json(
        { error: 'Offer ID is required' },
        { status: 400 }
      );
    }

    // Get offer
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if user is the buyer
    if (offer.buyerId.toString() !== currentUser._id.toString()) {
      return NextResponse.json(
        { error: 'Only the buyer can make a payment' },
        { status: 403 }
      );
    }

    // Check if offer is accepted
    if (offer.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Payment can only be made for accepted offers' },
        { status: 400 }
      );
    }

    // Get listing
    const listing = await Listing.findById(offer.listingId);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if there's already a pending payment for this offer
    const existingPayment = await Payment.findOne({
      offerId: offer._id,
      status: { $in: ['pending', 'processing'] }
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'A payment is already in progress for this offer' },
        { status: 400 }
      );
    }

    // Create a payment intent with Stripe
    const paymentIntent = await createPaymentIntent(
      offer.amount,
      'usd',
      {
        offerId: offer._id.toString(),
        listingId: listing._id.toString(),
        buyerId: currentUser._id.toString(),
        sellerId: offer.sellerId.toString()
      }
    );

    // Create a payment record
    const payment = new Payment({
      offerId: offer._id,
      listingId: listing._id,
      buyerId: currentUser._id,
      sellerId: offer.sellerId,
      amount: offer.amount,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'stripe',
      paymentIntentId: paymentIntent.id
    });

    await payment.save();

    // Return the client secret for the payment intent
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get payments for current user (as buyer or seller)
export async function GET(request) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'all'; // 'buyer', 'seller', or 'all'
    const status = searchParams.get('status') || 'all'; // 'pending', 'completed', etc. or 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (role === 'buyer') {
      query.buyerId = currentUser._id;
    } else if (role === 'seller') {
      query.sellerId = currentUser._id;
    } else {
      // 'all' - either buyer or seller
      query.$or = [
        { buyerId: currentUser._id },
        { sellerId: currentUser._id }
      ];
    }

    if (status !== 'all') {
      query.status = status;
    }

    // Get total count for pagination
    const totalPayments = await Payment.countDocuments(query);
    
    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('offerId')
      .populate('listingId', 'title price images')
      .populate('buyerId', 'name email image')
      .populate('sellerId', 'name email image');

    // Format payments for response
    const formattedPayments = payments.map(payment => ({
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
      paymentDate: payment.paymentDate,
      refundAmount: payment.refundAmount,
      refundReason: payment.refundReason,
      refundDate: payment.refundDate,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      isUserBuyer: payment.buyerId._id.toString() === currentUser._id.toString(),
      isUserSeller: payment.sellerId._id.toString() === currentUser._id.toString()
    }));

    // Return payments with pagination info
    return NextResponse.json({
      payments: formattedPayments,
      pagination: {
        total: totalPayments,
        page,
        limit,
        totalPages: Math.ceil(totalPayments / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
