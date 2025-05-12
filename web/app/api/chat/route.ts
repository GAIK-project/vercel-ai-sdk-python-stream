import { LangChainAdapter } from "ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Parse the request
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;
    
    // Define backend URL
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    const url = `${backendUrl}/stream_chat?question=${encodeURIComponent(
      prompt
    )}&thread_id=default`;

    console.log(`Sending request: ${url}`);

    // Fetch response from backend
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with an error: ${response.status}`);
    }

    // Convert response to stream format
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Add new data to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process all complete SSE messages
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || ""; // Last part might be incomplete

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                
                try {
                  const parsedData = JSON.parse(data);
                  // Only process token events and ignore complete events
                  if (parsedData.type === "token" && parsedData.content) {
                    controller.enqueue(parsedData.content);
                  }
                } catch (e) {
                  console.error("Error parsing JSON:", e);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error processing stream:", error);
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    // Use LangChainAdapter to convert stream response
    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error: unknown) {
    console.error("Error in /api/chat route:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}