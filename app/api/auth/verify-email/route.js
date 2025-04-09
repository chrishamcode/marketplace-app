import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/User';

export async function GET(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get token from URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    // Find user with matching token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }
    
    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Email verification successful. You can now log in.'
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Email verification failed', details: error.message },
      { status: 500 }
    );
  }
}
