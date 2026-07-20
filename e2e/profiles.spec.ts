import { test, expect } from '@playwright/test';

// We test a hypothetical "test-slug" to ensure the page structure loads without crashing.
// Even if it shows a "404 Not Found" UI, it means the app router and page template didn't throw a 500 server error.

const profiles = [
  { name: 'Customer/User Profile', url: '/profile' }, // often requires auth, but we just check it doesn't crash
  { name: 'Weaver Profile', url: '/weaver/test-slug' },
  { name: 'Store Profile', url: '/store/test-slug' },
  { name: 'Wholesaler (B2B) Profile', url: '/wholesaler/test-slug' },
  { name: 'Supplier Profile', url: '/supplier/test-slug' },
  { name: 'Reseller Profile', url: '/reseller/test-slug' },
];

test.describe('Profile Pages Smoke Tests', () => {
  for (const profile of profiles) {
    test(`should load ${profile.name} without a 500 error`, async ({ page }) => {
      // Go to the profile page
      const response = await page.goto(profile.url);
      
      // We expect the page to load (status 200) or maybe 404 (Not Found) if slug is fake.
      // We just want to ensure it's not a 500 Internal Server Error.
      expect(response?.status()).not.toBe(500);

      // Verify the page has a title (Next.js default or custom)
      const title = await page.title();
      expect(title).toBeDefined();
    });
  }
});
