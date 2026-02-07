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
  const [isHistoryLoading, setIsHistoryLoading] = useState(true); 
  const router = useRouter();

  // 1. FETCH ALL PROJECTS & SORT BY DATE
  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true); 
      try {
        const { data } = await api.get("/api/user/allprojects");
        const projects = data.projects || [];
        
        // --- LOGIC: Sort by Latest Date First ---
        projects.sort((a: ProjectData, b: ProjectData) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setHistory(projects);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setIsHistoryLoading(false); 
      }
    };
    fetchHistory();
  }, []);

  // 2. SELECT CHAT
  const selectChat = useCallback((projectId: string) => {
    const project = history.find(p => String(p._id) === String(projectId));
    
    if (project) {
      setCurrentProjectId(projectId);
      
      const formattedMessages = (project.chatHistory || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.content,
        uiComponent: msg.uiComponent,
        uiData: msg.uiData
      }));
      
      setMessages(formattedMessages);
    }
  }, [history]);

  // 3. ANALYZE REPO
  const analyzeRepo = async (repoUrl: string) => {
    setIsLoading(true);
    const cleanUrl = repoUrl.trim();
    
    const userStartMsg: ChatMessage = { role: "user", content: `Analyzing ${cleanUrl}...` };
    setMessages([userStartMsg]);

    try {
      const { data: project } = await api.post("/api/repo", { url: cleanUrl });
      
      setCurrentProjectId(project._id);

      // Add new project to the TOP (it is now the latest)
      setHistory(prev => {
        const filtered = prev.filter(p => String(p._id) !== String(project._id));
        return [project, ...filtered];
      });

      const backendMessages = (project.chatHistory || []).map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.content,
        uiComponent: msg.uiComponent,
        uiData: msg.uiData
      }));

      setMessages([userStartMsg, ...backendMessages]);

    } catch (error: any) {
      console.error("Analysis failed", error);
      let errorMsg = "Failed to analyze repository";
      
      if (error.response?.status === 402) {
        errorMsg = "Repository too large or GitHub Rate Limit exceeded.";
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      toast.error(errorMsg);
      setMessages([]);
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

      const newAiMsg: ChatMessage = { 
        role: "assistant", 
        content: data.response 
      };

      setMessages((prev) => [...prev, newAiMsg]);

      // Update history and move current chat to TOP
      setHistory((prev) => {
        // Find current project
        const currentProject = prev.find(p => String(p._id) === String(currentProjectId));
        const others = prev.filter(p => String(p._id) !== String(currentProjectId));

        if (currentProject) {
          const updatedProject = {
            ...currentProject,
            updatedAt: new Date().toISOString(), // Update timestamp
            chatHistory: [...currentProject.chatHistory, newUserMsg, newAiMsg]
          };
          // Return updated project first, then others
          return [updatedProject, ...others];
        }
        return prev;
      });

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
    isHistoryLoading,
    history,
    currentProjectId,
    analyzeRepo, 
    sendChatMessage, 
    selectChat,
    handleNewChat 
  };
}