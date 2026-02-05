"use client";

import * as React from "react";
import { Send, Paperclip } from "lucide-react";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { Message } from "@/components/tambo/message";
import { useRepoChat } from "@/hooks/useRepoChat";
import { cn } from "@/lib/utils";

// 1. Define Props to accept the callback
interface MessageThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  onChatStart?: (firstMessage: string) => void;
}

export const MessageThreadFull = React.forwardRef<HTMLDivElement, MessageThreadProps>(
  ({ className, onChatStart, ...props }, ref) => {
    // Custom hook
    const { messages, isLoading, analyzeRepo, sendChatMessage } = useRepoChat();
    
    // Local state
    const [inputValue, setInputValue] = React.useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // 2. Ref to track if chat has started (avoids duplicate sidebar entries)
    const hasStartedRef = React.useRef(false);

    // Auto-resize textarea
    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, [inputValue]);

    // Handle sending logic
    const handleSendMessage = () => {
      if (!inputValue.trim() || isLoading) return;

      // 3. TRIGGER SIDEBAR UPDATE: If this is the first message
      if (!hasStartedRef.current && messages.length === 0 && onChatStart) {
        onChatStart(inputValue);
        hasStartedRef.current = true;
      }

      // Check if it looks like a GitHub URL to trigger analysis
      if (inputValue.includes("github.com")) {
        analyzeRepo(inputValue);
      } else {
        sendChatMessage(inputValue);
      }
      
      setInputValue("");
      
      // Reset height
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    return (
      <div 
        ref={ref} 
        className={cn("flex flex-col h-full w-full bg-[#0d1117]", className)} 
        {...props}
      >
        {/* Chat Area */}
        <ScrollableMessageContainer className="flex-1 p-4 md:p-6 pt-12 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[80%] text-[#8b949e] animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 mb-6 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center">
                <img src="/Octo-Icon.svg" alt="Logo" className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-[#c9d1d9] mb-2">Ready to Analyze</h3>
              <p className="max-w-md text-center text-sm">
                Paste a GitHub repository link (e.g., <span className="font-mono text-[#58a6ff]">https://github.com/owner/repo</span>) to generate a summary and start chatting.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <Message 
                key={idx} 
                role={msg.role} 
                content={msg.content} 
              />
            ))
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <Message role="assistant" content="" isLoading={true} />
          )}
        </ScrollableMessageContainer>

        {/* Input Area (Fixed at bottom) */}
        <div className="p-4 bg-[#0d1117] border-t border-[#30363d]">
          <div className="max-w-4xl mx-auto relative rounded-xl border border-[#30363d] bg-[#161b22] shadow-sm focus-within:ring-2 focus-within:ring-[#1f6feb] transition-all">
            
            {/* Textarea */}
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

            {/* Toolbar Actions */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button 
                type="button"
                className="p-2 text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d] rounded-md transition-colors"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  inputValue.trim() && !isLoading
                    ? "bg-[#238636] text-white hover:bg-[#2ea043] shadow-md"
                    : "bg-[#21262d] text-[#8b949e] cursor-not-allowed"
                )}
              >
                <Send size={18} className={cn(inputValue.trim() && !isLoading && "ml-0.5")} />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-2">
             <p className="text-xs text-[#8b949e]">
               RepoExplainer can make mistakes. Verify important code info.
             </p>
          </div>
        </div>
      </div>
    );
  }
);

MessageThreadFull.displayName = "MessageThreadFull";