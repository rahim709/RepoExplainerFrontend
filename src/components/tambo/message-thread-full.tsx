"use client";

import * as React from "react";
import { Send, Paperclip } from "lucide-react";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { Message } from "@/components/tambo/message";
import { useRepoChat, ChatMessage } from "@/hooks/useRepoChat"; 
import { cn } from "@/lib/utils";

// UPDATE: Add new props to Interface
interface MessageThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  onChatStart?: (firstMessage: string) => void;
  initialMessages?: ChatMessage[]; 
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
}

export const MessageThreadFull = React.forwardRef<HTMLDivElement, MessageThreadProps>(
  ({ className, onChatStart, initialMessages = [], onMessagesUpdate, ...props }, ref) => {
    
    // UPDATE: Pass initialMessages to the hook
    const { messages, isLoading, analyzeRepo, sendChatMessage } = useRepoChat(initialMessages);
    
    const [inputValue, setInputValue] = React.useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const hasStartedRef = React.useRef(false);

    // UPDATE: Sync messages back to parent whenever they change
    React.useEffect(() => {
      if (messages.length > 0 && onMessagesUpdate) {
        onMessagesUpdate(messages);
      }
    }, [messages, onMessagesUpdate]);

    // Auto-resize textarea
    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, [inputValue]);

    const handleSendMessage = () => {
      if (!inputValue.trim() || isLoading) return;

      if (!hasStartedRef.current && messages.length === 0 && onChatStart) {
        onChatStart(inputValue);
        hasStartedRef.current = true;
      }

      if (inputValue.includes("github.com")) {
        analyzeRepo(inputValue);
      } else {
        sendChatMessage(inputValue);
      }
      
      setInputValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    return (
      <div ref={ref} className={cn("flex flex-col h-full w-full bg-[#0d1117]", className)} {...props}>
        <ScrollableMessageContainer className="flex-1 p-4 md:p-6 pt-12 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[80%] text-[#8b949e] animate-in fade-in zoom-in duration-500">
               <div className="w-16 h-16 mb-6 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center">
                <img src="/Octo-Icon.svg" alt="Logo" className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-[#c9d1d9] mb-2">Ready to Analyze</h3>
              <p className="max-w-md text-center text-sm">
                Paste a GitHub repository link to generate a summary.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <Message key={idx} role={msg.role} content={msg.content} />
            ))
          )}
          {isLoading && <Message role="assistant" content="" isLoading={true} />}
        </ScrollableMessageContainer>

        <div className="p-4 bg-[#0d1117] border-t border-[#30363d]">
           <div className="max-w-4xl mx-auto relative rounded-xl border border-[#30363d] bg-[#161b22] shadow-sm focus-within:ring-2 focus-within:ring-[#1f6feb] transition-all">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a GitHub URL or ask a question..."
              rows={1}
              disabled={isLoading}
              className="w-full bg-transparent text-[#c9d1d9] placeholder:text-[#8b949e] px-4 py-3 pr-24 rounded-xl resize-none focus:outline-none max-h-[200px] overflow-y-auto"
              style={{ minHeight: "52px" }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button className="p-2 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d] rounded-md transition-colors"><Paperclip size={18} /></button>
              <button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className={cn("p-2 rounded-md transition-all", inputValue.trim() ? "bg-[#238636] text-white" : "bg-[#21262d] text-[#8b949e]")}><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
MessageThreadFull.displayName = "MessageThreadFull";