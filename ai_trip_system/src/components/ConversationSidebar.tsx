'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

interface ConversationSidebarProps {
  currentConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  className?: string;
}

export default function ConversationSidebar({
  currentConversationId,
  onConversationSelect,
  onNewConversation,
  className = ''
}: ConversationSidebarProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/conversations?userId=${user.id}&limit=50`);

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: 'New Conversation'
        }),
      });

      if (response.ok) {
        const newConversation = await response.json();
        await loadConversations(); // Refresh list
        onNewConversation();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user?.id || !confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return;

    try {
      const response = await fetch(`/api/conversations?id=${conversationId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));

        // If deleting current conversation, create new one
        if (conversationId === currentConversationId) {
          onNewConversation();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleEditTitle = async (conversationId: string, newTitle: string) => {
    if (!user?.id || !newTitle.trim()) return;

    try {
      // Note: You'll need to create this API endpoint
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          title: newTitle.trim()
        }),
      });

      if (response.ok) {
        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, title: newTitle.trim() }
              : conv
          )
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
    }
  };

  const startEditing = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const groupConversationsByDate = (conversations: Conversation[]) => {
    const groups: { [key: string]: Conversation[] } = {};

    conversations.forEach(conv => {
      const dateKey = formatDate(conv.updatedAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(conv);
    });

    return groups;
  };

  const conversationGroups = groupConversationsByDate(conversations);

  if (isCollapsed) {
    return (
      <div className={`w-16 bg-gradient-to-b from-blue-50 to-indigo-100 text-gray-700 flex flex-col border-r border-gray-200 ${className}`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 hover:bg-blue-100 transition-colors rounded-lg m-2"
          title="Mở rộng sidebar"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>

        <button
          onClick={handleNewConversation}
          className="p-4 hover:bg-blue-100 transition-colors rounded-lg m-2"
          title="Cuộc trò chuyện mới"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-gradient-to-b from-blue-50 to-indigo-100 text-gray-700 flex flex-col border-r border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="Thu gọn sidebar"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleNewConversation}
          className="w-full flex items-center gap-3 p-3 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-gray-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-blue-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có cuộc trò chuyện nào</p>
            <p className="text-sm mt-1">Bắt đầu chat để tạo cuộc trò chuyện đầu tiên</p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(conversationGroups).map(([dateGroup, groupConversations]) => (
              <div key={dateGroup} className="mb-4">
                <h3 className="text-xs font-medium text-gray-600 px-3 py-2 uppercase tracking-wider">
                  {dateGroup}
                </h3>
                <div className="space-y-1">
                  {groupConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => onConversationSelect(conversation.id)}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                        conversation.id === currentConversationId
                          ? 'bg-blue-200 border border-blue-300'
                          : 'hover:bg-blue-100'
                      }`}
                    >
                      {editingId === conversation.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleEditTitle(conversation.id, editTitle)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditTitle(conversation.id, editTitle);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                          className="w-full bg-white border border-blue-300 text-gray-700 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium truncate pr-2 flex-1 text-gray-800">
                              {conversation.title}
                            </h4>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => startEditing(conversation, e)}
                                className="p-1 hover:bg-blue-200 rounded text-gray-600"
                                title="Đổi tên"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteConversation(conversation.id, e)}
                                className="p-1 hover:bg-red-100 rounded text-red-500"
                                title="Xóa"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {conversation.lastMessage && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {conversation.lastMessage}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{conversation.messageCount} tin nhắn</span>
                            {conversation.lastMessageAt && (
                              <span>{formatDate(conversation.lastMessageAt)}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
