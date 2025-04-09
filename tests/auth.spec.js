import { test, expect } from '@playwright/test';

// Test user registration flow
test('User registration flow', async ({ page }) => {
  // Navigate to registration page
  await page.goto('/auth/register');
  
  // Fill out registration form
  await page.fill('#name', 'Test User');
  await page.fill('#email', `test${Date.now()}@example.com`);
  await page.fill('#password', 'Password123!');
  await page.fill('#confirmPassword', 'Password123!');
  await page.fill('#phone', '555-123-4567');
  await page.fill('#location', 'Test City');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Check for success message
  await expect(page.locator('.bg-green-100')).toBeVisible();
  await expect(page.locator('.bg-green-100')).toContainText('Registration successful');
});

// Test login functionality
test('User login flow', async ({ page }) => {
  // Navigate to login page
  await page.goto('/auth/login');
  
  // Fill out login form with test credentials
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'Password123!');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Check for successful redirect to home page
  await expect(page).toHaveURL('/');
});

// Test password reset flow
test('Password reset flow', async ({ page }) => {
  // Navigate to forgot password page
  await page.goto('/auth/forgot-password');
  
  // Fill out forgot password form
  await page.fill('#email', 'test@example.com');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Check for success message
  await expect(page.locator('.bg-green-100')).toBeVisible();
  await expect(page.locator('.bg-green-100')).toContainText('password reset link has been sent');
});

// Test profile management
test('Profile management', async ({ page }) => {
  // Login first
  await page.goto('/auth/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'Password123!');
  await page.click('button[type="submit"]');
  
  // Navigate to profile page
  await page.goto('/auth/profile');
  
  // Update profile information
  await page.fill('#name', 'Updated Test User');
  await page.fill('#phone', '555-987-6543');
  await page.fill('#location', 'Updated Test City');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Check for success message
  await expect(page.locator('.bg-green-100')).toBeVisible();
  await expect(page.locator('.bg-green-100')).toContainText('Profile updated successfully');
});

// Test protected routes
test('Protected routes redirect unauthenticated users', async ({ page }) => {
  // Try to access protected page without authentication
  await page.goto('/auth/profile');
  
  // Should redirect to login page
  await expect(page).toHaveURL('/auth/login');
});

// Test API endpoints
test('API endpoints return proper responses', async ({ request }) => {
  // Test public endpoint
  const publicResponse = await request.get('/api/listings');
  expect(publicResponse.ok()).toBeTruthy();
  
  // Test protected endpoint without authentication
  const protectedResponse = await request.get('/api/users/profile');
  expect(protectedResponse.status()).toBe(401);
});
