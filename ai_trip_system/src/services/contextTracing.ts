interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: Date;
  sequence_number: number;
  metadata?: any;
}

interface ContextMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sequence: number;
}

export interface ConversationContext {
  conversationId: string;
  currentSequence: number;
  recentMessages: ContextMessage[];
  contextSummary?: string;
}

export class ContextTracingService {
  private static readonly CONTEXT_WINDOW_SIZE = 3; // Lấy 3 câu trước đó
  private static readonly MAX_CONTEXT_LENGTH = 2000; // Giới hạn độ dài context

  /**
   * Lấy context từ 3 messages gần nhất trong conversation
   */
  static async getConversationContext(
    conversationId: string,
    currentSequence?: number
  ): Promise<ConversationContext> {
    try {
      // Query để lấy messages gần nhất
      const query = `
        SELECT id, content, role, created_at, sequence_number, metadata
        FROM messages
        WHERE conversation_id = $1
        ${currentSequence ? 'AND sequence_number < $2' : ''}
        ORDER BY sequence_number DESC
        LIMIT $${currentSequence ? '3' : '2'}
      `;

      const params = currentSequence
        ? [conversationId, currentSequence, this.CONTEXT_WINDOW_SIZE]
        : [conversationId, this.CONTEXT_WINDOW_SIZE];

      // Try to import db pool if available
      let pool;
      try {
        const dbModule = await import('@/lib/db').catch(() => null);
        pool = dbModule?.pool;
      } catch (error) {
        console.error('Database not available:', error);
        throw new Error('Database connection not available');
      }

      if (!pool) {
        throw new Error('Database pool not available');
      }

      const result = await pool.query(query, params);

      const recentMessages: ContextMessage[] = result.rows.map((row: any) => ({
        role: row.role,
        content: row.content,
        timestamp: row.created_at,
        sequence: row.sequence_number
      })).reverse(); // Đảo ngược để có thứ tự chronological

      return {
        conversationId,
        currentSequence: currentSequence || 0,
        recentMessages,
        contextSummary: this.buildContextSummary(recentMessages)
      };
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return {
        conversationId,
        currentSequence: currentSequence || 0,
        recentMessages: [],
      };
    }
  }

  /**
   * Xây dựng context summary từ messages gần đây
   */
  private static buildContextSummary(messages: ContextMessage[]): string {
    if (messages.length === 0) return '';

    let context = 'Ngữ cảnh cuộc trò chuyện gần đây:\n';

    messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'Người dùng' : 'Trợ lý';
      const truncatedContent = msg.content.length > 200
        ? msg.content.substring(0, 200) + '...'
        : msg.content;

      context += `${index + 1}. ${role}: ${truncatedContent}\n`;
    });

    // Giới hạn độ dài context
    if (context.length > this.MAX_CONTEXT_LENGTH) {
      context = context.substring(0, this.MAX_CONTEXT_LENGTH) + '...';
    }

    return context;
  }

  /**
   * Tạo prompt với context cho AI
   */
  static buildContextualPrompt(
    userMessage: string,
    context: ConversationContext
  ): string {
    let prompt = '';

    // Thêm context nếu có
    if (context.recentMessages.length > 0) {
      prompt += `${context.contextSummary}\n\n`;
      prompt += 'Dựa trên ngữ cảnh trên, hãy trả lời câu hỏi sau:\n';
    }

    prompt += `Câu hỏi hiện tại: ${userMessage}`;

    return prompt;
  }

  /**
   * Lưu message với context đã sử dụng
   */
  static async saveMessageWithContext(
    conversationId: string,
    content: string,
    role: 'user' | 'assistant',
    usedContext?: ConversationContext
  ): Promise<string> {
    try {
      // Try to import db pool if available
      let pool;
      try {
        const dbModule = await import('@/lib/db').catch(() => null);
        pool = dbModule?.pool;
      } catch (error) {
        console.error('Database not available:', error);
        throw new Error('Database connection not available');
      }

      if (!pool) {
        throw new Error('Database pool not available');
      }

      // Lấy sequence number tiếp theo
      const sequenceQuery = `
        SELECT COALESCE(MAX(sequence_number), 0) + 1 as next_sequence
        FROM messages
        WHERE conversation_id = $1
      `;
      const sequenceResult = await pool.query(sequenceQuery, [conversationId]);
      const nextSequence = sequenceResult.rows[0].next_sequence;

      // Insert message với context
      const insertQuery = `
        INSERT INTO messages (
          conversation_id, content, role, sequence_number, context_used, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const contextData = usedContext ? {
        contextMessages: usedContext.recentMessages,
        contextSummary: usedContext.contextSummary,
        contextLength: usedContext.recentMessages.length
      } : null;

      const result = await pool.query(insertQuery, [
        conversationId,
        content,
        role,
        nextSequence,
        JSON.stringify(contextData),
        JSON.stringify({ timestamp: new Date().toISOString() })
      ]);

      return result.rows[0].id;
    } catch (error) {
      console.error('Error saving message with context:', error);
      throw error;
    }
  }

  /**
   * Phân tích context để tìm chủ đề chính
   */
  static analyzeContextTopics(context: ConversationContext): string[] {
    const topics: string[] = [];
    const content = context.recentMessages.map(m => m.content).join(' ').toLowerCase();

    // Các từ khóa du lịch phổ biến
    const travelKeywords = {
      'địa điểm': ['địa điểm', 'nơi', 'chỗ', 'place', 'location'],
      'ăn uống': ['ăn', 'uống', 'món', 'quán', 'nhà hàng', 'food', 'restaurant'],
      'lưu trú': ['khách sạn', 'hotel', 'homestay', 'resort', 'lưu trú'],
      'di chuyển': ['xe', 'máy bay', 'tàu', 'bus', 'di chuyển', 'transport'],
      'hoạt động': ['tham quan', 'vui chơi', 'hoạt động', 'activity', 'tour'],
      'thời gian': ['ngày', 'tháng', 'tuần', 'time', 'date', 'schedule']
    };

    Object.entries(travelKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }
}

export default ContextTracingService;
