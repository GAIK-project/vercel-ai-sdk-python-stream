# AI Chat Streaming Demo

A demonstration of real-time AI response streaming using FastAPI and Next.js with the Vercel AI SDK, featuring two different implementations: one using LangGraph and another using OpenAI directly.

## Project Structure

```
langGraph-streaming/
├── python/          # FastAPI backend (two different implementations)
│   ├── stream.py            # OpenAI streaming backend
│   └── langgraph_stream.py  # LangGraph streaming backend
├── web/             # Next.js frontend
│   ├── app/stream/  # Frontend for OpenAI streaming
│   └── app/         # Root page uses LangGraph streaming
└── README.md
```

## Overview

This demo shows:

- LangGraph for managing AI conversation flow
- Real-time streaming of AI responses in a React application
- Integration between FastAPI and Next.js using Server-Sent Events
- Two different streaming implementations:
  1. Direct OpenAI streaming
  2. LangGraph-based streaming with Anthropic Claude

## Setup

### Backend

```bash
cd python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Set up the environment variables by referring to `.env.example`:

```bash
cp .env.example .env
# Then edit .env to add your OpenAI and Anthropic API keys
```

### Frontend

```bash
cd web
pnpm install
```

## Running

You can run either one of the backends or both (using different terminal windows):

### Option 1: Run OpenAI Streaming Backend

1. **Start OpenAI backend**

```bash
cd python
python stream.py  # Runs on port 8000 with /api/chat endpoint
```

2. **Start frontend**

```bash
cd web
pnpm dev
```

3. Open browser at `http://localhost:3000/stream`

### Option 2: Run LangGraph Streaming Backend

1. **Start LangGraph backend**

```bash
cd python
python langgraph_stream.py  # Runs on port 8000 with /stream_chat endpoint
```

2. **Start frontend**

```bash
cd web
pnpm dev
```

3. Open browser at `http://localhost:3000`

## How It Works

1. User sends a message via the React UI
2. Next.js app streams the message to FastAPI backend
   - `/api/python` route forwards requests to the OpenAI backend (`stream.py`)
   - `/api/chat` route forwards requests to the LangGraph backend (`langgraph_stream.py`)
3. LLM models process the message and stream responses back:
   - OpenAI backend: Uses OpenAI's streaming API directly
   - LangGraph backend: Uses Anthropic Claude through LangGraph's streaming capabilities
4. Frontend displays tokens as they arrive in real-time

## Routes and Endpoint Mapping

- **FastAPI Backends:**
  - `stream.py` - Exposes `/api/chat` endpoint (OpenAI streaming)
  - `langgraph_stream.py` - Exposes `/stream_chat` endpoint (LangGraph streaming)

- **Next.js Frontend:**
  - `/api/python/route.ts` - Forwards to OpenAI backend's `/api/chat` endpoint
  - `/api/chat/route.ts` - Forwards to LangGraph backend's `/stream_chat` endpoint
  - `/stream/page.tsx` - Chat UI that uses `/api/python` route (OpenAI)
  - `/page.tsx` - Chat UI that uses `/api/chat` route (LangGraph)
