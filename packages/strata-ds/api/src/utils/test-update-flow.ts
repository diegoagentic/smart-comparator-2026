import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_VERSION = process.env.API_VERSION || 'v1';
const API_KEY = process.env.MASTER_API_KEY || 'test-api-key';
const WEBHOOK_SECRET = process.env.FIGMA_WEBHOOK_SECRET || 'test-webhook-secret';

const API_URL = `${API_BASE_URL}/${API_VERSION}`;

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Utility to measure execution time
 */
async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return { result, duration };
}

/**
 * Test API health
 */
async function testHealth(): Promise<TestResult> {
  try {
    const { result, duration } = await measureTime(async () => {
      return axios.get(`${API_BASE_URL}/health`);
    });

    return {
      name: '1. Health Check',
      success: result.status === 200,
      duration,
      data: result.data,
    };
  } catch (error: any) {
    return {
      name: '1. Health Check',
      success: false,
      duration: 0,
      error: error.message,
    };
  }
}

/**
 * Test manual component update
 */
async function testManualUpdate(): Promise<TestResult> {
  try {
    const componentData = {
      componentId: 'test-button-primary',
      componentData: {
        name: 'Primary Button',
        description: 'A primary action button component',
        version: '1.0.0',
        category: 'buttons',
        variants: ['default', 'hover', 'active', 'disabled'],
        props: {
          size: ['sm', 'md', 'lg'],
          variant: ['solid', 'outline', 'ghost'],
        },
        code: {
          react: 'export function PrimaryButton() { return <button>Click me</button>; }',
          html: '<button class="btn-primary">Click me</button>',
          css: '.btn-primary { background: #000; color: #fff; padding: 8px 16px; }',
        },
      },
      changeType: 'create',
      description: 'Test: Creating primary button component',
    };

    const { result, duration } = await measureTime(async () => {
      return axios.post(
        `${API_URL}/webhooks/manual-update`,
        componentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );
    });

    return {
      name: '2. Manual Component Update',
      success: result.data.success === true,
      duration,
      data: {
        eventId: result.data.eventId,
        message: result.data.message,
      },
    };
  } catch (error: any) {
    return {
      name: '2. Manual Component Update',
      success: false,
      duration: 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Test AI-generated component
 */
async function testAIUpdate(): Promise<TestResult> {
  try {
    const aiData = {
      prompt: 'Create a success alert component with icon and close button',
      generatedComponent: {
        name: 'SuccessAlert',
        description: 'Success alert component with green theme',
        code: {
          react: `export function SuccessAlert({ message, onClose }) {
  return (
    <div className="alert-success">
      <CheckIcon />
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}`,
          html: `<div class="alert alert-success">
  <svg class="icon">...</svg>
  <span>Success message</span>
  <button class="close">×</button>
</div>`,
          css: `.alert-success {
  background: #dcfce7;
  color: #166534;
  padding: 12px 16px;
  border-radius: 6px;
}`,
        },
      },
      componentId: null, // New component
    };

    const { result, duration } = await measureTime(async () => {
      return axios.post(
        `${API_URL}/webhooks/ai-update`,
        aiData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );
    });

    return {
      name: '3. AI-Generated Component',
      success: result.data.success === true,
      duration,
      data: {
        eventId: result.data.eventId,
        message: result.data.message,
      },
    };
  } catch (error: any) {
    return {
      name: '3. AI-Generated Component',
      success: false,
      duration: 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Test Figma webhook (simulated)
 */
async function testFigmaWebhook(): Promise<TestResult> {
  try {
    const webhookPayload = {
      event_type: 'FILE_UPDATE',
      file_key: 'test-file-123',
      file_name: 'Strata DS Components',
      timestamp: new Date().toISOString(),
      triggered_by: {
        id: 'test-user-123',
        handle: 'test.user@example.com',
      },
    };

    // Generate signature
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(JSON.stringify(webhookPayload))
      .digest('hex');

    const { result, duration } = await measureTime(async () => {
      return axios.post(
        `${API_URL}/webhooks/figma`,
        webhookPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-figma-signature': signature,
          },
        }
      );
    });

    return {
      name: '4. Figma Webhook (Simulated)',
      success: result.data.success === true,
      duration,
      data: {
        eventId: result.data.eventId,
        message: result.data.message,
      },
    };
  } catch (error: any) {
    return {
      name: '4. Figma Webhook (Simulated)',
      success: false,
      duration: 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Test event history retrieval
 */
async function testEventHistory(): Promise<TestResult> {
  try {
    const { result, duration } = await measureTime(async () => {
      return axios.get(`${API_URL}/webhooks/events?limit=10`, {
        headers: {
          'x-api-key': API_KEY,
        },
      });
    });

    return {
      name: '5. Event History',
      success: result.status === 200,
      duration,
      data: {
        totalEvents: result.data.total,
        events: result.data.events.map((e: any) => ({
          id: e.id,
          type: e.type,
          source: e.source,
          timestamp: e.timestamp,
        })),
      },
    };
  } catch (error: any) {
    return {
      name: '5. Event History',
      success: false,
      duration: 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Test version creation
 */
async function testVersionCreation(): Promise<TestResult> {
  try {
    const versionData = {
      version: '1.0.0',
      changelog: [
        {
          id: 'cl_001',
          type: 'added',
          componentName: 'Primary Button',
          description: 'Added primary button component',
          impact: 'minor',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'cl_002',
          type: 'added',
          componentName: 'Success Alert',
          description: 'Added success alert component',
          impact: 'minor',
          timestamp: new Date().toISOString(),
        },
      ],
      breakingChanges: [],
      deprecations: [],
    };

    const { result, duration } = await measureTime(async () => {
      return axios.post(
        `${API_URL}/versions`,
        versionData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );
    });

    return {
      name: '6. Version Creation',
      success: result.data.success === true,
      duration,
      data: {
        version: result.data.version?.version,
        status: result.data.version?.status,
      },
    };
  } catch (error: any) {
    return {
      name: '6. Version Creation',
      success: false,
      duration: 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Test version retrieval
 */
async function testVersionRetrieval(): Promise<TestResult> {
  try {
    const { result, duration } = await measureTime(async () => {
      return axios.get(`${API_URL}/versions`, {
        headers: {
          'x-api-key': API_KEY,
        },
      });
    });

    return {
      name: '7. Version Retrieval',
      success: result.status === 200,
      duration,
      data: {
        totalVersions: result.data.total,
        latestVersion: result.data.latest?.version,
      },
    };
  } catch (error: any) {
    return {
      name: '7. Version Retrieval',
      success: false,
      duration: 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Test notification subscription
 */
async function testNotificationSubscription(): Promise<TestResult> {
  try {
    const subscriptionData = {
      userId: 'test-user-123',
      email: 'developer@example.com',
      channels: ['email'],
      events: ['version.published', 'component.updated', 'breaking.change'],
      minSeverity: 'info',
    };

    const { result, duration } = await measureTime(async () => {
      return axios.post(
        `${API_URL}/notifications/subscribe`,
        subscriptionData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );
    });

    return {
      name: '8. Notification Subscription',
      success: result.data.success === true,
      duration,
      data: {
        subscriptionId: result.data.subscription?.id,
        channels: result.data.subscription?.channels,
      },
    };
  } catch (error: any) {
    return {
      name: '8. Notification Subscription',
      success: false,
      duration: 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Test update check
 */
async function testUpdateCheck(): Promise<TestResult> {
  try {
    const updateCheckData = {
      currentVersion: '0.9.0',
      components: ['button', 'alert', 'modal'],
    };

    const { result, duration } = await measureTime(async () => {
      return axios.post(
        `${API_URL}/versions/check-updates`,
        updateCheckData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );
    });

    return {
      name: '9. Update Check',
      success: result.status === 200,
      duration,
      data: {
        hasUpdate: result.data.hasUpdate,
        currentVersion: result.data.currentVersion,
        latestVersion: result.data.latestVersion,
      },
    };
  } catch (error: any) {
    return {
      name: '9. Update Check',
      success: false,
      duration: 0,
      error: error.response?.data?.error || error.message,
    };
  }
}

/**
 * Print test results
 */
function printResults() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                  STRATA DS UPDATE FLOW TEST RESULTS                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'PASS' : 'FAIL';
    
    console.log(`${icon} ${result.name} - ${status} (${result.duration}ms)`);
    
    if (result.success && result.data) {
      console.log(`   Data:`, JSON.stringify(result.data, null, 2).split('\n').join('\n   '));
    }
    
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    console.log('');
  });

  console.log('─────────────────────────────────────────────────────────────────────────');
  console.log(`\n📊 Summary:`);
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log(`   Total Duration: ${totalDuration}ms`);
  console.log(`   Success Rate: ${((passed / results.length) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Your update flow is working perfectly.\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n🚀 Starting Strata DS Update Flow Tests...\n');
  console.log(`API URL: ${API_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);
  console.log('\n');

  // Run tests sequentially
  results.push(await testHealth());
  results.push(await testManualUpdate());
  results.push(await testAIUpdate());
  results.push(await testFigmaWebhook());
  results.push(await testEventHistory());
  results.push(await testVersionCreation());
  results.push(await testVersionRetrieval());
  results.push(await testNotificationSubscription());
  results.push(await testUpdateCheck());

  // Print results
  printResults();

  // Exit with appropriate code
  const allPassed = results.every(r => r.success);
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
