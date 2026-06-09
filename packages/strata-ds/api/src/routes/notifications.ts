import { Router, Request, Response } from 'express';

const router = Router();

interface Subscription {
  id: string;
  userId: string;
  email?: string;
  webhookUrl?: string;
  slackWebhook?: string;
  events: NotificationEvent[];
  channels: NotificationChannel[];
  components?: string[]; // Filter by specific components
  minSeverity: 'info' | 'warning' | 'critical';
  active: boolean;
  createdAt: string;
}

type NotificationEvent = 
  | 'version.published'
  | 'component.updated'
  | 'component.deprecated'
  | 'breaking.change'
  | 'security.alert';

type NotificationChannel = 'email' | 'webhook' | 'slack' | 'websocket';

interface Notification {
  id: string;
  type: NotificationEvent;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  metadata: any;
  timestamp: string;
  read: boolean;
}

// In-memory stores (in production, use database)
const subscriptions: Subscription[] = [];
const notifications: Notification[] = [];

/**
 * CREATE SUBSCRIPTION
 * Subscribe to notifications
 */
router.post('/subscribe', (req: Request, res: Response) => {
  try {
    const {
      userId,
      email,
      webhookUrl,
      slackWebhook,
      events,
      channels,
      components,
      minSeverity = 'info',
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!channels || channels.length === 0) {
      return res.status(400).json({ error: 'At least one notification channel is required' });
    }

    // Validate channels have required data
    if (channels.includes('email') && !email) {
      return res.status(400).json({ error: 'Email is required for email notifications' });
    }

    if (channels.includes('webhook') && !webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL is required for webhook notifications' });
    }

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      email,
      webhookUrl,
      slackWebhook,
      events: events || [
        'version.published',
        'component.updated',
        'component.deprecated',
        'breaking.change',
        'security.alert',
      ],
      channels,
      components,
      minSeverity,
      active: true,
      createdAt: new Date().toISOString(),
    };

    subscriptions.push(subscription);

    return res.status(201).json({
      success: true,
      subscription,
      message: 'Subscription created successfully',
    });

  } catch (error) {
    console.error('[Subscribe] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET USER SUBSCRIPTIONS
 * Get all subscriptions for a user
 */
router.get('/subscriptions/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;

  const userSubscriptions = subscriptions.filter(s => s.userId === userId);

  return res.json({
    subscriptions: userSubscriptions,
    total: userSubscriptions.length,
  });
});

/**
 * UPDATE SUBSCRIPTION
 * Update subscription settings
 */
router.patch('/subscriptions/:subscriptionId', (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const updates = req.body;

  const subscription = subscriptions.find(s => s.id === subscriptionId);

  if (!subscription) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  // Update subscription
  Object.assign(subscription, updates);

  return res.json({
    success: true,
    subscription,
    message: 'Subscription updated successfully',
  });
});

/**
 * DELETE SUBSCRIPTION
 * Unsubscribe from notifications
 */
router.delete('/subscriptions/:subscriptionId', (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  const index = subscriptions.findIndex(s => s.id === subscriptionId);

  if (index === -1) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  subscriptions.splice(index, 1);

  return res.json({
    success: true,
    message: 'Subscription deleted successfully',
  });
});

/**
 * GET NOTIFICATIONS
 * Get notifications for a user
 */
router.get('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { unreadOnly, limit = 50 } = req.query;

  let userNotifications = notifications.filter(n => {
    // In production, filter by userId from notification metadata
    return true;
  });

  if (unreadOnly === 'true') {
    userNotifications = userNotifications.filter(n => !n.read);
  }

  // Sort by timestamp descending
  userNotifications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Limit results
  userNotifications = userNotifications.slice(0, Number(limit));

  return res.json({
    notifications: userNotifications,
    total: userNotifications.length,
    unread: userNotifications.filter(n => !n.read).length,
  });
});

/**
 * MARK AS READ
 * Mark notification(s) as read
 */
router.post('/mark-read', (req: Request, res: Response) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    return res.status(400).json({ error: 'notificationIds array is required' });
  }

  let markedCount = 0;

  notificationIds.forEach(id => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      markedCount++;
    }
  });

  return res.json({
    success: true,
    markedCount,
    message: `${markedCount} notification(s) marked as read`,
  });
});

