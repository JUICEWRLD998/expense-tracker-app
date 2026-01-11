"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  isLoading?: boolean
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  const isUser = role === "user"

  // Simple markdown-like formatting
  const formatContent = (text: string) => {
    // Split by code blocks first
    const parts = text.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, index) => {
      // Code blocks
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3).replace(/^\w+\n/, "") // Remove language identifier
        return (
          <pre key={index} className="bg-muted p-3 rounded-md overflow-x-auto my-2 text-sm">
            <code>{code}</code>
          </pre>
        )
      }
      
      // Regular text with inline formatting
      return (
        <span key={index}>
          {part.split("\n").map((line, lineIndex) => {
            // Headers
            if (line.startsWith("### ")) {
              return <h3 key={lineIndex} className="font-semibold text-base mt-3 mb-1">{line.slice(4)}</h3>
            }
            if (line.startsWith("## ")) {
              return <h2 key={lineIndex} className="font-semibold text-lg mt-3 mb-1">{line.slice(3)}</h2>
            }
            if (line.startsWith("# ")) {
              return <h1 key={lineIndex} className="font-bold text-xl mt-3 mb-1">{line.slice(2)}</h1>
            }
            
            // Bullet points
            if (line.startsWith("- ") || line.startsWith("* ")) {
              return (
                <div key={lineIndex} className="flex gap-2 ml-2">
                  <span>•</span>
                  <span>{formatInlineText(line.slice(2))}</span>
                </div>
              )
            }
            
            // Numbered lists
            const numberedMatch = line.match(/^(\d+)\.\s(.*)/)
            if (numberedMatch) {
              return (
                <div key={lineIndex} className="flex gap-2 ml-2">
                  <span>{numberedMatch[1]}.</span>
                  <span>{formatInlineText(numberedMatch[2])}</span>
                </div>
              )
            }
            
            // Empty lines
            if (line.trim() === "") {
              return <br key={lineIndex} />
            }
            
            // Regular paragraphs
            return <p key={lineIndex} className="my-1">{formatInlineText(line)}</p>
          })}
        </span>
      )
    })
  }
  
  // Format inline text (bold, italic, code)
  const formatInlineText = (text: string) => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Inline code
    text = text.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-primary/10 ml-8" : "bg-muted mr-8"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <p className="text-sm font-medium">
          {isUser ? "You" : "AI Assistant"}
        </p>
        {isLoading ? (
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
          </div>
        ) : (
          <div className="text-sm leading-relaxed">
            {formatContent(content)}
          </div>
        )}
      </div>
    </div>
  )
}
