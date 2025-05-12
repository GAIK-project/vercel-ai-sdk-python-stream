// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

// If you want to forward requests to a separate FastAPI server
export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    // Forward request to FastAPI
    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Return the response as-is to maintain streaming
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "x-vercel-ai-data-stream": "v1",
      },
    });  } catch (error) {
    console.error("Error forwarding to FastAPI:", error);
    return NextResponse.json(
      { error: "Failed to connect to API backend" },
      { status: 500 }
    );
  }
}
