"use client";

import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/hooks/useRepoChat"; 

export interface ChatSession {
  id: number;
  title: string;
  date: string;
  messages: ChatMessage[]; 
}

// UPDATE: Added activeChatId and onSelectChat
interface ChatSidebarProps {
  className?: string;
  history: ChatSession[];
  activeChatId: number | null; 
  onDeleteChat: (id: number) => void;
  onNewChat: () => void;
  onSelectChat: (id: number) => void; 
}

export function ChatSidebar({ 
  className, 
  history, 
  activeChatId, 
  onDeleteChat, 
  onNewChat, 
  onSelectChat 
}: ChatSidebarProps) {
  
  return (
    <div className={cn("w-[260px] flex flex-col h-full border-r border-[#30363d] bg-[#010409]", className)}>
      <div className="p-3">
        <button 
          onClick={onNewChat} 
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-white bg-[#238636] hover:bg-[#2ea043] border border-[rgba(240,246,252,0.1)] rounded-md transition-all shadow-sm active:scale-95"
        >
          <Plus size={16} /> <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent">
        <div className="space-y-1">
          <h4 className="px-3 text-xs font-semibold text-[#8b949e] mb-2 uppercase tracking-wider">Recent</h4>
          
          {history.length === 0 ? (
            <p className="px-3 text-xs text-[#8b949e] italic mt-2">No recent chats</p>
          ) : (
            history.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)} 
                className={cn(
                  "group flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors text-left",
                  activeChatId === chat.id 
                    ? "bg-[#161b22] text-white font-medium border-l-2 border-[#238636]" 
                    : "text-[#c9d1d9] hover:bg-[#161b22] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare size={14} className={cn("shrink-0", activeChatId === chat.id ? "text-white" : "text-[#8b949e]")} />
                  <span className="truncate">{chat.title}</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center">
                   <div 
                     role="button" 
                     onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} 
                     className="p-1 hover:bg-[#da3633]/20 hover:text-[#f85149] rounded transition-colors"
                   >
                     <Trash2 size={14} />
                   </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      {/* Footer... */}
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