import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation"; // Import useRouter

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useRepoChat(initialMessages: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const analyzeRepo = async (repoUrl: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: `Analyzing repository: ${repoUrl}` }]);

    try {
        console.log("Analyzing repo:", repoUrl);
      const response = await api.post("/api/repo", { url: repoUrl });
      const project = response.data;
      const analysis = project.aiAnalysis;

      const markdownContent = `
### 🚀 ${analysis.projectName}

${analysis.summary}

---

### 🛠 Tech Stack
${analysis.techStack.map((tech: string) => `\`${tech}\``).join(" ")}

### 🏛 Architecture
**${analysis.architecture.style}**
${analysis.architecture.explanation}

### ✨ Key Features
${analysis.keyFeatures.map((feat: string) => `* ${feat}`).join("\n")}
      `.trim();

      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: markdownContent }
      ]);
      
      setCurrentProjectId(project._id);

    } catch (error: any) {
      console.error("Analysis failed", error);
      
      // --- FIX: Handle 401 (Unauthorized) ---
      if (error.response?.status === 401) {
        // Redirect to Login if token is missing/expired
        router.push("/auth/login");
        return; 
      }

      const errorMessage = error.response?.data?.message || "Failed to analyze repository.";
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: `❌ **Error:** ${errorMessage}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newMessage: ChatMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await api.post("/api/user/chat", { 
        message: userMessage,
        projectId: currentProjectId 
      });

      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: response.data.answer || "Message received." }
      ]);
    } catch (error: any) {
      console.error("Chat failed", error);

      // --- FIX: Handle 401 (Unauthorized) ---
      if (error.response?.status === 401) {
        router.push("/auth/login");
        return;
      }

      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Sorry, I encountered an error connecting to the chat service." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, analyzeRepo, sendChatMessage };
}