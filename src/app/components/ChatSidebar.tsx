"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, MessageSquare, Trash2, LogOut, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; 
import { ChatSession } from "@/hooks/useRepoChat"; 

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
  
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState({ name: "User", initials: "U" });
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedName = localStorage.getItem("fullName") || "Abdur Rahim";
    const initials = storedName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    setUserData({ name: storedName, initials });

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Call Backend to Clear Cookie
      // If authMiddleware is on, this requires a valid cookie!
      await api.post("/api/user/logout");
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        // This is NORMAL if the token expired or cookie was blocked.
        // We just ignore it because we are logging out anyway.
        console.log("Session already expired on server.");
      } else {
        console.error("Logout request failed", error);
      }
    } finally {
      // 2. Always Clear UI data
      localStorage.clear();

      // 3. Redirect to Landing Page
      router.replace("/");
      router.refresh();
    }
  };

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
                   <div role="button" onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} className="p-1 hover:bg-[#da3633]/20 hover:text-[#f85149] rounded transition-colors">
                     <Trash2 size={14} />
                   </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

       <div className="p-3 border-t border-[#30363d] mt-auto relative" ref={profileRef}>
        {showProfileMenu && (
          <div className="absolute bottom-full left-0 w-full px-3 pb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl overflow-hidden">
               <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-[#f85149] hover:bg-[#da3633]/10 flex items-center gap-2 transition-colors">
                 <LogOut size={16} /> Sign Out
               </button>
            </div>
          </div>
        )}
        <button onClick={() => setShowProfileMenu(!showProfileMenu)} className={cn("flex items-center gap-3 w-full px-2 py-2 text-sm text-[#c9d1d9] rounded-md transition-all", showProfileMenu ? "bg-[#161b22] text-white" : "hover:bg-[#161b22] hover:text-white")}>
          <div className="w-8 h-8 rounded-full bg-[#30363d] flex items-center justify-center border border-[#8b949e] shrink-0">
             <span className="font-bold text-xs text-white">{userData.initials}</span>
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="font-medium text-white truncate w-full text-left">{userData.name}</span>
            <span className="text-xs text-[#8b949e]">Free Plan</span>
          </div>
          <ChevronUp size={14} className={cn("ml-auto text-[#8b949e] transition-transform", showProfileMenu && "rotate-180")} />
        </button>
      </div>
    </div>
  );
}