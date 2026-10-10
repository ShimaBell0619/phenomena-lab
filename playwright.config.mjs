import { defineConfig } from '@playwright/test';
const publicURL = process.env.PUBLIC_URL;
if (publicURL && (!/^dpl_[a-zA-Z0-9]+$/.test(process.env.DEPLOYMENT_ID || '') || !/^[a-f0-9]{40}$/.test(process.env.SOURCE_SHA || ''))) throw new Error('公開検証にはプロバイダー確認済みDeployment IDとsource SHAが必要です。');
if (publicURL && (new URL(publicURL).protocol !== 'https:' || !new URL(publicURL).hostname.endsWith('.vercel.app'))) throw new Error('確認済みVercel HTTPS URLを指定してください。');
export default defineConfig({
  testDir: './tests/e2e', timeout: 45000, expect: { timeout: 5000 }, retries: 0, workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]], outputDir: 'test-results',
  use: { browserName: 'chromium', baseURL: publicURL || 'http://127.0.0.1:4173', reducedMotion: 'reduce', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: publicURL ? undefined : { command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
