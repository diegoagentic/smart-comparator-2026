import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface FigmaWebhookConfig {
  event_type: 'FILE_UPDATE' | 'LIBRARY_PUBLISH' | 'FILE_VERSION_UPDATE' | 'FILE_DELETE' | 'FILE_COMMENT';
  team_id: string;
  passcode: string;
  endpoint: string;
  description?: string;
}

interface FigmaWebhook {
  id: string;
  event_type: string;
  team_id: string;
  endpoint: string;
  status: 'ACTIVE' | 'PAUSED';
  description?: string;
}

const FIGMA_API_URL = 'https://api.figma.com/v2';
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_TEAM_ID = process.env.FIGMA_TEAM_ID;
const WEBHOOK_SECRET = process.env.FIGMA_WEBHOOK_SECRET || 'default-webhook-secret';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

/**
 * Create a Figma webhook
 */
export async function createFigmaWebhook(config: FigmaWebhookConfig): Promise<FigmaWebhook> {
  try {
    const response = await axios.post(
      `${FIGMA_API_URL}/webhooks`,
      config,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Webhook created successfully:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * List all webhooks for a team
 */
export async function listFigmaWebhooks(teamId: string): Promise<FigmaWebhook[]> {
  try {
    const response = await axios.get(
      `${FIGMA_API_URL}/webhooks?team_id=${teamId}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        },
      }
    );

    console.log(`📋 Found ${response.data.webhooks?.length || 0} webhooks`);
    return response.data.webhooks || [];
  } catch (error: any) {
    console.error('❌ Error listing webhooks:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete a webhook
 */
export async function deleteFigmaWebhook(webhookId: string): Promise<void> {
  try {
    await axios.delete(
      `${FIGMA_API_URL}/webhooks/${webhookId}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
        },
      }
    );

    console.log(`🗑️  Webhook ${webhookId} deleted successfully`);
  } catch (error: any) {
    console.error('❌ Error deleting webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update webhook status (pause/resume)
 */
export async function updateWebhookStatus(
  webhookId: string,
  status: 'ACTIVE' | 'PAUSED'
): Promise<void> {
  try {
    await axios.patch(
      `${FIGMA_API_URL}/webhooks/${webhookId}`,
      { status },
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Webhook ${webhookId} status updated to ${status}`);
  } catch (error: any) {
    console.error('❌ Error updating webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Setup all required webhooks for Strata DS
 */
export async function setupStrataWebhooks(): Promise<void> {
  if (!FIGMA_ACCESS_TOKEN) {
    console.error('❌ FIGMA_ACCESS_TOKEN not found in environment variables');
    console.log('\nTo get your Figma access token:');
    console.log('1. Go to https://www.figma.com/developers/api#access-tokens');
    console.log('2. Click "Get personal access token"');
    console.log('3. Add it to your .env file as FIGMA_ACCESS_TOKEN=...\n');
    return;
  }

  if (!FIGMA_TEAM_ID) {
    console.error('❌ FIGMA_TEAM_ID not found in environment variables');
    console.log('\nTo get your Figma team ID:');
    console.log('1. Go to your Figma team page');
    console.log('2. Copy the team ID from the URL (numbers after /team/)');
    console.log('3. Add it to your .env file as FIGMA_TEAM_ID=...\n');
    return;
  }

  console.log('\n🚀 Setting up Strata DS Figma Webhooks...\n');
  console.log(`Team ID: ${FIGMA_TEAM_ID}`);
  console.log(`Webhook Endpoint: ${API_BASE_URL}/v1/webhooks/figma`);
  console.log(`Webhook Secret: ${WEBHOOK_SECRET.substring(0, 10)}...`);
  console.log('\n');

  // Check existing webhooks
  console.log('📋 Checking existing webhooks...');
  const existingWebhooks = await listFigmaWebhooks(FIGMA_TEAM_ID);
  
  // Filter webhooks pointing to our endpoint
  const ourWebhooks = existingWebhooks.filter(w => 
    w.endpoint.includes(API_BASE_URL) || w.endpoint.includes('webhooks/figma')
  );

  if (ourWebhooks.length > 0) {
    console.log(`\n⚠️  Found ${ourWebhooks.length} existing webhook(s) for this endpoint:`);
    ourWebhooks.forEach(w => {
      console.log(`   - ${w.event_type} (${w.status}) - ID: ${w.id}`);
    });

    console.log('\n🗑️  Cleaning up old webhooks...');
    for (const webhook of ourWebhooks) {
      await deleteFigmaWebhook(webhook.id);
    }
  }

  // Create new webhooks
  const webhookConfigs: FigmaWebhookConfig[] = [
    {
      event_type: 'FILE_UPDATE',
      team_id: FIGMA_TEAM_ID,
      passcode: WEBHOOK_SECRET,
      endpoint: `${API_BASE_URL}/v1/webhooks/figma`,
      description: 'Strata DS - File updates',
    },
    {
      event_type: 'LIBRARY_PUBLISH',
      team_id: FIGMA_TEAM_ID,
      passcode: WEBHOOK_SECRET,
      endpoint: `${API_BASE_URL}/v1/webhooks/figma`,
      description: 'Strata DS - Library publish',
    },
    {
      event_type: 'FILE_VERSION_UPDATE',
      team_id: FIGMA_TEAM_ID,
      passcode: WEBHOOK_SECRET,
      endpoint: `${API_BASE_URL}/v1/webhooks/figma`,
      description: 'Strata DS - Version updates',
    },
  ];

  console.log('\n✨ Creating new webhooks...\n');
  
  for (const config of webhookConfigs) {
    try {
      const webhook = await createFigmaWebhook(config);
      console.log(`✅ ${config.event_type} webhook created (ID: ${webhook.id})`);
    } catch (error) {
      console.error(`❌ Failed to create ${config.event_type} webhook`);
    }
  }

  console.log('\n✅ Figma webhook setup complete!\n');
  console.log('📝 Summary:');
  console.log(`   - Endpoint: ${API_BASE_URL}/v1/webhooks/figma`);
  console.log(`   - Events: FILE_UPDATE, LIBRARY_PUBLISH, FILE_VERSION_UPDATE`);
  console.log(`   - Status: ACTIVE`);
  console.log('\n🧪 Test your webhooks by making changes to your Figma files!\n');
}

/**
 * Verify webhook configuration
 */
export async function verifyWebhookSetup(): Promise<void> {
  if (!FIGMA_ACCESS_TOKEN || !FIGMA_TEAM_ID) {
    console.error('❌ Missing required environment variables');
    return;
  }

  console.log('\n🔍 Verifying webhook configuration...\n');

  const webhooks = await listFigmaWebhooks(FIGMA_TEAM_ID);
  const activeWebhooks = webhooks.filter(w => w.status === 'ACTIVE');

  if (activeWebhooks.length === 0) {
    console.log('⚠️  No active webhooks found. Run setup first.');
    return;
  }

  console.log('✅ Active webhooks:');
  activeWebhooks.forEach(w => {
    console.log(`   - ${w.event_type}`);
    console.log(`     Endpoint: ${w.endpoint}`);
    console.log(`     Status: ${w.status}`);
    console.log(`     ID: ${w.id}\n`);
  });
}

// CLI Support
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      setupStrataWebhooks().catch(console.error);
      break;
    case 'list':
      if (FIGMA_TEAM_ID) {
        listFigmaWebhooks(FIGMA_TEAM_ID).catch(console.error);
      } else {
        console.error('❌ FIGMA_TEAM_ID not found');
      }
      break;
    case 'verify':
      verifyWebhookSetup().catch(console.error);
      break;
    case 'delete':
      const webhookId = process.argv[3];
      if (webhookId) {
        deleteFigmaWebhook(webhookId).catch(console.error);
      } else {
        console.error('❌ Please provide webhook ID: npm run webhook delete <webhook-id>');
      }
      break;
    default:
      console.log('\n📚 Figma Webhook CLI\n');
      console.log('Commands:');
      console.log('  setup   - Create all required webhooks');
      console.log('  list    - List all existing webhooks');
      console.log('  verify  - Verify webhook configuration');
      console.log('  delete  - Delete a specific webhook\n');
      console.log('Usage:');
      console.log('  npm run webhook setup');
      console.log('  npm run webhook list');
      console.log('  npm run webhook verify');
      console.log('  npm run webhook delete <webhook-id>\n');
  }
}
