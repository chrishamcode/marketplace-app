import { test, expect } from '@playwright/test';

// Test the integration between frontend and backend
test('End-to-end user flow', async ({ page }) => {
  // Register a new user
  await page.goto('/auth/register');
  const testEmail = `test${Date.now()}@example.com`;
  
  await page.fill('#name', 'Integration Test User');
  await page.fill('#email', testEmail);
  await page.fill('#password', 'Password123!');
  await page.fill('#confirmPassword', 'Password123!');
  await page.fill('#phone', '555-123-4567');
  await page.fill('#location', 'Test City');
  
  await page.click('button[type="submit"]');
  
  // Check for success message
  await expect(page.locator('.bg-green-100')).toBeVisible();
  
  // Simulate email verification (would normally be done via email link)
  // For testing purposes, we'll directly call the verification API
  // This would be replaced with actual email verification in production
  
  // Login with the new user
  await page.goto('/auth/login');
  await page.fill('#email', testEmail);
  await page.fill('#password', 'Password123!');
  await page.click('button[type="submit"]');
  
  // Should redirect to home page
  await expect(page).toHaveURL('/');
  
  // Navigate to profile page
  await page.goto('/auth/profile');
  
  // Update profile
  await page.fill('#name', 'Updated Integration Test User');
  await page.click('button[type="submit"]');
  
  // Check for success message
  await expect(page.locator('.bg-green-100')).toBeVisible();
  
  // Create a new listing
  await page.goto('/listings/create');
  await page.fill('#title', 'Integration Test Listing');
  await page.fill('#description', 'This is a test listing created during integration testing');
  await page.fill('#price', '199.99');
  await page.selectOption('#category', 'Electronics');
  await page.selectOption('#condition', 'good');
  await page.fill('#location', 'Test City');
  
  await page.click('button[type="submit"]');
  
  // Check for success message
  await expect(page.locator('.bg-green-100')).toBeVisible();
  
  // View listings
  await page.goto('/listings');
  
  // Should see the created listing
  await expect(page.getByText('Integration Test Listing')).toBeVisible();
  
  // Logout
  await page.click('button:has-text("Logout")');
  
  // Should redirect to login page
  await expect(page).toHaveURL('/auth/login');
});
