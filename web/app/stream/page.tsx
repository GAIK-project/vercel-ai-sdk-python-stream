"use client";

import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/python",
      initialMessages: [
        {
          id: "initial",
          role: "system",
          content: "Olet ystävällinen tekoälyavustaja, joka vastaa suomeksi.",
        },
      ],
    });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-2xl font-bold mb-4">Chat-sovellus</h1>

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
              <strong>{m.role === "user" ? "Sinä: " : "Tekoäly: "}</strong>
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
            placeholder="Kysy jotain..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 border rounded bg-blue-500 text-white"
            disabled={isLoading}
          >
            {isLoading ? "..." : "Lähetä"}
          </button>
        </div>
      </form>
    </div>
  );
}
