import express from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { cache } from '../lib/redis.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load decision tree
let decisionTree = null;
try {
  const treePath = resolve(__dirname, '../data/bro-decision-tree.json');
  decisionTree = JSON.parse(readFileSync(treePath, 'utf8'));
} catch (error) {
  console.error('[BRO] Failed to load decision tree:', error);
  // Create a simple fallback decision tree
  decisionTree = {
    nodes: {
      welcome: {
        id: 'welcome',
        triggers: ['home-welcome', 'default'],
        message: {
          en: 'Hey there! 👋 I\'m Bro, your coding companion. Ready to level up your skills?',
          bn: 'হেই! 👋 আমি ব্রো, তোমার কোডিং সঙ্গী। তোমার দক্ষতা বাড়ানোর জন্য প্রস্তুত?',
          hi: 'हे वहाँ! 👋 मैं ब्रो हूँ, आपका कोडिंग साथी। अपने कौशल को बढ़ाने के लिए तैयार हैं?'
        },
        options: [
          {
            text: { en: 'Start Learning', bn: 'শেখা শুরু করো', hi: 'सीखना शुरू करें' },
            action: 'navigate',
            target: '/learning'
          },
          {
            text: { en: 'View Progress', bn: 'অগ্রগতি দেখো', hi: 'प्रगति देखें' },
            action: 'navigate',
            target: '/dashboard'
          },
          {
            text: { en: 'Maybe Later', bn: 'পরে হবে', hi: 'बाद में' },
            action: 'close'
          }
        ]
      }
    },
    settings: {
      cooldown_minutes: 30,
      max_daily_interactions: 10,
      animation_duration: 300
    }
  };
}

// Get Bro response based on trigger and context
router.post('/trigger', optionalAuth, async (req, res) => {
  const { trigger, context = {}, language = 'en' } = req.body;
  
  // Check if user is authenticated
  const isAuthenticated = req.user && req.user.id;
  const userId = isAuthenticated ? req.user.id : 'anonymous';
  
  try {
    // Check cooldown
    const cooldownKey = `bro:cooldown:${userId}`;
    const lastInteraction = await cache.get(cooldownKey);
    const cooldownMinutes = decisionTree.settings.cooldown_minutes || 30;
    
    if (lastInteraction) {
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      const cooldownMs = cooldownMinutes * 60 * 1000;
      
      if (timeSinceLastInteraction < cooldownMs) {
        return res.json({ 
          show: false, 
          reason: 'cooldown',
          nextAvailable: lastInteraction + cooldownMs
        });
      }
    }
    
    // Check daily interaction limit
    const dailyKey = `bro:daily:${userId}:${new Date().toDateString()}`;
    const dailyCount = await cache.get(dailyKey) || 0;
    const maxDaily = decisionTree.settings.max_daily_interactions || 10;
    
    if (dailyCount >= maxDaily) {
      return res.json({ 
        show: false, 
        reason: 'daily_limit',
        limit: maxDaily
      });
    }
    
    // Find appropriate node based on trigger
    let targetNode = null;
    
    for (const [nodeId, node] of Object.entries(decisionTree.nodes)) {
      if (node.triggers.includes(trigger)) {
        targetNode = node;
        break;
      }
    }
    
    // Default to welcome if no specific trigger found
    if (!targetNode && decisionTree.nodes.welcome) {
      targetNode = decisionTree.nodes.welcome;
    }
    
    if (!targetNode) {
      return res.json({ show: false, reason: 'no_content' });
    }
    
    // Process message with context variables
    let message = targetNode.message[language] || targetNode.message.en || '';
    
    // Replace context variables in message
    for (const [key, value] of Object.entries(context)) {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    
    // Process options
    const options = targetNode.options.map(option => ({
      ...option,
      text: option.text[language] || option.text.en || option.text
    }));
    
    // Update interaction tracking
    await cache.set(cooldownKey, Date.now(), cooldownMinutes * 60);
    await cache.set(dailyKey, dailyCount + 1, 24 * 60 * 60);
    
    // Log interaction for analytics
    console.log(`[BRO] User ${userId} triggered '${trigger}' -> node '${targetNode.id}'`);
    
    res.json({
      show: true,
      node: targetNode.id,
      message,
      options,
      settings: {
        animation_duration: decisionTree.settings.animation_duration || 300
      }
    });
    
  } catch (error) {
    console.error('[BRO ERROR]', error);
    res.status(500).json({ error: 'Bro is taking a break' });
  }
});

// Handle Bro action (when user clicks an option)
router.post('/action', optionalAuth, async (req, res) => {
  const { action, target, nextNode, context = {} } = req.body;
  const userId = req.user ? req.user.id : 'anonymous';
  
  try {
    // Log action for analytics
    console.log(`[BRO] User ${userId} performed action '${action}' -> ${target || nextNode}`);
    
    let response = { success: true };
    
    switch (action) {
      case 'navigate':
        response.navigate = target;
        break;
        
      case 'continue_course':
        // Logic to find next module
        response.navigate = '/learning';
        break;
        
      case 'start_quiz':
        // Logic to start quiz
        response.navigate = '/quiz';
        break;
        
      case 'close':
        response.close = true;
        break;
        
      default:
        response.message = 'Action completed';
    }
    
    // If there's a next node, prepare it
    if (nextNode && decisionTree.nodes[nextNode]) {
      const node = decisionTree.nodes[nextNode];
      const language = context.language || 'en';
      
      let message = node.message[language] || node.message.en || '';
      
      // Replace context variables
      for (const [key, value] of Object.entries(context)) {
        message = message.replace(new RegExp(`{${key}}`, 'g'), value);
      }
      
      response.nextNode = {
        id: node.id,
        message,
        options: node.options.map(option => ({
          ...option,
          text: option.text[language] || option.text.en || option.text
        }))
      };
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('[BRO ACTION ERROR]', error);
    res.status(500).json({ error: 'Action failed' });
  }
});

// Get decision tree (for admin)
router.get('/tree', requireAuth, async (req, res) => {
  // Only allow admin access
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  res.json(decisionTree);
});

export default router;
