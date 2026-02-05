import { useState, useEffect } from "react";
import api from "@/lib/axios";

// Define the shape of a message
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// UPDATE: Accept 'initialMessages' as an argument (Default to empty array)
export function useRepoChat(initialMessages: ChatMessage[] = []) {
  
  // Initialize state with the passed messages
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [repoContext, setRepoContext] = useState<string | null>(null);

  // UPDATE: When switching chats, update the internal state immediately
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const analyzeRepo = async (repoUrl: string) => {
    setIsLoading(true);
    setMessages([{ role: "user", content: `Analyzing repository: ${repoUrl}` }]);

    try {
      const response = await api.post("/repo/analyze", { url: repoUrl });
      const summary = response.data.summary;
      setRepoContext(summary);
      setMessages((prev) => [...prev, { role: "assistant", content: summary }]);
    } catch (error: any) {
      console.error("Analysis failed", error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Error: Failed to analyze repository." }
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
      const response = await api.post("/chat/message", { 
        message: userMessage,
        context: repoContext 
      });

      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: response.data.answer }
      ]);
    } catch (error: any) {
      console.error("Chat failed", error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Sorry, I encountered an error." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, analyzeRepo, sendChatMessage };
}