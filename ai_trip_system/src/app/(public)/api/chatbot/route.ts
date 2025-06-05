import { NextRequest, NextResponse } from 'next/server';
// import { Pool } from 'pg';

const CHATBOT_SERVICE_URL = process.env.CHATBOT_SERVICE_URL || 'http://localhost:5000';

// Database connection - COMMENTED OUT FOR TESTING
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
// });

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], conversationId, userId } = await request.json();

    // Forward the request to the chatbot microservice
    const response = await fetch(`${CHATBOT_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    const data = await response.json();

    // COMMENTED OUT DATABASE OPERATIONS FOR TESTING
    // If successful and we have conversation details, save to database
    // if (data.success && conversationId && userId) {
    //   try {
    //     const client = await pool.connect();

    //     try {
    //       await client.query('BEGIN');

    //       // Save user message
    //       await client.query(
    //         'INSERT INTO messages (conversation_id, content, role) VALUES ($1, $2, $3)',
    //         [conversationId, message, 'user']
    //       );

    //       // Save assistant response
    //       await client.query(
    //         'INSERT INTO messages (conversation_id, content, role, metadata) VALUES ($1, $2, $3, $4)',
    //         [conversationId, data.response, 'assistant', JSON.stringify(data.metadata || {})]
    //       );

    //       // Update conversation timestamp
    //       await client.query(
    //         'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    //         [conversationId]
    //       );

    //       await client.query('COMMIT');
    //     } catch (dbError) {
    //       await client.query('ROLLBACK');
    //       console.error('Database error:', dbError);
    //     } finally {
    //       client.release();
    //     }
    //   } catch (dbError) {
    //     console.error('Database connection error:', dbError);
    //     // Don't fail the request if database save fails
    //   }
    // }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chatbot proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Không thể kết nối đến dịch vụ chatbot. Vui lòng thử lại sau.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Health check proxy
    const response = await fetch(`${CHATBOT_SERVICE_URL}/api/health`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chatbot health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        initialized: false,
        message: 'Chatbot service unavailable'
      },
      { status: 503 }
    );
  }
}
