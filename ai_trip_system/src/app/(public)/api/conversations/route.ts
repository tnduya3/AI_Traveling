import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Types
interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

interface ConversationCreate {
  user_id: string;
  title: string;
}

interface ConversationUpdate {
  title?: string;
  is_archived?: boolean;
}

// GET /api/conversations - Lấy danh sách conversations hoặc conversation cụ thể
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Nếu có conversationId, lấy conversation cụ thể
    if (conversationId) {
      const query = `
        SELECT id, user_id, title, created_at, updated_at, is_archived
        FROM conversations
        WHERE id = $1 AND user_id = $2
      `;

      const result = await pool.query(query, [conversationId, userId]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    }

    // Lấy danh sách conversations
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT id, user_id, title, created_at, updated_at, is_archived
      FROM conversations
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (!includeArchived) {
      query += ` AND is_archived = false`;
    }

    if (search) {
      query += ` AND title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Count total
    const countQuery = query.replace(
      'SELECT id, user_id, title, created_at, updated_at, is_archived',
      'SELECT COUNT(*)'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get conversations with pagination
    query += ` ORDER BY updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const conversations: Conversation[] = result.rows;

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Tạo conversation mới
export async function POST(request: NextRequest) {
  try {
    const body: ConversationCreate = await request.json();
    const { user_id, title } = body;

    if (!user_id || !title) {
      return NextResponse.json(
        { error: 'user_id and title are required' },
        { status: 400 }
      );
    }

    // Generate ID
    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    const query = `
      INSERT INTO conversations (id, user_id, title, created_at, updated_at, is_archived)
      VALUES ($1, $2, $3, NOW(), NOW(), false)
      RETURNING id, user_id, title, created_at, updated_at, is_archived
    `;

    const result = await pool.query(query, [id, user_id, title]);
    const conversation: Conversation = result.rows[0];

    return NextResponse.json(conversation, { status: 201 });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations - Cập nhật conversation
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');
    const body: ConversationUpdate & { userId: string } = await request.json();
    const { userId, title, is_archived } = body;

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'conversationId and userId are required' },
        { status: 400 }
      );
    }

    // Check if conversation exists and belongs to user
    const checkQuery = `
      SELECT id FROM conversations
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [conversationId, userId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(title);
      paramIndex++;
    }

    if (is_archived !== undefined) {
      updates.push(`is_archived = $${paramIndex}`);
      params.push(is_archived);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    params.push(conversationId, userId);

    const query = `
      UPDATE conversations
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING id, user_id, title, created_at, updated_at, is_archived
    `;

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations - Soft delete (archive) conversation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'conversationId and userId are required' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_archived = true
    const query = `
      UPDATE conversations
      SET is_archived = true, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [conversationId, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Conversation archived successfully' });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
