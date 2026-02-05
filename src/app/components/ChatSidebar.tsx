"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the shape of a Chat item
export interface ChatSession {
  id: number;
  title: string;
  date: string;
}

interface ChatSidebarProps {
  className?: string;
  history: ChatSession[]; // Receive history from parent
  onDeleteChat: (id: number) => void; // Receive delete action from parent
  onNewChat: () => void; // Receive reset action
}

export function ChatSidebar({ className, history, onDeleteChat, onNewChat }: ChatSidebarProps) {
  
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteChat(id);
  };

  return (
    <div className={cn("w-[260px] flex flex-col h-full border-r border-[#30363d] bg-[#010409]", className)}>
      
      {/* 1. New Chat Button */}
      <div className="p-3">
        <button 
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-white bg-[#238636] hover:bg-[#2ea043] border border-[rgba(240,246,252,0.1)] rounded-md transition-all shadow-sm active:scale-95"
          onClick={onNewChat} 
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* 2. Scrollable History List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent">
        <div className="space-y-1">
          <h4 className="px-3 text-xs font-semibold text-[#8b949e] mb-2 uppercase tracking-wider">Recent</h4>
          
          {history.length === 0 ? (
            <p className="px-3 text-xs text-[#8b949e] italic mt-2">No recent chats</p>
          ) : (
            history.map((chat) => (
              <button
                key={chat.id}
                className="group flex items-center justify-between w-full px-3 py-2 text-sm text-[#c9d1d9] hover:bg-[#161b22] hover:text-white rounded-md transition-colors text-left"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={14} className="text-[#8b949e] group-hover:text-white shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </div>
                
                {/* Delete Option */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center">
                   <div
                     role="button"
                     onClick={(e) => handleDelete(chat.id, e)}
                     className="p-1 hover:bg-[#da3633]/20 hover:text-[#f85149] rounded transition-colors"
                     title="Delete chat"
                   >
                     <Trash2 size={14} />
                   </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      {/* Bottom Profile Section (Unchanged) */}
      <div className="p-3 border-t border-[#30363d] mt-auto">
        <div className="flex items-center gap-3 w-full px-2 py-2 text-sm text-[#c9d1d9]">
          <div className="w-8 h-8 rounded-full bg-[#30363d] flex items-center justify-center border border-[#8b949e]">
             <span className="font-bold text-xs text-white">AR</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">Abdur Rahim</span>
            <span className="text-xs text-[#8b949e]">Free Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}