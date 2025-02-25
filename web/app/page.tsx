"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

export default function ChatComponent() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    status, // Using status instead of deprecated isLoading
    error 
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
  });

  // Check if we're loading (status is either "submitted" or "streaming")
  const isLoading = ["submitted", "streaming"].includes(status);

  // Handle auto-scrolling when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Responsive design detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-gray-50">
      <header className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <h1 className="text-2xl font-bold text-blue-700">LangGraph Chat</h1>
        <p className="text-gray-500 text-sm">Powered by Claude 3.5 Sonnet</p>
      </header>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 border rounded-lg bg-white shadow-sm">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 my-8 space-y-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <div>
              <p className="font-medium">Start a conversation</p>
              <p className="text-sm">Type your message below to begin chatting</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-lg transition-all ${
                msg.role === "user"
                  ? "bg-blue-50 ml-8 sm:ml-16 border-blue-100 border"
                  : "bg-white mr-8 sm:mr-16 border-gray-100 border shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2 font-medium mb-2 text-sm">
                {msg.role === "user" ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">U</div>
                    <span>You</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">A</div>
                    <span>Assistant</span>
                  </>
                )}
              </div>
              <div className="whitespace-pre-wrap text-gray-800">{msg.content}</div>
            </div>
          ))
        )}

        {/* Loading indicator - only show when status is submitted or streaming */}
        {status === "submitted" && (
          <div className="p-4 bg-white rounded-lg border border-gray-100 mr-8 sm:mr-16 shadow-sm">
            <div className="flex items-center gap-2 font-medium mb-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">A</div>
              <span>Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-200"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-400"></div>
              </div>
              <span className="text-sm text-gray-500">Processing...</span>
            </div>
          </div>
        )}

        {/* Streaming indicator - different message for when the AI is responding */}
        {status === "streaming" && (
          <div className="p-4 bg-white rounded-lg border border-gray-100 mr-8 sm:mr-16 shadow-sm">
            <div className="flex items-center gap-2 font-medium mb-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">A</div>
              <span>Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-200"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animation-delay-400"></div>
              </div>
              <span className="text-sm text-gray-500">Typing...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800 mr-8 sm:mr-16">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Status Indicator */}
      <div className="flex justify-end mb-2">
        <span className="text-xs text-gray-500">
          {status === "ready" && messages.length > 0 && "Ready for your message"}
          {status === "submitted" && "Processing..."}
          {status === "streaming" && "Receiving response..."}
          {status === "error" && "Something went wrong"}
        </span>
      </div>

      {/* Message Input Form */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isMobile ? "" : "Sending..."}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              {isMobile ? "" : "Send"}
            </span>
          )}
        </button>
      </form>
    </div>
  );
}