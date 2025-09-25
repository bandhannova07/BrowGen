import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { PostHog } from 'posthog-node';

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
  console.log('[ANALYTICS] Sentry initialized');
}

// Initialize PostHog
let posthogClient = null;
if (process.env.POSTHOG_API_KEY) {
  posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  });
  console.log('[ANALYTICS] PostHog initialized');
}

// Analytics helper functions
export const analytics = {
  // Track events
  track(userId, event, properties = {}) {
    if (posthogClient) {
      posthogClient.capture({
        distinctId: userId,
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV
        }
      });
    }
    
    // Also log for debugging
    console.log(`[ANALYTICS] ${event}:`, { userId, ...properties });
  },

  // Identify user
  identify(userId, traits = {}) {
    if (posthogClient) {
      posthogClient.identify({
        distinctId: userId,
        properties: traits
      });
    }
  },

  // Track page views
  page(userId, page, properties = {}) {
    if (posthogClient) {
      posthogClient.capture({
        distinctId: userId,
        event: '$pageview',
        properties: {
          $current_url: page,
          ...properties
        }
      });
    }
  },

  // Flush events (call on app shutdown)
  async flush() {
    if (posthogClient) {
      await posthogClient.shutdown();
    }
  }
};

// Sentry helpers
export const monitoring = {
  // Capture exceptions
  captureException(error, context = {}) {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error, { extra: context });
    }
    console.error('[ERROR]', error, context);
  },

  // Capture messages
  captureMessage(message, level = 'info', context = {}) {
    if (process.env.SENTRY_DSN) {
      Sentry.captureMessage(message, level, { extra: context });
    }
    console.log(`[${level.toUpperCase()}]`, message, context);
  },

  // Add user context
  setUser(user) {
    if (process.env.SENTRY_DSN) {
      Sentry.setUser(user);
    }
  },

  // Add tags
  setTag(key, value) {
    if (process.env.SENTRY_DSN) {
      Sentry.setTag(key, value);
    }
  }
};

// Predefined events for consistency
export const EVENTS = {
  // Auth events
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',

  // Learning events
  COURSE_STARTED: 'course_started',
  COURSE_COMPLETED: 'course_completed',
  MODULE_COMPLETED: 'module_completed',
  QUIZ_STARTED: 'quiz_started',
  QUIZ_COMPLETED: 'quiz_completed',

  // Gamification events
  POINTS_EARNED: 'points_earned',
  BADGE_EARNED: 'badge_earned',
  STREAK_MILESTONE: 'streak_milestone',
  LEADERBOARD_VIEWED: 'leaderboard_viewed',

  // Mentorship events
  MENTOR_SESSION_BOOKED: 'mentor_session_booked',
  MENTOR_SESSION_COMPLETED: 'mentor_session_completed',
  MENTOR_PROFILE_VIEWED: 'mentor_profile_viewed',

  // Community events
  COMMUNITY_POST_CREATED: 'community_post_created',
  COMMUNITY_POST_LIKED: 'community_post_liked',
  COMMUNITY_COMMENT_CREATED: 'community_comment_created',

  // Bro chatbot events
  BRO_INTERACTION: 'bro_interaction',
  BRO_ACTION_CLICKED: 'bro_action_clicked',

  // General engagement
  PAGE_VIEWED: 'page_viewed',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied'
};

// Middleware to track API requests
export function analyticsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Track API request
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.user?.id || 'anonymous';
    
    analytics.track(userId, 'api_request', {
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      duration_ms: duration,
      user_agent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Track errors
    if (res.statusCode >= 400) {
      monitoring.captureMessage(`API Error: ${req.method} ${req.path}`, 'warning', {
        status_code: res.statusCode,
        user_id: userId,
        duration_ms: duration
      });
    }
  });
  
  next();
}

// Helper to track user actions
export function trackUserAction(userId, action, properties = {}) {
  analytics.track(userId, action, properties);
}

// Helper to track errors with user context
export function trackError(error, userId = null, context = {}) {
  if (userId) {
    monitoring.setUser({ id: userId });
  }
  monitoring.captureException(error, context);
}
