import { NextRequest, NextResponse } from 'next/server';
import ContextTracingService from '@/services/contextTracing';
import ContextCacheService from '@/services/contextCache';

// GET /api/context - Get conversation context
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const sequence = searchParams.get('sequence');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Try cache first
    let context = ContextCacheService.getContext(
      conversationId, 
      sequence ? parseInt(sequence) : undefined
    );

    // If not in cache, get from database
    if (!context) {
      context = await ContextTracingService.getConversationContext(
        conversationId,
        sequence ? parseInt(sequence) : undefined
      );

      // Cache the result
      if (context) {
        ContextCacheService.setContext(conversationId, context);
      }
    }

    return NextResponse.json({
      success: true,
      context,
      cached: !!context
    });

  } catch (error) {
    console.error('Error getting context:', error);
    return NextResponse.json(
      { error: 'Failed to get context' },
      { status: 500 }
    );
  }
}

// POST /api/context - Analyze context and get topics
export async function POST(request: NextRequest) {
  try {
    const { conversationId, sequence } = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get context
    const context = await ContextTracingService.getConversationContext(
      conversationId,
      sequence
    );

    if (!context) {
      return NextResponse.json(
        { error: 'Context not found' },
        { status: 404 }
      );
    }

    // Analyze topics
    const topics = ContextTracingService.analyzeContextTopics(context);

    // Build contextual prompt example
    const examplePrompt = ContextTracingService.buildContextualPrompt(
      "Tôi muốn tìm địa điểm ăn uống",
      context
    );

    return NextResponse.json({
      success: true,
      context,
      topics,
      examplePrompt,
      stats: {
        messageCount: context.recentMessages.length,
        contextLength: context.contextSummary?.length || 0,
        topicsFound: topics.length
      }
    });

  } catch (error) {
    console.error('Error analyzing context:', error);
    return NextResponse.json(
      { error: 'Failed to analyze context' },
      { status: 500 }
    );
  }
}

// DELETE /api/context - Clear context cache
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Clear specific conversation cache
      ContextCacheService.invalidateConversation(conversationId);
    } else {
      // Clear all cache
      ContextCacheService.clearAll();
    }

    return NextResponse.json({
      success: true,
      message: conversationId 
        ? `Cache cleared for conversation ${conversationId}`
        : 'All cache cleared'
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
