# Marketplace Authentication and API Implementation Documentation

## Overview

This document provides comprehensive documentation for the user authentication system and core API endpoints implemented for the Marketplace MVP. This implementation represents Phase 1 (Weeks 1-2) of the 12-week roadmap, focusing on Core Infrastructure.

## Architecture

The implementation follows a modern web application architecture using:

- **Next.js**: For server-side rendering and API routes
- **MongoDB**: For database storage
- **NextAuth.js**: For authentication management
- **React**: For frontend components
- **Middleware**: For route protection and authentication verification

## Features Implemented

### User Authentication System

1. **User Registration**
   - Email-based registration with validation
   - Secure password hashing using bcrypt
   - Email verification system
   - Profile information collection (name, phone, location)

2. **Login System**
   - Secure authentication using NextAuth.js
   - JWT-based session management
   - Protection against common security vulnerabilities

3. **Password Management**
   - Forgot password functionality
   - Secure password reset with tokenized links
   - Password validation and strength requirements

4. **Profile Management**
   - User profile viewing and editing
   - Display of account information and trust score
   - Email verification status indication

5. **Security Features**
   - Protected routes using middleware
   - CSRF protection
   - Input validation and sanitization
   - Secure error handling

### Core API Endpoints

1. **User API Endpoints**
   - GET `/api/users` - List all users (with pagination)
   - GET `/api/users/[id]` - Get user by ID
   - GET `/api/users/profile` - Get current user's profile
   - PUT `/api/users/profile` - Update current user's profile

2. **Authentication API Endpoints**
   - POST `/api/auth/register` - Register new user
   - GET/POST `/api/auth/[...nextauth]` - NextAuth.js authentication
   - GET `/api/auth/verify-email` - Verify user email
   - POST `/api/auth/forgot-password` - Request password reset
   - POST `/api/auth/reset-password` - Reset password with token

3. **Listing API Endpoints**
   - GET `/api/listings` - List all listings (with filtering and pagination)
   - POST `/api/listings` - Create new listing
   - GET `/api/listings/[id]` - Get listing by ID
   - PUT `/api/listings/[id]` - Update listing
   - DELETE `/api/listings/[id]` - Delete listing (soft delete)

4. **Messaging API Endpoints**
   - GET `/api/messages/conversations` - Get user's conversations
   - GET `/api/messages` - Get messages in a conversation
   - POST `/api/messages` - Send a new message

## Frontend Components

1. **Authentication Forms**
   - Registration form with validation
   - Login form with error handling
   - Forgot password form
   - Reset password form
   - Profile management form

2. **Protected Routes**
   - Middleware for route protection
   - Redirection for unauthenticated users
   - Session management

## Database Schema

The implementation uses the following MongoDB collections:

1. **Users Collection**
   - Email, password (hashed), name, phone, location
   - Verification tokens and expiry dates
   - Trust score and verification status
   - Timestamps for creation and updates

2. **Listings Collection**
   - Title, description, price, category, condition
   - User reference, location, status
   - Images array with URLs and primary flag
   - Timestamps for creation and updates

3. **Messages Collection**
   - Sender and receiver references
   - Optional listing reference
   - Message content and read status
   - Timestamp for creation

## Testing

Comprehensive tests have been implemented to ensure functionality:

1. **Authentication Tests**
   - User registration flow
   - Login functionality
   - Password reset process
   - Profile management
   - Protected routes

2. **API Tests**
   - User API endpoints
   - Listing API endpoints
   - Messaging API endpoints
   - Authentication and authorization

3. **Integration Tests**
   - End-to-end user flows
   - Frontend and backend integration

## Security Considerations

1. **Password Security**
   - Passwords are hashed using bcrypt
   - Minimum password length and complexity requirements
   - Secure password reset flow with expiring tokens

2. **Authentication Security**
   - JWT-based authentication with secure secrets
   - Protection against session hijacking
   - CSRF protection

3. **API Security**
   - Input validation and sanitization
   - Proper error handling without leaking sensitive information
   - Authorization checks for protected resources

## Next Steps

With Phase 1 (Core Infrastructure) completed, the next phases in the roadmap are:

1. **Phase 2: Core Marketplace Features (Weeks 3-4)**
   - Listing Management and Photo to Post Integration
   - Messaging System enhancements

2. **Phase 3: Transaction and Search Integration (Weeks 5-6)**
   - Transaction Management
   - Search Integration and Mobile Optimization

## Usage Instructions

### Running the Application

1. Set up environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   EMAIL_SERVER_HOST=your_smtp_host
   EMAIL_SERVER_PORT=your_smtp_port
   EMAIL_SERVER_USER=your_smtp_username
   EMAIL_SERVER_PASSWORD=your_smtp_password
   EMAIL_FROM=your_from_email
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

### Running Tests

```
npm test
```

## Conclusion

The implementation of the user authentication system and core API endpoints provides a solid foundation for the Marketplace MVP. These components enable secure user registration, login, and profile management, as well as the core functionality for listings and messaging. The next phases will build upon this foundation to create a complete marketplace experience with the Photo to Post feature integration.
