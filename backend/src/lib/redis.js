import { createClient } from 'redis';

let redisClient = null;
let isConnected = false;

// Initialize Redis client
async function initRedis() {
  if (redisClient) return redisClient;
  
  try {
    // Check if we have Upstash credentials
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (upstashUrl && upstashToken) {
      // Use Upstash REST API format
      const redisUrl = upstashUrl.replace('https://', 'redis://');
      
      redisClient = createClient({
        url: redisUrl,
        password: upstashToken,
        socket: {
          connectTimeout: 10000,
          commandTimeout: 5000,
          tls: true
        }
      });
    } else {
      // Fallback to regular Redis URL
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 10000,
          commandTimeout: 5000,
          tls: redisUrl.includes('rediss://')
        }
      });
    }
    
    redisClient.on('connect', () => {
      isConnected = true;
      console.log('✅ Redis connected successfully');
    });
    
    redisClient.on('error', (err) => {
      isConnected = false;
      console.warn('⚠️ Redis error:', err.message);
    });
    
    await redisClient.connect();
    return redisClient;
    
  } catch (error) {
    console.warn('⚠️ Redis initialization failed:', error.message);
    console.log('📝 Continuing without Redis cache...');
    return null;
  }
}

// Cache helper functions
export const cache = {
  // Get value from cache
  async get(key) {
    if (!isConnected || !redisClient) return null;
    
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('[REDIS GET ERROR]', error);
      return null;
    }
  },

  // Set value in cache with TTL
  async set(key, value, ttlSeconds = 3600) {
    if (!isConnected || !redisClient) return false;
    
    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('[REDIS SET ERROR]', error);
      return false;
    }
  },

  // Delete key from cache
  async del(key) {
    if (!isConnected || !redisClient) return false;
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('[REDIS DEL ERROR]', error);
      return false;
    }
  },

  // Check if Redis is available
  isAvailable() {
    return isConnected && redisClient;
  },

  // Increment counter (for rate limiting)
  async incr(key, ttlSeconds = 3600) {
    if (!isConnected || !redisClient) return null;
    
    try {
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      console.error('[REDIS INCR ERROR]', error);
      return null;
    }
  }
};

// Initialize Redis on module load
initRedis().catch(console.error);

export { redisClient, isConnected };
