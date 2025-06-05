'use client';

import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import ContextTracingService from '@/services/contextTracing';
import ContextCacheService from '@/services/contextCache';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: any;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  metadata?: any;
  error?: string;
}

// Function to render markdown-like text with formatting
const renderMessageText = (text: string, isUser: boolean = false) => {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);

    const renderedLine = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <strong
            key={partIndex}
            className={`font-bold ${isUser ? 'text-yellow-200' : 'text-blue-600'}`}
          >
            {boldText}
          </strong>
        );
      }
      return part;
    });

    return (
      <span key={lineIndex}>
        {renderedLine}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
};

interface HomeChatbotProps {
  conversationId?: string;
  onConversationCreate?: (conversationId: string) => void;
}

export default function HomeChatbot({
  conversationId,
  onConversationCreate
}: HomeChatbotProps) {
  const { isLoggedIn, username } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Scroll within the chat container only, not the entire page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Add a small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    checkChatbotHealth();
  }, []);

  useEffect(() => {
    setCurrentConversationId(conversationId);
    // TEMPORARILY DISABLED conversation loading for testing
    // if (conversationId && isLoggedIn) {
    //   loadConversationMessages(conversationId);
    // } else {
      // New conversation - show welcome message
      setMessages([{
        id: 'welcome',
        text: 'Xin chào! Tôi là trợ lý du lịch AI. Tôi có thể giúp bạn lên kế hoạch du lịch, tìm kiếm địa điểm, và trả lời các câu hỏi về du lịch. Bạn muốn đi đâu?',
        isUser: false,
        timestamp: new Date(),
      }]);
    // }
  }, [conversationId, isLoggedIn]);

  const loadConversationMessages = async (convId: string) => {
    // TEMPORARILY DISABLED for testing
    // if (!isLoggedIn) return;

    // try {
    //   const response = await fetch(`/api/conversations/${convId}/messages?userId=${username}`);
    //   if (response.ok) {
    //     const messagesData = await response.json();
    //     setMessages(messagesData);
    //   } else {
    //     console.error('Failed to load conversation messages');
    //   }
    // } catch (error) {
    //   console.error('Error loading conversation messages:', error);
    // }
  };

  const checkChatbotHealth = async () => {
    try {
      const response = await fetch('/api/chatbot');
      const data = await response.json();
      setIsConnected(data.status === 'ok' && data.initialized);

      // Warm-up request to initialize chatbot if it's connected but not warmed up
      if (data.status === 'ok' && data.initialized) {
        try {
          await fetch('/api/chatbot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: 'ping',
              history: [],
              userId: 'warmup'
            }),
          });
        } catch (warmupError) {
          console.log('Warmup request failed, but continuing...');
        }
      }
    } catch (error) {
      console.error('Chatbot service not available:', error);
      setIsConnected(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // TEMPORARILY DISABLED conversation creation for testing
    // Create conversation if this is the first message
    let conversationIdToUse = currentConversationId;

    // if (!conversationIdToUse) {
    //   try {
    //     const createResponse = await fetch('/api/conversations', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({
    //         userId: username,
    //         firstMessage: messageText
    //       }),
    //     });

    //     if (createResponse.ok) {
    //       const newConversation = await createResponse.json();
    //       conversationIdToUse = newConversation.id;
    //       setCurrentConversationId(conversationIdToUse);
    //       onConversationCreate?.(conversationIdToUse);
    //     }
    //   } catch (error) {
    //     console.error('Error creating conversation:', error);
    //   }
    // }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Get conversation context from cache or database
      let conversationContext = null;

      // Debug logging
      console.log('Context Debug:', {
        conversationIdToUse,
        currentConversationId,
        messagesLength: messages.length
      });

      if (conversationIdToUse) {
        // Try cache first
        conversationContext = await ContextCacheService.getContext(conversationIdToUse);
        console.log('Cache result:', conversationContext);

        // If not in cache, get from database
        if (!conversationContext) {
          conversationContext = await ContextTracingService.getConversationContext(conversationIdToUse);
          console.log('DB result:', conversationContext);

          // Cache the context for future use
          if (conversationContext) {
            await ContextCacheService.setContext(conversationIdToUse, conversationContext, 300); // 5 minutes TTL
          }
        }
      } else {
        // Fallback: Use local messages as context if no conversation ID
        if (messages.length > 0) {
          const recentMessages = messages.slice(-6).map((msg, index) => ({
            role: msg.isUser ? 'user' : 'assistant' as 'user' | 'assistant',
            content: msg.text,
            timestamp: msg.timestamp,
            sequence: index
          }));

          conversationContext = {
            conversationId: 'local',
            currentSequence: messages.length,
            recentMessages,
            contextSummary: `Ngữ cảnh cuộc trò chuyện gần đây:\n${recentMessages.map((msg, i) =>
              `${i + 1}. ${msg.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${msg.content}`
            ).join('\n')}`
          };

          console.log('Using local context:', conversationContext);
        }
      }

      // Build contextual prompt
      const contextualMessage = conversationContext
        ? ContextTracingService.buildContextualPrompt(messageText, conversationContext)
        : messageText;

      console.log('Contextual message:', {
        original: messageText,
        contextual: contextualMessage,
        hasContext: !!conversationContext
      });

      // Retry logic for first request
      let response;
      let data: ChatResponse;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: contextualMessage,
              originalMessage: messageText, // Keep original for logging
              context: conversationContext,
              history: messages.slice(-6), // Send last 3 exchanges (6 messages)
              conversationId: conversationIdToUse,
              userId: username || 'anonymous'
            }),
          });

          data = await response.json();

          // If successful, break out of retry loop
          if (data.success) {
            break;
          }

          // If not successful but not a connection error, don't retry
          if (response.ok) {
            break;
          }

          retryCount++;
          if (retryCount < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        } catch (fetchError) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw fetchError;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.success ? data.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.' : data.error || 'Có lỗi xảy ra.',
        isUser: false,
        timestamp: new Date(),
        metadata: data.metadata,
      };

      setMessages(prev => [...prev, botMessage]);

      // Save messages with context to database (if conversation exists)
      if (conversationIdToUse && data.success) {
        try {
          // Save user message
          await ContextTracingService.saveMessageWithContext(
            conversationIdToUse,
            messageText,
            'user',
            conversationContext || undefined
          );

          // Save assistant response
          await ContextTracingService.saveMessageWithContext(
            conversationIdToUse,
            data.response || '',
            'assistant',
            conversationContext || undefined
          );

          // Invalidate cache to force refresh on next request
          await ContextCacheService.invalidateConversation(conversationIdToUse);
        } catch (saveError) {
          console.error('Error saving messages with context:', saveError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, chatbot đang khởi tạo hoặc gặp sự cố. Vui lòng thử lại sau vài giây.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[600px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-100 text-gray-800">
        <div className="flex items-center gap-3">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">AI Travel Assistant - Tourmate</h2>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{renderMessageText(message.text, message.isUser)}</div>
              <div className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">Đang xử lý...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập câu hỏi về du lịch..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected || isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || !isConnected}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>

        {!isConnected && (
          <div className="mt-2 text-xs text-red-600">
            ⚠️ Chatbot service không khả dụng
          </div>
        )}
      </div>
    </div>
  );
}
