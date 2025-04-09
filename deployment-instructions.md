# Deployment Instructions for Marketplace MVP

This document provides step-by-step instructions for deploying the marketplace MVP with the AI-powered "Photo to Post" feature to both staging and production environments.

## Prerequisites

Before deployment, ensure you have the following:

1. **Vercel Account**: The deployment is configured for Vercel. Ensure you have an account with appropriate permissions.
2. **Environment Variables**: All required environment variables are ready (see Environment Variables section below).
3. **MongoDB Atlas Account**: A MongoDB Atlas cluster for database hosting.
4. **Stripe Account**: For payment processing functionality.
5. **SendGrid Account**: For email notifications.
6. **Cloudinary Account**: For image storage and optimization.
7. **Redis Instance**: For caching (optional for staging, recommended for production).

## Environment Variables

Create a `.env.local` file for local development and configure the following variables in your Vercel project settings for deployment:

```
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
JWT_SECRET=your-jwt-secret

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@your-domain.com

# Stripe
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (optional)
REDIS_URL=redis://username:password@host:port

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Analytics
ANALYTICS_ENABLED=true
```

## Deployment Steps

### 1. Local Testing Before Deployment

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the application
npm run build

# Start the application locally
npm start
```

Verify that the application works correctly in the local environment before proceeding with deployment.

### 2. Staging Deployment

The CI/CD pipeline is configured to automatically deploy to the staging environment when changes are pushed to the `development` branch. To manually deploy to staging:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel
```

### 3. Production Deployment

After testing in the staging environment, deploy to production:

```bash
# Deploy to production
vercel --prod
```

Alternatively, merge your changes to the `main` branch, and the CI/CD pipeline will automatically deploy to production.

### 4. Post-Deployment Verification

After deployment, verify the following:

1. **User Authentication**: Test registration, login, and password reset flows.
2. **Listing Creation**: Test creating listings with and without the Photo to Post feature.
3. **Transactions**: Test the offer and payment processes.
4. **Messaging**: Test the messaging system between users.
5. **Admin Dashboard**: Verify that analytics data is being collected and displayed correctly.

### 5. Database Indexes

Ensure that all required indexes are created in the MongoDB database:

```javascript
// Run this script if indexes are not automatically created
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.listings.createIndex({ userId: 1 });
db.listings.createIndex({ category: 1 });
db.listings.createIndex({ title: "text", description: "text" });
db.messages.createIndex({ conversationId: 1 });
db.offers.createIndex({ listingId: 1 });
db.offers.createIndex({ buyerId: 1 });
db.offers.createIndex({ sellerId: 1 });
```

### 6. Stripe Webhook Configuration

Configure the Stripe webhook to point to your deployed application:

1. Go to the Stripe Dashboard > Developers > Webhooks
2. Add an endpoint with the URL: `https://your-domain.com/api/payments/webhook`
3. Select the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook signing secret and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 7. Monitoring Setup

Set up monitoring to track application performance and errors:

1. **Vercel Analytics**: Enable in the Vercel dashboard
2. **Error Tracking**: Consider integrating Sentry or a similar service
3. **Performance Monitoring**: Set up New Relic or a similar service

### 8. Backup Strategy

Implement a regular backup strategy for the MongoDB database:

1. Configure automated backups in MongoDB Atlas
2. Set up a schedule for backup verification

### 9. Scaling Considerations

As your user base grows, consider the following scaling strategies:

1. **Database Scaling**: Upgrade your MongoDB Atlas cluster as needed
2. **Redis Caching**: Implement Redis caching for frequently accessed data
3. **CDN**: Use a CDN for static assets and images
4. **Serverless Functions**: Optimize serverless function execution

## Rollback Procedure

In case of critical issues after deployment:

1. **Immediate Rollback**: Use Vercel's rollback feature to revert to the previous deployment
2. **Database Rollback**: Restore from the most recent backup if database issues occur
3. **Communication**: Inform users about the issue and expected resolution time

## Troubleshooting Common Issues

### Authentication Issues
- Verify that `NEXTAUTH_URL` is correctly set to your domain
- Check that `NEXTAUTH_SECRET` and `JWT_SECRET` are properly configured

### Payment Processing Issues
- Verify Stripe API keys and webhook configuration
- Check Stripe Dashboard for detailed error messages

### Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits and supported formats

### Performance Issues
- Review server logs for slow database queries
- Check Redis connection if caching is enabled
- Monitor serverless function execution times

## Contact Information

For deployment assistance, contact:
- Technical Support: [Your Support Email]
- Emergency Contact: [Your Emergency Contact]
