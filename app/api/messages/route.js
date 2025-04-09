import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db/connection';
import Message from '@/lib/db/models/Message';
import User from '@/lib/db/models/User';
import Listing from '@/lib/db/models/Listing';
import mongoose from 'mongoose';

// Get messages for a specific conversation
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('userId');
    const listingId = searchParams.get('listingId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    if (!otherUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Build query for conversation between two users, optionally about a specific listing
    const query = {
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    };
    
    if (listingId) {
      query.listing = listingId;
    }
    
    // Find messages
    const messages = await Message.find(query)
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .populate('listing', 'title images')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Message.countDocuments(query);
    
    // Mark messages as read if current user is the receiver
    await Message.updateMany(
      { receiver: userId, sender: otherUserId, isRead: false },
      { isRead: true }
    );
    
    // Return messages
    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages', details: error.message },
      { status: 500 }
    );
  }
}

// Send a new message
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const { receiverId, listingId, content } = await request.json();
    
    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      );
    }
    
    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }
    
    // Validate listing exists if provided
    if (listingId) {
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        );
      }
    }
    
    // Create new message
    const message = new Message({
      sender: session.user.id,
      receiver: receiverId,
      listing: listingId,
      content,
      isRead: false
    });
    
    await message.save();
    
    // Return created message
    return NextResponse.json({
      success: true,
      message: await Message.findById(message._id)
        .populate('sender', 'name')
        .populate('receiver', 'name')
        .populate('listing', 'title images')
    }, { status: 201 });
    
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    );
  }
}
