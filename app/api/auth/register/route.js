import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/User';
import { sendVerificationEmail } from '@/lib/auth/email';

export async function POST(request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const { name, email, password, phone, location } = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      location
    });
    
    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    
    // Save user to database
    await user.save();
    
    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    await sendVerificationEmail(user.email, verificationToken, baseUrl);
    
    // Return success response (without sensitive data)
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}
