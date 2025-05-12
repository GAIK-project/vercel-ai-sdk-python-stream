"use client";

import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status } =
    useChat({
      // api: "/api/simple", // Straight to FastAPI (see next.config.ts)
      // streamProtocol: "text", // Only needed if you want use this simple API without route handler
      api: "api/python", // === localhost:3000/api/python
      initialMessages: [
        {
          id: "initial",
          role: "system",
          content: "You are a friendly AI assistant who responds in English.",
        },
      ],
    });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-4">Chat Application</h1>

      <div className="flex flex-col space-y-4 mb-16">
        {messages
          .filter((m) => m.role !== "system")
          .map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-lg ${
                m.role === "user" ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"
              }`}
            >
              <strong>{m.role === "user" ? "You: " : "AI: "}</strong>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md p-4 mb-8 border-t bg-white"
      >
        <div className="flex space-x-2">
          <input
            className="flex-1 p-2 border rounded"
            value={input}
            placeholder="Ask something..."
            onChange={handleInputChange}
            disabled={status === "submitted" || status === "streaming"}
          />
          <button
            type="submit"
            className="p-2 border rounded bg-blue-500 text-white"
            disabled={status === "submitted" || status === "streaming"}
          >
            {status === "submitted" || status === "streaming" ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
