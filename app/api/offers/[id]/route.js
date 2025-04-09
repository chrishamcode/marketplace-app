import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Offer from '@/lib/db/models/Offer';
import Listing from '@/lib/db/models/Listing';
import User from '@/lib/db/models/User';
import { connectToDatabase } from '@/lib/db/connection';

// Get a specific offer by ID
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

    // Get offer
    const offer = await Offer.findById(id)
      .populate('listingId', 'title price images status')
      .populate('buyerId', 'name email image')
      .populate('sellerId', 'name email image');

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if user is buyer or seller
    const isBuyer = offer.buyerId._id.toString() === currentUser._id.toString();
    const isSeller = offer.sellerId._id.toString() === currentUser._id.toString();

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'You do not have permission to view this offer' },
        { status: 403 }
      );
    }

    // Format offer for response
    const formattedOffer = {
      id: offer._id,
      listing: {
        id: offer.listingId._id,
        title: offer.listingId.title,
        price: offer.listingId.price,
        status: offer.listingId.status,
        image: offer.listingId.images && offer.listingId.images.length > 0 
          ? offer.listingId.images[0].url 
          : null
      },
      buyer: {
        id: offer.buyerId._id,
        name: offer.buyerId.name,
        email: offer.buyerId.email,
        image: offer.buyerId.image
      },
      seller: {
        id: offer.sellerId._id,
        name: offer.sellerId.name,
        email: offer.sellerId.email,
        image: offer.sellerId.image
      },
      amount: offer.amount,
      status: offer.status,
      message: offer.message,
      expiresAt: offer.expiresAt,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      isUserBuyer: isBuyer,
      isUserSeller: isSeller
    };

    // Return the offer
    return NextResponse.json({ offer: formattedOffer });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update an offer (accept, reject, counter, withdraw)
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

    // Get offer
    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if user is buyer or seller
    const isBuyer = offer.buyerId.toString() === currentUser._id.toString();
    const isSeller = offer.sellerId.toString() === currentUser._id.toString();

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { error: 'You do not have permission to update this offer' },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await request.json();
    const { action, counterAmount, message } = data;

    // Validate action
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Check if offer is already finalized
    if (['accepted', 'rejected', 'expired', 'withdrawn'].includes(offer.status)) {
      return NextResponse.json(
        { error: `Offer is already ${offer.status}` },
        { status: 400 }
      );
    }

    // Process action
    switch (action) {
      case 'accept':
        // Only seller can accept
        if (!isSeller) {
          return NextResponse.json(
            { error: 'Only the seller can accept an offer' },
            { status: 403 }
          );
        }
        
        offer.status = 'accepted';
        break;
        
      case 'reject':
        // Only seller can reject
        if (!isSeller) {
          return NextResponse.json(
            { error: 'Only the seller can reject an offer' },
            { status: 403 }
          );
        }
        
        offer.status = 'rejected';
        break;
        
      case 'counter':
        // Only seller can counter
        if (!isSeller) {
          return NextResponse.json(
            { error: 'Only the seller can make a counter offer' },
            { status: 403 }
          );
        }
        
        // Validate counter amount
        if (!counterAmount || isNaN(counterAmount) || counterAmount <= 0) {
          return NextResponse.json(
            { error: 'Valid counter amount is required' },
            { status: 400 }
          );
        }
        
        // Create counter offer
        const counterOffer = new Offer({
          listingId: offer.listingId,
          buyerId: offer.buyerId,
          sellerId: offer.sellerId,
          amount: counterAmount,
          message: message || '',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
        
        await counterOffer.save();
        
        // Update original offer
        offer.status = 'countered';
        offer.counterOfferId = counterOffer._id;
        break;
        
      case 'withdraw':
        // Only buyer can withdraw
        if (!isBuyer) {
          return NextResponse.json(
            { error: 'Only the buyer can withdraw an offer' },
            { status: 403 }
          );
        }
        
        offer.status = 'withdrawn';
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Save updated offer
    await offer.save();

    // Return updated offer
    return NextResponse.json({
      success: true,
      offer: {
        id: offer._id,
        status: offer.status,
        updatedAt: offer.updatedAt,
        counterOfferId: offer.counterOfferId
      }
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
