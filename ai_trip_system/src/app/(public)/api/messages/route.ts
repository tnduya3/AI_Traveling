import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Types
interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  metadata?: any;
  token_count: number;
}

interface MessageCreate {
  userId: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  metadata?: any;
  token_count?: number;
}

// GET /api/messages - Lấy messages hoặc message cụ thể
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');
    const messageId = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Nếu có messageId, lấy message cụ thể
    if (messageId) {
      const query = `
        SELECT m.id, m.conversation_id, m.content, m.role, m.created_at, m.metadata, m.token_count
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.id = $1 AND c.user_id = $2
      `;

      const result = await pool.query(query, [messageId, userId]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    }

    // Nếu có conversationId, lấy messages của conversation đó
    if (conversationId) {
      // Check if conversation exists and belongs to user
      const convQuery = `
        SELECT id FROM conversations
        WHERE id = $1 AND user_id = $2 AND is_archived = false
      `;
      const convResult = await pool.query(convQuery, [conversationId, userId]);

      if (convResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      const offset = (page - 1) * limit;

      // Count total messages
      const countQuery = `
        SELECT COUNT(*) FROM messages
        WHERE conversation_id = $1
      `;
      const countResult = await pool.query(countQuery, [conversationId]);
      const total = parseInt(countResult.rows[0].count);

      // Get messages with pagination
      const messagesQuery = `
        SELECT id, conversation_id, content, role, created_at, metadata, token_count
        FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3
      `;

      const messagesResult = await pool.query(messagesQuery, [conversationId, limit, offset]);
      const messages: Message[] = messagesResult.rows;

      return NextResponse.json({
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    }

    return NextResponse.json(
      { error: 'Either messageId or conversationId is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Tạo message mới
export async function POST(request: NextRequest) {
  try {
    const body: MessageCreate = await request.json();
    const { userId, conversationId, content, role, metadata, token_count = 0 } = body;

    if (!userId || !conversationId || !content || !role) {
      return NextResponse.json(
        { error: 'userId, conversationId, content, and role are required' },
        { status: 400 }
      );
    }

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { error: 'role must be either "user" or "assistant"' },
        { status: 400 }
      );
    }

    // Check if conversation exists and belongs to user
    const convQuery = `
      SELECT id FROM conversations
      WHERE id = $1 AND user_id = $2 AND is_archived = false
    `;
    const convResult = await pool.query(convQuery, [conversationId, userId]);

    if (convResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Generate message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert message
      const insertMessageQuery = `
        INSERT INTO messages (id, conversation_id, content, role, created_at, metadata, token_count)
        VALUES ($1, $2, $3, $4, NOW(), $5, $6)
        RETURNING id, conversation_id, content, role, created_at, metadata, token_count
      `;

      const messageResult = await client.query(insertMessageQuery, [
        messageId,
        conversationId,
        content,
        role,
        metadata ? JSON.stringify(metadata) : null,
        token_count
      ]);

      // Update conversation's updated_at
      const updateConvQuery = `
        UPDATE conversations
        SET updated_at = NOW()
        WHERE id = $1
      `;
      await client.query(updateConvQuery, [conversationId]);

      await client.query('COMMIT');

      const message: Message = messageResult.rows[0];
      return NextResponse.json(message, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
