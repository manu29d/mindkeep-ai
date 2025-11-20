import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

test.describe.configure({ mode: 'serial' });

test.describe('MindKeep AI End-to-End', () => {
    let page: any;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        // Sign up flow
        await page.goto(`${BASE_URL}/auth/signup`);
        const uniqueId = Date.now();
        // Use incremental integer for email suffix
        const emailCounter = (global as any).__testEmailCounter || 1;
        (global as any).__testEmailCounter = emailCounter + 1;
        const email = `test${emailCounter}@example.com`;
        await page.getByPlaceholder('Full Name').fill(`Test User ${uniqueId}`);
        await page.getByPlaceholder('Email').fill(email);
        await page.getByPlaceholder('Password').fill('password123');
        await page.getByRole('button', { name: /sign up/i }).click();
        
        // Wait for redirection to dashboard
        await page.waitForURL(`${BASE_URL}/dashboard`);

        // Upgrade user to ENTERPRISE to enable all features
        await prisma.user.update({
            where: { email },
            data: { tier: 'ENTERPRISE' }
        });

        // Reload to refresh session with new tier
        await page.reload();
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('Create a new category', async () => {
        await page.getByRole('button', { name: /new category/i }).click();
        await page.getByPlaceholder('Category Name (e.g., Marketing Launch)').fill('Test Category');
        await page.getByRole('button', { name: /create category/i }).click();
        await expect(page.getByText('Test Category')).toBeVisible();
    });

    test('Create a todo in a category', async () => {
        // Assumes 'Test Category' exists
        const categoryColumn = page.locator('div').filter({ hasText: 'Test Category' }).first();
        await categoryColumn.getByRole('button', { name: /add a task/i }).click();
        
        await page.getByPlaceholder('Task title').fill('Test Todo');
        await page.getByRole('button', { name: /done/i }).click();
        
        await expect(page.getByText('Test Todo')).toBeVisible();
    });

    test('Create a team', async () => {
        // Click the plus button next to "Teams" in sidebar
        // We look for the div containing "Teams" and the button
        await page.locator('div').filter({ hasText: /^Teams$/ }).getByRole('button').click();
        
        await page.getByPlaceholder('New Team Name').fill('Test Team');
        // Click the plus button next to the input
        await page.getByPlaceholder('New Team Name').locator('xpath=following-sibling::button').click();
        
        await expect(page.getByText('Test Team')).toBeVisible();
        
        // Close the modal
        await page.locator('.fixed.inset-0').first().click({ position: { x: 10, y: 10 } });
    });

    test('Assign category to team', async () => {
        // Open Edit Category Modal
        const categoryHeader = page.locator('div').filter({ hasText: 'Test Category' }).first();
        // Hover to show menu button
        await categoryHeader.hover();
        // Click menu button (MoreHorizontal)
        await categoryHeader.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first().click();
        // Click "Edit Details"
        await page.getByText('Edit Details').click();
        
        // Select Team
        await page.getByRole('combobox').selectOption({ label: 'Test Team' });
        await page.getByRole('button', { name: /close & save/i }).click();
        
        // Verify assignment (Team name appears in category header)
        await expect(page.getByText('TEST TEAM')).toBeVisible();
    });
});
