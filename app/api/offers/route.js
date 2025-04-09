import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Offer from '@/lib/db/models/Offer';
import Listing from '@/lib/db/models/Listing';
import User from '@/lib/db/models/User';
import { connectToDatabase } from '@/lib/db/connection';

// Create a new offer
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
    const { listingId, amount, message } = data;

    // Validate required fields
    if (!listingId || !amount) {
      return NextResponse.json(
        { error: 'Listing ID and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Check if user is not the seller
    if (listing.userId.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { error: 'You cannot make an offer on your own listing' },
        { status: 400 }
      );
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      );
    }

    // Check for existing pending offers from this user
    const existingOffer = await Offer.findOne({
      listingId: listingId,
      buyerId: currentUser._id,
      status: 'pending'
    });

    if (existingOffer) {
      return NextResponse.json(
        { error: 'You already have a pending offer for this listing' },
        { status: 400 }
      );
    }

    // Create new offer
    const offer = new Offer({
      listingId: listingId,
      buyerId: currentUser._id,
      sellerId: listing.userId,
      amount: amount,
      message: message || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await offer.save();

    // Return the created offer
    return NextResponse.json({
      success: true,
      offer: {
        id: offer._id,
        listingId: offer.listingId,
        amount: offer.amount,
        status: offer.status,
        message: offer.message,
        expiresAt: offer.expiresAt,
        createdAt: offer.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get offers for current user (as buyer or seller)
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
    const status = searchParams.get('status') || 'all'; // 'pending', 'accepted', etc. or 'all'
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
    const totalOffers = await Offer.countDocuments(query);
    
    // Get offers with pagination
    const offers = await Offer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('listingId', 'title price images')
      .populate('buyerId', 'name email image')
      .populate('sellerId', 'name email image');

    // Format offers for response
    const formattedOffers = offers.map(offer => ({
      id: offer._id,
      listing: {
        id: offer.listingId._id,
        title: offer.listingId.title,
        price: offer.listingId.price,
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
      isUserBuyer: offer.buyerId._id.toString() === currentUser._id.toString(),
      isUserSeller: offer.sellerId._id.toString() === currentUser._id.toString()
    }));

    // Return offers with pagination info
    return NextResponse.json({
      offers: formattedOffers,
      pagination: {
        total: totalOffers,
        page,
        limit,
        totalPages: Math.ceil(totalOffers / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