/**
 * SEND NOTIFICATION (Internal use)
 * Creates and sends a notification to subscribers
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const {
      type,
      severity,
      title,
      message,
      metadata,
    } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'type, title, and message are required' });
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: severity || 'info',
      title,
      message,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      read: false,
    };

    notifications.push(notification);

    // Find matching subscriptions
    const matchingSubscriptions = subscriptions.filter(sub => {
      if (!sub.active) return false;
      if (!sub.events.includes(type)) return false;
      
      // Check severity level
      const severityLevels = ['info', 'warning', 'critical'];
      const notifSeverityLevel = severityLevels.indexOf(notification.severity);
      const subMinSeverityLevel = severityLevels.indexOf(sub.minSeverity);
      
      if (notifSeverityLevel < subMinSeverityLevel) return false;

      // Check component filter
      if (sub.components && metadata.componentId) {
        return sub.components.includes(metadata.componentId);
      }

      return true;
    });

    // Send to each channel
    const deliveryResults = await Promise.all(
      matchingSubscriptions.map(sub => deliverNotification(notification, sub))
    );

    return res.json({
      success: true,
      notification,
      delivered: deliveryResults.filter(r => r.success).length,
      failed: deliveryResults.filter(r => !r.success).length,
    });

  } catch (error) {
    console.error('[Send Notification] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET NOTIFICATION PREFERENCES
 * Get recommended notification settings
 */
router.get('/preferences/recommended', (req: Request, res: Response) => {
  const recommendations = {
    forDevelopers: {
      events: ['component.updated', 'breaking.change', 'security.alert'],
      channels: ['webhook', 'email'],
      minSeverity: 'warning',
    },
    forDesigners: {
      events: ['version.published', 'component.updated', 'component.deprecated'],
      channels: ['slack', 'email'],
      minSeverity: 'info',
    },
    forAIAgents: {
      events: ['component.updated', 'version.published', 'component.deprecated'],
      channels: ['webhook'],
      minSeverity: 'info',
    },
  };

  return res.json(recommendations);
});

// Helper Functions

async function deliverNotification(
  notification: Notification,
  subscription: Subscription
): Promise<{ success: boolean; channel: string; error?: string }> {
  const results: any[] = [];

  for (const channel of subscription.channels) {
    try {
      switch (channel) {
        case 'email':
          await sendEmail(subscription.email!, notification);
          results.push({ success: true, channel: 'email' });
          break;

        case 'webhook':
          await sendWebhook(subscription.webhookUrl!, notification);
          results.push({ success: true, channel: 'webhook' });
          break;

        case 'slack':
          await sendSlack(subscription.slackWebhook!, notification);
          results.push({ success: true, channel: 'slack' });
          break;

        case 'websocket':
          await sendWebSocket(subscription.userId, notification);
          results.push({ success: true, channel: 'websocket' });
          break;
      }
    } catch (error) {
      console.error(`[Delivery Error] ${channel}:`, error);
      results.push({ 
        success: false, 
        channel, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return results[0] || { success: false, channel: 'unknown' };
}

async function sendEmail(email: string, notification: Notification): Promise<void> {
  console.log(`[Email] Sending to ${email}: ${notification.title}`);
  // In production, use email service (SendGrid, AWS SES, etc.)
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function sendWebhook(url: string, notification: Notification): Promise<void> {
  console.log(`[Webhook] Posting to ${url}: ${notification.title}`);
  
  // In production, use actual HTTP POST
  // const response = await fetch(url, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(notification),
  // });
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function sendSlack(webhookUrl: string, notification: Notification): Promise<void> {
  console.log(`[Slack] Posting to webhook: ${notification.title}`);
  
  const slackMessage = {
    text: notification.title,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: notification.title,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: notification.message,
        },
      },
    ],
  };

  // In production, use actual Slack webhook
  // await fetch(webhookUrl, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(slackMessage),
  // });
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function sendWebSocket(userId: string, notification: Notification): Promise<void> {
  console.log(`[WebSocket] Sending to user ${userId}: ${notification.title}`);
  
  // In production, use WebSocket server
  // wsServer.sendToUser(userId, notification);
  
  await new Promise(resolve => setTimeout(resolve, 100));
}

export default router;
