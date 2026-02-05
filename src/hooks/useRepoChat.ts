import { useState } from "react";
import api from "@/lib/axios";
// The actual import for the Message component/type
import { Message } from "@/components/tambo/message";

/**
 * Interface for the chat message data structure.
 * We define this locally to ensure the state knows exactly what data it holds
 * (role and content), regardless of the Component definition.
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useRepoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [repoContext, setRepoContext] = useState<string | null>(null);

  /**
   * 1. Analyze Repository
   * Takes a GitHub URL, sends it to the backend, and displays the summary.
   */
  const analyzeRepo = async (repoUrl: string) => {
    setIsLoading(true);
    // Clear previous chat when analyzing a new repo
    setMessages([{ role: "user", content: `Analyzing repository: ${repoUrl}` }]);

    try {
      const response = await api.post("/repo/analyze", { url: repoUrl });
      
      const summary = response.data.summary;
      
      // Store the summary/context for future chat questions
      setRepoContext(summary);
      
      // Add the summary as the AI's first response
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: summary }
      ]);
    } catch (error: any) {
      console.error("Analysis failed", error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Error: Failed to analyze repository. Please check the URL or try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. Send Chat Message
   * Sends a follow-up question to the backend using the current context.
   */
  const sendChatMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Immediately add the user's message to the UI
    const newMessage: ChatMessage = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      console.log("Chat response:", userMessage);
      const response = await api.post("/chat/message", { 
        message: userMessage,
        // Send the repo summary/context so the AI knows what we are talking about
        context: repoContext 
      });
      // Add the AI's answer to the UI
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: response.data.answer }
      ]);
    } catch (error: any) {
      console.error("Chat failed", error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "Sorry, I encountered an error processing your request." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    messages, 
    isLoading, 
    analyzeRepo, 
    sendChatMessage 
  };
}