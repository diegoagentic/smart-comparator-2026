import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// Store for active WebSocket connections (will be managed by WebSocket server)
interface WebhookEvent {
  id: string;
  type: 'component.created' | 'component.updated' | 'component.deleted' | 'version.published';
  timestamp: string;
  data: any;
  source: 'figma' | 'manual' | 'ai-prompt';
  versionChange?: 'major' | 'minor' | 'patch';
}

// In-memory event store (in production, use Redis or database)
const eventHistory: WebhookEvent[] = [];

/**
 * FIGMA WEBHOOK ENDPOINT
 * Receives updates when Figma files are modified
 * Documentation: https://www.figma.com/developers/api#webhooks
 */
router.post('/figma', async (req: Request, res: Response) => {
  try {
    // Verify Figma webhook signature
    const signature = req.headers['x-figma-signature'] as string;
    const webhookSecret = process.env.FIGMA_WEBHOOK_SECRET || 'your-webhook-secret';
    
    if (!verifyFigmaSignature(req.body, signature, webhookSecret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { event_type, file_key, file_name, timestamp, triggered_by } = req.body;

    console.log(`[Figma Webhook] Event: ${event_type}, File: ${file_name} (${file_key})`);

    // Process different event types
    let webhookEvent: WebhookEvent;
    
    switch (event_type) {
      case 'FILE_UPDATE':
        webhookEvent = {
          id: generateEventId(),
          type: 'component.updated',
          timestamp: new Date(timestamp).toISOString(),
          source: 'figma',
          data: {
            fileKey: file_key,
            fileName: file_name,
            triggeredBy: triggered_by,
          },
          versionChange: determineVersionChange(req.body),
        };
        break;

      case 'FILE_VERSION_UPDATE':
        webhookEvent = {
          id: generateEventId(),
          type: 'version.published',
          timestamp: new Date(timestamp).toISOString(),
          source: 'figma',
          data: {
            fileKey: file_key,
            fileName: file_name,
            version: req.body.version_id,
          },
        };
        break;

      case 'LIBRARY_PUBLISH':
        webhookEvent = {
          id: generateEventId(),
          type: 'component.updated',
          timestamp: new Date(timestamp).toISOString(),
          source: 'figma',
          data: {
            fileKey: file_key,
            fileName: file_name,
            publishedComponents: req.body.published_components,
          },
          versionChange: 'minor', // Library publish is typically a minor version
        };
        break;

      default:
        return res.status(200).json({ message: 'Event type not handled' });
    }

    // Store event
    eventHistory.push(webhookEvent);

    // Trigger processing pipeline
    await processFigmaUpdate(webhookEvent);

    // Broadcast to connected clients (WebSocket)
    broadcastEvent(webhookEvent);

    return res.status(200).json({
      success: true,
      eventId: webhookEvent.id,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('[Figma Webhook] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * MANUAL UPDATE ENDPOINT
 * For updates made through Figma Make or admin panel
 */
router.post('/manual-update', async (req: Request, res: Response) => {
  try {
    const { componentId, componentData, changeType, description } = req.body;

    if (!componentId || !componentData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const webhookEvent: WebhookEvent = {
      id: generateEventId(),
      type: changeType === 'create' ? 'component.created' : 'component.updated',
      timestamp: new Date().toISOString(),
      source: 'manual',
      data: {
        componentId,
        componentData,
        description,
      },
      versionChange: determineVersionChangeFromData(componentData),
    };

    // Store event
    eventHistory.push(webhookEvent);

    // Trigger processing pipeline
    await processManualUpdate(webhookEvent);

    // Broadcast to connected clients
    broadcastEvent(webhookEvent);

    return res.status(200).json({
      success: true,
      eventId: webhookEvent.id,
      message: 'Update processed successfully',
    });

  } catch (error) {
    console.error('[Manual Update] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * AI PROMPT UPDATE ENDPOINT
 * For updates created through AI prompts
 */
router.post('/ai-update', async (req: Request, res: Response) => {
  try {
    const { prompt, generatedComponent, componentId } = req.body;

    if (!generatedComponent) {
      return res.status(400).json({ error: 'Missing generated component' });
    }

    const webhookEvent: WebhookEvent = {
      id: generateEventId(),
      type: componentId ? 'component.updated' : 'component.created',
      timestamp: new Date().toISOString(),
      source: 'ai-prompt',
      data: {
        componentId,
        prompt,
        generatedComponent,
      },
      versionChange: componentId ? 'patch' : 'minor', // New component = minor, update = patch
    };

    // Store event
    eventHistory.push(webhookEvent);

    // Trigger processing pipeline
    await processAIUpdate(webhookEvent);

    // Broadcast to connected clients
    broadcastEvent(webhookEvent);

    return res.status(200).json({
      success: true,
      eventId: webhookEvent.id,
      message: 'AI update processed successfully',
    });

  } catch (error) {
    console.error('[AI Update] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET EVENT HISTORY
 * Retrieve webhook event history
 */
router.get('/events', (req: Request, res: Response) => {
  const { source, type, limit = 50 } = req.query;

  let filtered = [...eventHistory];

  if (source) {
    filtered = filtered.filter(e => e.source === source);
  }

  if (type) {
    filtered = filtered.filter(e => e.type === type);
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Limit results
  filtered = filtered.slice(0, Number(limit));

  return res.json({
    events: filtered,
    total: filtered.length,
  });
});

// Helper Functions

function verifyFigmaSignature(payload: any, signature: string, secret: string): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const payloadString = JSON.stringify(payload);
  const expectedSignature = hmac.update(payloadString).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function determineVersionChange(data: any): 'major' | 'minor' | 'patch' {
  // Logic to determine version change based on Figma data
  // In production, analyze component changes to determine impact
  
  // For now, default to patch
  return 'patch';
}

function determineVersionChangeFromData(componentData: any): 'major' | 'minor' | 'patch' {
  // Analyze component changes
  const hasBreakingChange = componentData.breakingChange || false;
  const hasNewFeature = componentData.newFeature || false;

  if (hasBreakingChange) return 'major';
  if (hasNewFeature) return 'minor';
  return 'patch';
}

async function processFigmaUpdate(event: WebhookEvent): Promise<void> {
  console.log(`[Processing] Figma update: ${event.id}`);
  
  // 1. Fetch latest component data from Figma API
  // 2. Parse and normalize component structure
  // 3. Update component database
  // 4. Generate changelog entry
  // 5. Create new version if needed
  // 6. Trigger CDN invalidation
  
  // Placeholder for actual implementation
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function processManualUpdate(event: WebhookEvent): Promise<void> {
  console.log(`[Processing] Manual update: ${event.id}`);
  
  // 1. Validate component data
  // 2. Update component database
  // 3. Generate changelog entry
  // 4. Create new version
  // 5. Trigger CDN invalidation
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function processAIUpdate(event: WebhookEvent): Promise<void> {
  console.log(`[Processing] AI update: ${event.id}`);
  
  // 1. Validate generated component
  // 2. Run quality checks
  // 3. Update component database
  // 4. Generate changelog entry
  // 5. Create new version
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

function broadcastEvent(event: WebhookEvent): void {
  // This will be implemented with WebSocket server
  console.log(`[Broadcast] Event ${event.id} to connected clients`);
  
  // Placeholder - actual implementation will use ws library
  // wsServer.clients.forEach(client => {
  //   client.send(JSON.stringify(event));
  // });
}

export default router;
