import { test, expect } from '@playwright/test';

// Test API endpoints for listings
test('Listing API endpoints', async ({ request }) => {
  // Login to get authenticated session
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: 'test@example.com',
      password: 'Password123!'
    }
  });
  
  expect(loginResponse.ok()).toBeTruthy();
  
  // Create a new listing
  const createResponse = await request.post('/api/listings', {
    data: {
      title: 'Test Listing',
      description: 'This is a test listing created by automated tests',
      price: 99.99,
      category: 'Electronics',
      condition: 'good',
      location: 'Test City'
    }
  });
  
  expect(createResponse.ok()).toBeTruthy();
  const listing = await createResponse.json();
  const listingId = listing.listing.id;
  
  // Get the created listing
  const getResponse = await request.get(`/api/listings/${listingId}`);
  expect(getResponse.ok()).toBeTruthy();
  
  // Update the listing
  const updateResponse = await request.put(`/api/listings/${listingId}`, {
    data: {
      title: 'Updated Test Listing',
      price: 89.99
    }
  });
  
  expect(updateResponse.ok()).toBeTruthy();
  
  // Delete the listing
  const deleteResponse = await request.delete(`/api/listings/${listingId}`);
  expect(deleteResponse.ok()).toBeTruthy();
});

// Test API endpoints for messaging
test('Messaging API endpoints', async ({ request }) => {
  // Login to get authenticated session
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: 'test@example.com',
      password: 'Password123!'
    }
  });
  
  expect(loginResponse.ok()).toBeTruthy();
  
  // Get user profile to get user ID
  const profileResponse = await request.get('/api/users/profile');
  expect(profileResponse.ok()).toBeTruthy();
  const profile = await profileResponse.json();
  
  // Create a test user to message
  const registerResponse = await request.post('/api/auth/register', {
    data: {
      name: 'Test Recipient',
      email: `recipient${Date.now()}@example.com`,
      password: 'Password123!',
      phone: '555-123-4567',
      location: 'Test City'
    }
  });
  
  expect(registerResponse.ok()).toBeTruthy();
  const recipient = await registerResponse.json();
  
  // Send a message
  const sendResponse = await request.post('/api/messages', {
    data: {
      receiverId: recipient.user.id,
      content: 'This is a test message'
    }
  });
  
  expect(sendResponse.ok()).toBeTruthy();
  
  // Get conversations
  const conversationsResponse = await request.get('/api/messages/conversations');
  expect(conversationsResponse.ok()).toBeTruthy();
  
  // Get messages
  const messagesResponse = await request.get(`/api/messages?userId=${recipient.user.id}`);
  expect(messagesResponse.ok()).toBeTruthy();
});

// Test user API endpoints
test('User API endpoints', async ({ request }) => {
  // Login to get authenticated session
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: 'test@example.com',
      password: 'Password123!'
    }
  });
  
  expect(loginResponse.ok()).toBeTruthy();
  
  // Get user profile
  const profileResponse = await request.get('/api/users/profile');
  expect(profileResponse.ok()).toBeTruthy();
  
  // Update user profile
  const updateResponse = await request.put('/api/users/profile', {
    data: {
      name: 'Updated Test User',
      phone: '555-987-6543',
      location: 'Updated Test City'
    }
  });
  
  expect(updateResponse.ok()).toBeTruthy();
  
  // Get all users
  const usersResponse = await request.get('/api/users');
  expect(usersResponse.ok()).toBeTruthy();
});
