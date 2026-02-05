"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { User } from "lucide-react";
import * as React from "react";
import { Streamdown } from "streamdown"; 
import { markdownComponents } from "./markdown-components";

// 1. Define styles for the row layout
export const messageVariants = cva(
  "flex w-full gap-4 p-4 transition-all duration-200",
  {
    variants: {
      role: {
        user: "flex-row-reverse bg-transparent", 
        assistant: "bg-[#161b22] border-y border-[#30363d]", 
        system: "hidden", // System messages are hidden
      },
    },
    defaultVariants: {
      role: "assistant",
    },
  },
);

// 2. Define styles for the text bubble itself
const bubbleVariants = cva(
  "relative max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
  {
    variants: {
      role: {
        user: "bg-[#1f6feb] text-white rounded-tr-sm", 
        assistant: "bg-transparent text-[#c9d1d9] p-0 shadow-none max-w-full",
        system: "hidden", // Added 'system' here to fix your TypeScript error
      },
    },
    defaultVariants: {
      role: "assistant",
    },
  },
);

// 3. Explicitly define Props to include 'content'
export interface MessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageVariants> {
  content: string; // <--- This fixes the "Property 'content' does not exist" error
  role: "user" | "assistant" | "system";
  isLoading?: boolean;
}

export function Message({
  className,
  role,
  content,
  isLoading,
  ...props
}: MessageProps) {
  return (
    <div
      className={cn(messageVariants({ role }), className)}
      {...props}
    >
      {/* Avatar Section */}
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border",
        role === "user" 
          ? "bg-[#1f6feb] border-[#1f6feb] text-white hidden" 
          : "bg-[#21262d] border-[#30363d] text-[#c9d1d9]"
      )}>
        {role === "user" ? <User className="h-5 w-5" /> : <img src="/Octo-Icon.svg" className="w-5 h-5" alt="AI" />}
      </div>

      {/* Message Content Layout */}
      <div className={cn("flex flex-col gap-2", role === "user" ? "items-end" : "items-start", "w-full overflow-hidden")}>
        
        {/* Name Label */}
        <span className="text-xs font-medium text-[#8b949e] ml-1">
          {role === "user" ? "You" : "RepoExplainer"}
        </span>

        {/* The Text Bubble */}
        <div className={cn(bubbleVariants({ role }))}>
          {role === "assistant" ? (
            // Render Markdown for AI responses
            <Streamdown 
                components={markdownComponents} 
                className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0"
            >
              {content || ""}
            </Streamdown>
          ) : (
            // Plain text for user messages
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>

        {/* Loading Animation */}
        {isLoading && role === "assistant" && (
           <div className="flex items-center gap-1 h-4 ml-2 mt-1">
             <span className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
             <span className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full animate-bounce [animation-delay:-0.2s]"></span>
             <span className="w-1.5 h-1.5 bg-[#58a6ff] rounded-full animate-bounce [animation-delay:-0.1s]"></span>
           </div>
        )}
      </div>
    </div>
  );
}