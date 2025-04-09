import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db/connection';
import Message from '@/lib/db/models/Message';
import User from '@/lib/db/models/User';

// Get conversations for current user
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Find conversations where user is either sender or receiver
    const userId = session.user.id;
    
    // Aggregate to get the latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { receiver: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", mongoose.Types.ObjectId(userId)] },
              { $concat: [{ $toString: "$sender" }, "-", { $toString: "$receiver" }, "-", { $toString: "$listing" }] },
              { $concat: [{ $toString: "$receiver" }, "-", { $toString: "$sender" }, "-", { $toString: "$listing" }] }
            ]
          },
          messageId: { $first: "$_id" },
          sender: { $first: "$sender" },
          receiver: { $first: "$receiver" },
          listing: { $first: "$listing" },
          content: { $first: "$content" },
          isRead: { $first: "$isRead" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'senderDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiverDetails'
        }
      },
      {
        $lookup: {
          from: 'listings',
          localField: 'listing',
          foreignField: '_id',
          as: 'listingDetails'
        }
      },
      {
        $project: {
          _id: 1,
          messageId: 1,
          sender: { $arrayElemAt: ["$senderDetails", 0] },
          receiver: { $arrayElemAt: ["$receiverDetails", 0] },
          listing: { $arrayElemAt: ["$listingDetails", 0] },
          content: 1,
          isRead: 1,
          createdAt: 1
        }
      },
      {
        $project: {
          _id: 1,
          messageId: 1,
          sender: {
            _id: 1,
            name: 1
          },
          receiver: {
            _id: 1,
            name: 1
          },
          listing: {
            _id: 1,
            title: 1,
            images: 1
          },
          content: 1,
          isRead: 1,
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    
    // Count total conversations
    const total = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId) },
            { receiver: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", mongoose.Types.ObjectId(userId)] },
              { $concat: [{ $toString: "$sender" }, "-", { $toString: "$receiver" }, "-", { $toString: "$listing" }] },
              { $concat: [{ $toString: "$receiver" }, "-", { $toString: "$sender" }, "-", { $toString: "$listing" }] }
            ]
          }
        }
      },
      {
        $count: "total"
      }
    ]);
    
    const totalCount = total.length > 0 ? total[0].total : 0;
    
    // Return conversations
    return NextResponse.json({
      success: true,
      conversations,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to get conversations', details: error.message },
      { status: 500 }
    );
  }
}
