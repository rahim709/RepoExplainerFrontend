import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface ChatMessage {
  role: "user" | "assistant" | "model";
  content: string;
  uiComponent?: string; 
  uiData?: any;         
}

export interface ProjectData {
  _id: string;
  repoName: string;
  owner: string;
  updatedAt: string;
  chatHistory: ChatMessage[]; 
}

export function useRepoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ProjectData[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 1. FETCH ALL PROJECTS
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/api/user/allprojects");
        setHistory(data.projects || []);
      } catch (error) {
        console.error("Failed to load projects", error);
      }
    };
    fetchHistory();
  }, []);

  // 2. SELECT CHAT
  const selectChat = useCallback((projectId: string) => {
    const project = history.find(p => p._id === projectId);
    
    if (project) {
      setCurrentProjectId(projectId);
      
      // Transform messages for UI
      const formattedMessages = project.chatHistory.map((msg: any) => ({
        ...msg,
        role: msg.role === 'model' ? 'assistant' : msg.role
      }));
      
      // --- NEW LOGIC: PREPEND THE REPO URL IF MISSING ---
      // If the first message is from the AI (Summary), we artificially add the User's "Analyzed..." msg
      if (formattedMessages.length > 0 && formattedMessages[0].role !== 'user') {
         const fakeUserMsg: ChatMessage = { 
           role: 'user', 
           content: `Analyzed repository: https://github.com/${project.owner}/${project.repoName}` 
         };
         setMessages([fakeUserMsg, ...formattedMessages]);
      } else {
         setMessages(formattedMessages);
      }
    }
  }, [history]);

  // 3. ANALYZE REPO
  const analyzeRepo = async (repoUrl: string) => {
    setIsLoading(true);
    const cleanUrl = repoUrl.trim();
    
    // Show this immediately in UI
    const userStartMsg: ChatMessage = { role: "user", content: `Analyzing ${cleanUrl}...` };
    setMessages([userStartMsg]);

    try {
      const { data: project } = await api.post("/api/repo", { url: cleanUrl });
      
      setCurrentProjectId(project._id);

      // --- FIX: Prevent Duplicate Keys ---
      setHistory(prev => {
        const filtered = prev.filter(p => p._id !== project._id);
        return [project, ...filtered];
      });

      // Get AI Summary Message
      const aiSummaryMsg = project.chatHistory.map((msg: any) => ({
        ...msg,
        role: msg.role === 'model' ? 'assistant' : msg.role
      }));

      // --- NEW LOGIC: SHOW BOTH MESSAGES ---
      // 1. User: "Analyzing..."
      // 2. AI: "Here is the summary..."
      setMessages([userStartMsg, ...aiSummaryMsg]);

    } catch (error: any) {
      const errorMsg = error.response?.status === 402 
        ? "Repo too large or GitHub API limit reached." 
        : (error.response?.data?.message || "Failed to analyze repository");
      
      toast.error(errorMsg);
      setMessages([]); // Reset on failure so user can try again
    } finally {
      setIsLoading(false);
    }
  };

  // 4. SEND MESSAGE
  const sendChatMessage = async (userMessage: string) => {
    if (!userMessage.trim() || !currentProjectId) return;

    const newUserMsg: ChatMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const { data } = await api.post(`/api/user/chat?projectId=${currentProjectId}`, { 
        message: userMessage
      });

      const newAiMsg: ChatMessage = { role: "assistant", content: data.response };

      setMessages((prev) => [...prev, newAiMsg]);

      // Update Sidebar History State
      setHistory((prev) => prev.map(p => {
        if (p._id === currentProjectId) {
          return {
            ...p,
            chatHistory: [...p.chatHistory, newUserMsg, newAiMsg] 
          };
        }
        return p;
      }));

    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentProjectId(null);
    setMessages([]);
    router.replace("/chat"); 
  };

  return { 
    messages, 
    isLoading, 
    history,
    currentProjectId,
    analyzeRepo, 
    sendChatMessage, 
    selectChat,
    handleNewChat 
  };
}