// API client functions for conversations and messages

import {
  Conversation,
  Message,
  ConversationCreateRequest,
  ConversationUpdateRequest,
  MessageCreateRequest,
  ConversationListParams,
  MessageListParams,
  ConversationListResponse,
  MessageListResponse,
} from '@/types/conversation';

const API_BASE = '/api';

// Conversation API functions
export const conversationApi = {
  // Get conversations list
  async getConversations(params: ConversationListParams): Promise<ConversationListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('userId', params.userId);
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.includeArchived) searchParams.append('includeArchived', 'true');
    if (params.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE}/conversations?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }
    return response.json();
  },

  // Get single conversation
  async getConversation(id: string, userId: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/conversations?id=${id}&userId=${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }
    return response.json();
  },

  // Create new conversation
  async createConversation(data: ConversationCreateRequest): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }
    return response.json();
  },

  // Update conversation
  async updateConversation(id: string, data: ConversationUpdateRequest): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/conversations?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update conversation: ${response.statusText}`);
    }
    return response.json();
  },

  // Archive conversation (soft delete)
  async archiveConversation(id: string, userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/conversations?id=${id}&userId=${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to archive conversation: ${response.statusText}`);
    }
    return response.json();
  },
};

// Message API functions
export const messageApi = {
  // Get messages for a conversation
  async getMessages(conversationId: string, params: MessageListParams): Promise<MessageListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('userId', params.userId);
    searchParams.append('conversationId', conversationId);

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE}/messages?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    return response.json();
  },

  // Create new message in conversation
  async createMessage(conversationId: string, data: MessageCreateRequest): Promise<Message> {
    const messageData = {
      ...data,
      conversationId,
    };

    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create message: ${response.statusText}`);
    }
    return response.json();
  },

  // Create message directly
  async createMessageDirect(data: MessageCreateRequest): Promise<Message> {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to create message: ${response.statusText}`);
    }
    return response.json();
  },

  // Get single message
  async getMessage(messageId: string, userId: string): Promise<Message> {
    const response = await fetch(`${API_BASE}/messages?id=${messageId}&userId=${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch message: ${response.statusText}`);
    }
    return response.json();
  },
};

// Utility functions
export const chatUtils = {
  // Create a new conversation with first message
  async startConversation(
    userId: string,
    title: string,
    firstMessage: string,
    role: 'user' | 'assistant' = 'user'
  ): Promise<{ conversation: Conversation; message: Message }> {
    // Create conversation
    const conversation = await conversationApi.createConversation({
      user_id: userId,
      title,
    });

    // Create first message
    const message = await messageApi.createMessage(conversation.id, {
      userId,
      content: firstMessage,
      role,
    });

    return { conversation, message };
  },

  // Generate conversation title from first message
  generateTitle(firstMessage: string, maxLength: number = 50): string {
    const cleaned = firstMessage.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    return cleaned.substring(0, maxLength - 3) + '...';
  },
};
