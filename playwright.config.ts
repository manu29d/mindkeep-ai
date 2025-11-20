import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    testMatch: ['e2e-*.ts'],
    timeout: 30000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,
    use: {
        baseURL: 'http://localhost:3000',
        browserName: 'chromium',
        headless: true,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
