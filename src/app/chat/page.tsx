"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { ChatSidebar } from "@/app/components/ChatSidebar"; 
import { useState, useMemo, useEffect, Suspense } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatMessage, ChatSession } from "@/hooks/useRepoChat";
import api from "@/lib/axios"; 

function ChatContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- AUTH STATE ---
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- 1. CHECK AUTH ON LOAD ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // This will now go to localhost -> proxy -> backend (carrying the cookie!)
        await api.get("/api/user/check-auth");
        setIsAuthenticated(true);
      } catch (error) {
        // If 401, redirect to login
        router.replace("/auth/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // --- CHAT STATE ---
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

  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  useEffect(() => {
    const repoParam = searchParams.get("repo");
    // Only start chat logic IF authenticated
    if (isAuthenticated && repoParam && activeChatId === null) {
      handleChatStart(decodeURIComponent(repoParam));
    }
  }, [searchParams, isAuthenticated]);

  const activeChatMessages = useMemo(() => {
    if (activeChatId === null) return [];
    return history.find(c => c.id === activeChatId)?.messages || [];
  }, [history, activeChatId]);

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

  const handleMessagesUpdate = (updatedMessages: ChatMessage[]) => {
    if (activeChatId === null) return;

    setHistory(prev => {
      const currentChat = prev.find(c => c.id === activeChatId);
      if (!currentChat) return prev;
      if (currentChat.messages.length === updatedMessages.length) {
        return prev;
      }
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

  // --- RENDER LOADING OR CHAT ---
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0d1117] text-white gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <p className="text-sm text-gray-400">Verifying session...</p>
      </div>
    );
  }

  // If auth failed, we return nothing (router will redirect)
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-[calc(100vh)] w-full bg-[#0d1117] overflow-hidden">
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

      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[#0d1117]">
        <div className="absolute top-4 left-4 z-10 md:hidden">
          <button className="p-2 bg-[#161b22] border border-[#30363d] rounded-md text-[#c9d1d9]">
            <Menu size={20} />
          </button>
        </div>
        
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex absolute top-4 left-4 z-20 p-2 text-[#8b949e] hover:text-white bg-transparent hover:bg-[#1f242c] rounded-md transition-all"
            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>

        <MessageThreadFull 
          initialMessages={activeChatMessages}
          onChatStart={handleChatStart} 
          onMessagesUpdate={handleMessagesUpdate}
          className="h-full" 
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0d1117] text-[#8b949e]">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}