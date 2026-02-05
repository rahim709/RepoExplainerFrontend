"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { ChatSidebar, ChatSession } from "@/app/components/ChatSidebar"; 
import { useState, useMemo, useEffect } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ChatMessage } from "@/hooks/useRepoChat";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const searchParams = useSearchParams();
  
  // 1. STATE: History of all chats
  const [history, setHistory] = useState<ChatSession[]>([
    { 
      id: 1, 
      title: "Repo: facebook/react", 
      date: "Today",
      messages: [
        { role: "user", content: "Analyze facebook/react" },
        { role: "assistant", content: "**React** is a JavaScript library for building user interfaces." }
      ]
    } 
  ]);

  // 2. STATE: Track Active Chat ID (null = New Chat Mode)
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  // 3. EFFECT: Check for URL params from Landing Page
  useEffect(() => {
    const repoParam = searchParams.get("repo");
    if (repoParam && activeChatId === null) {
      handleChatStart(decodeURIComponent(repoParam));
    }
  }, [searchParams]);

  // 4. DERIVED STATE
  const activeChatMessages = useMemo(() => {
    if (activeChatId === null) return [];
    return history.find(c => c.id === activeChatId)?.messages || [];
  }, [history, activeChatId]);

  // --- ACTIONS ---

  const handleChatStart = (firstMessage: string) => {
    if (activeChatId !== null) return; 

    const title = firstMessage.includes("github.com") 
      ? `Repo: ${firstMessage.split('/').pop() || "repository"}`
      : firstMessage.slice(0, 20) + (firstMessage.length > 20 ? "..." : "");

    const newChat: ChatSession = {
      id: Date.now(),
      title: title,
      date: "Just now",
      messages: [{ role: "user", content: firstMessage }]
    };

    setHistory(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  // --- THE FIX IS HERE ---
  const handleMessagesUpdate = (updatedMessages: ChatMessage[]) => {
    if (activeChatId === null) return;

    setHistory(prev => {
      // Find the current chat
      const currentChat = prev.find(c => c.id === activeChatId);
      if (!currentChat) return prev;

      // STOP THE LOOP: If the length is the same, don't update state.
      // This prevents the infinite re-render cycle.
      if (currentChat.messages.length === updatedMessages.length) {
        return prev;
      }

      // Otherwise, actually update the history
      return prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: updatedMessages } 
          : chat
      );
    });
  };

  const handleNewChat = () => {
    setActiveChatId(null); 
  };

  const handleDeleteChat = (id: number) => {
    setHistory(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh)] w-full bg-[#0d1117] overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <div className={`${isSidebarOpen ? 'w-[260px]' : 'w-0 -translate-x-full opacity-0'} transition-all duration-300 ease-in-out border-r border-[#30363d] flex-shrink-0 hidden md:block relative`}>
         <ChatSidebar 
           className="w-[260px]" 
           history={history} 
           activeChatId={activeChatId}
           onDeleteChat={handleDeleteChat}
           onNewChat={handleNewChat}
           onSelectChat={setActiveChatId} 
         />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[#0d1117]">
        
        {/* Mobile Toggle */}
        <div className="absolute cursor-pointer top-4 left-4 z-10 md:hidden">
          <button className="p-2 bg-[#161b22] border border-[#30363d] rounded-md text-[#c9d1d9]">
            <Menu size={20} />
          </button>
        </div>
        
        {/* Desktop Sidebar Toggle */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden cursor-pointer md:flex absolute top-4 left-4 z-20 p-2 text-[#8b949e] hover:text-white bg-transparent hover:bg-[#1f242c] rounded-md transition-all"
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        {/* Message Thread */}
        <MessageThreadFull 
          key={activeChatId ?? "new-session"} 
          initialMessages={activeChatMessages}
          onChatStart={handleChatStart} 
          onMessagesUpdate={handleMessagesUpdate}
          className="h-full" 
        />
      </div>
    </div>
  );
}