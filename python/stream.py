import json
import os
from typing import Any, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph

load_dotenv()

# -------------------- Define model --------------------
model = ChatAnthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    model="claude-3-5-sonnet-20240620",
    temperature=0.7,
    streaming=True  # Ensure streaming is enabled
)

# -------------------- Define graph --------------------


async def call_model(state: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the agent by calling the LLM."""
    messages = state["messages"]
    response = await model.ainvoke(messages, config=config)
    return {"messages": [response]}

# Build graph
workflow = StateGraph(MessagesState)
workflow.add_node("agent", call_model)
workflow.add_edge(START, "agent")
workflow.add_edge("agent", END)

# Initialize memory and compile graph
memory = MemorySaver()
app_graph = workflow.compile(checkpointer=memory)
print("Graph compiled successfully")

# -------------------- FastAPI settings --------------------
app = FastAPI(
    title="LangGraph Chat API",
    description="Simple API for LangGraph chat",
    version="1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/stream_chat")
async def stream_chat(question: str = Query(...), thread_id: str = Query("default")):
    """Stream chat response for the given query."""
    config = {"configurable": {"thread_id": thread_id}}

    async def event_stream():
        # Initialize with user's query
        initial_state = {"messages": [HumanMessage(content=question)]}

        # Stream tokens directly to frontend
        try:
            async for token, metadata in app_graph.astream(
                initial_state,
                config,
                stream_mode="messages"
            ):
                if token.content:
                    yield f"data: {json.dumps({'type': 'token', 'content': token.content})}\n\n"
        except Exception as e:
            print(f"Streaming error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        # Close stream
        yield "event: close\ndata: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

# Health check endpoint


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "LangGraph Chat API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
