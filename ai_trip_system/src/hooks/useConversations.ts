import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: any;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export function useConversations() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Use SWR for data fetching
  const { data: conversations, error: swrError, isLoading, mutate } = useSWR(
    user?.id ? `/api/conversations?userId=${user.id}&limit=50` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      onError: (err) => {
        setError(err.message || 'Failed to load conversations');
        console.error('Error loading conversations:', err);
      }
    }
  );

  const loadConversations = useCallback(async () => {
    await mutate(); // Trigger revalidation
  }, [mutate]);

  const createConversation = useCallback(async (title?: string, firstMessage?: string) => {
    if (!user?.id) return null;

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: title || 'New Conversation',
          firstMessage
        }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        await mutate(); // Revalidate SWR cache
        return newConversation;
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error creating conversation:', err);
      return null;
    }
  }, [user?.id, mutate]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/conversations?id=${conversationId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await mutate(); // Revalidate SWR cache
        return true;
      } else {
        throw new Error('Failed to delete conversation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error deleting conversation:', err);
      return false;
    }
  }, [user?.id, mutate]);

  const updateConversationTitle = useCallback(async (conversationId: string, newTitle: string) => {
    if (!user?.id) return false;

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: newTitle
        }),
      });

      if (response.ok) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, title: newTitle }
              : conv
          )
        );
        return true;
      } else {
        throw new Error('Failed to update conversation title');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error updating conversation title:', err);
      return false;
    }
  }, [user?.id]);

  const loadConversationMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    if (!user?.id) return [];

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages?userId=${user.id}`);
      
      if (response.ok) {
        const messages = await response.json();
        return messages;
      } else {
        throw new Error('Failed to load conversation messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error loading conversation messages:', err);
      return [];
    }
  }, [user?.id]);

  const addMessageToConversation = useCallback(async (
    conversationId: string, 
    content: string, 
    role: 'user' | 'assistant',
    metadata?: any
  ) => {
    if (!user?.id) return null;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          content,
          role,
          metadata
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh conversations to update last message
        await loadConversations();
        return result;
      } else {
        throw new Error('Failed to add message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error adding message:', err);
      return null;
    }
  }, [user?.id, loadConversations]);

  return {
    conversations: conversations || [],
    isLoading,
    error: error || swrError?.message,
    loadConversations,
    createConversation,
    deleteConversation,
    updateConversationTitle,
    loadConversationMessages,
    addMessageToConversation,
    clearError: () => setError(null),
    mutate // Expose mutate for manual revalidation
  };
}

export type { Conversation, Message };
