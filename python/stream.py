import json
import os
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from openai import OpenAI
from pydantic import BaseModel

# Load environment variables
load_dotenv()

app = FastAPI()

# Initialize OpenAI client
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

class Message(BaseModel):
    role: str
    content: str

class Request(BaseModel):
    messages: List[Message]

@app.post("/api/chat")
async def chat(request: Request):
    """
    Endpoint that produces streamed responses from OpenAI for Vercel AI SDK.
    """
    messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    
    def generate_stream():
        # Create OpenAI stream
        stream = client.chat.completions.create(
            model="gpt-4.1-nano-2025-04-14",
            messages=messages,
            stream=True,
        )
        
        # Process stream and send it in Vercel AI SDK format
        for chunk in stream:
            if chunk.choices:
                choice = chunk.choices[0]
                # Send content in correct format
                # 0: is text, formatted as JSON string
                if choice.delta.content:
                    yield f"0:{json.dumps(choice.delta.content)}\n"
                
                # When response is complete
                if choice.finish_reason:
                    if hasattr(chunk, 'usage') and chunk.usage:
                        prompt_tokens = chunk.usage.prompt_tokens if chunk.usage.prompt_tokens else 0
                        completion_tokens = chunk.usage.completion_tokens if chunk.usage.completion_tokens else 0
                        # Send final part
                        yield f'e:{{"finishReason":"{choice.finish_reason}","usage":{{"promptTokens":{prompt_tokens},"completionTokens":{completion_tokens}}},"isContinued":false}}\n'
    
    # Return StreamingResponse
    response = StreamingResponse(generate_stream(), media_type="text/event-stream")
    # Important: Vercel AI SDK needs this header
    response.headers["x-vercel-ai-data-stream"] = "v1"
    return response

# Simple health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)