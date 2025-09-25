// Helper functions to trigger Bro events
// These can be called from other parts of the application

export function triggerBro(userId, trigger, context = {}) {
  // In a real implementation, this could:
  // 1. Store the trigger in Redis for the frontend to pick up
  // 2. Send a WebSocket message
  // 3. Queue a notification
  
  // For now, just log it
  console.log(`[BRO TRIGGER] User ${userId}: ${trigger}`, context);
  
  // Could implement real-time notifications here
  // Example: store in Redis with expiry
  // await cache.set(`bro:trigger:${userId}`, { trigger, context }, 300);
}

export const BRO_TRIGGERS = {
  MODULE_COMPLETE: 'module_complete',
  COURSE_COMPLETE: 'course_complete',
  STREAK_MILESTONE: 'streak_milestone',
  BADGE_EARNED: 'badge_earned',
  FIRST_LOGIN: 'first_login',
  QUIZ_PERFECT: 'quiz_perfect',
  MENTOR_BOOKED: 'mentor_booked'
};
