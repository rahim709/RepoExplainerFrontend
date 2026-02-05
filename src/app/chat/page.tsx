"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { ChatSidebar, ChatSession } from "@/app/components/ChatSidebar"; 
import { useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 1. STATE: This holds your sidebar history
  const [history, setHistory] = useState<ChatSession[]>([
    { id: 1, title: "Repo: facebook/react", date: "Today" } 
  ]);

  // 2. STATE: We use this 'key' to force the Chat Component to reset
  const [chatKey, setChatKey] = useState(0);

  // 3. ACTION: Add new chat to sidebar
  const handleChatStart = (firstMessage: string) => {
    const title = firstMessage.includes("github.com") 
      ? `Repo: ${firstMessage.split('/').pop() || firstMessage}`
      : firstMessage.slice(0, 30) + "...";

    const newChat = {
      id: Date.now(),
      title: title,
      date: "Just now"
    };

    setHistory(prev => [newChat, ...prev]);
  };

  // 4. ACTION: Delete chat
  const handleDeleteChat = (id: number) => {
    setHistory(prev => prev.filter(chat => chat.id !== id));
  };

  // 5. ACTION: Handle New Chat (The Fix)
  const handleNewChat = () => {
    // Instead of reloading the page, we just increment the key.
    // This forces React to destroy the old chat component and create a fresh one.
    setChatKey(prev => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh)] w-full bg-[#0d1117] overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full opacity-0'} transition-all duration-300 ease-in-out border-r border-[#30363d] flex-shrink-0 hidden md:flex relative`}>
         <ChatSidebar 
           className="w-[260px]" 
           history={history} 
           onDeleteChat={handleDeleteChat}
           onNewChat={handleNewChat} // <--- Use our new function here
         />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full bg-[#0d1117]">
        
        {/* Toggles (Mobile & Desktop) */}
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

        {/* The Chat Interface */}
        {/* Adding the 'key' prop here forces it to reset when chatKey changes */}
        <MessageThreadFull 
          key={chatKey} 
          className="h-full" 
          onChatStart={handleChatStart} 
        />
      </div>
    </div>
  );
}