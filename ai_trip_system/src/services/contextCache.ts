import { ConversationContext } from './contextTracing';

interface CachedContext {
  context: ConversationContext;
  timestamp: number;
  ttl: number; // Time to live in seconds
}

export class ContextCacheService {
  private static cache = new Map<string, CachedContext>();
  private static readonly DEFAULT_TTL = 300; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 100; // Reduced for memory efficiency

  /**
   * Tạo cache key cho conversation context
   */
  private static getCacheKey(conversationId: string, sequence?: number): string {
    return `context:${conversationId}:${sequence || 'latest'}`;
  }

  /**
   * Lưu context vào cache (Redis first, fallback to memory)
   */
  static async setContext(
    conversationId: string,
    context: ConversationContext,
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    const cacheKey = this.getCacheKey(conversationId, context.currentSequence);

    // Use memory cache only (Redis removed for performance)
    // TODO: Add Redis back in production if needed
    try {
      // Cleanup expired entries nếu cache quá lớn
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        this.cleanupExpired();
      }

      const cachedContext: CachedContext = {
        context,
        timestamp: Date.now(),
        ttl: ttl * 1000 // Convert to milliseconds
      };

      this.cache.set(cacheKey, cachedContext);

      // Set cleanup timer
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, ttl * 1000);

    } catch (error) {
      console.error('Error setting context cache:', error);
    }
  }

  /**
   * Lấy context từ cache (Redis first, fallback to memory)
   */
  static async getContext(
    conversationId: string,
    sequence?: number
  ): Promise<ConversationContext | null> {
    const cacheKey = this.getCacheKey(conversationId, sequence);

    // Use memory cache only (Redis removed for performance)
    try {
      const cached = this.cache.get(cacheKey);

      if (!cached) return null;

      // Check if expired
      const now = Date.now();
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(cacheKey);
        return null;
      }

      return cached.context;
    } catch (error) {
      console.error('Error getting context cache:', error);
      return null;
    }
  }

  /**
   * Xóa cache cho conversation (Redis + memory)
   */
  static async invalidateConversation(conversationId: string): Promise<void> {
    // Clear memory cache only (Redis removed for performance)
    try {
      const keysToDelete: string[] = [];

      this.cache.forEach((_, key) => {
        if (key.startsWith(`context:${conversationId}:`)) {
          keysToDelete.push(key);
        }
      });

      keysToDelete.forEach(key => this.cache.delete(key));
    } catch (error) {
      console.error('Error invalidating conversation cache:', error);
    }
  }

  /**
   * Cleanup expired entries
   */
  private static cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((cached, key) => {
      if (now - cached.timestamp > cached.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Lấy thống kê cache
   */
  static getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }

  /**
   * Clear toàn bộ cache
   */
  static clearAll(): void {
    this.cache.clear();
  }
}

// Memory-only cache for better performance
// Redis can be added back later if needed for production scaling

export default ContextCacheService;
