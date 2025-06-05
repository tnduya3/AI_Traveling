"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import HomeChatbot from "@/components/HomeChatbot";
import ConversationSidebar from "@/components/ConversationSidebar";
import { useAuthCheck } from "@/hooks/useAuthCheck";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Đang tải bản đồ...</div>
    </div>
  ),
});

const Home = () => {
  const { user, loading } = useAuthCheck();
  const [currentConversationId, setCurrentConversationId] = useState<
    string | undefined
  >();

  if (loading) return <p>Đang kiểm tra đăng nhập...</p>;

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
  };

  const handleConversationCreate = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="flex h-[calc(100vh-80px)]">
          {" "}
          {/* Adjust for header height */}
          {/* Conversation Sidebar */}
          <ConversationSidebar
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            className="flex-shrink-0"
          />
          {/* Main Content Area */}
          <div className="flex-1 flex gap-6 p-6">
            {/* AI Chatbot */}
            <div className="flex-1">
              <HomeChatbot
                conversationId={currentConversationId}
                onConversationCreate={handleConversationCreate}
              />
            </div>

            {/* Bản đồ (bên phải) */}
            <div className="w-80 flex-shrink-0">
              <div className="h-[600px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-100 text-gray-800">
                  <h2 className="text-lg font-semibold">Bản đồ</h2>
                </div>
                <div className="h-[550px]">
                  <MapView />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
