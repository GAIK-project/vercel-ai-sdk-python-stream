# LangGraph Streaming Demo

A simple demonstration of LangGraph integration with Next.js, featuring real-time AI response streaming.

## Project Structure

```
langGraph-streaming/
├── python/          # FastAPI backend with LangGraph
├── web/             # Next.js frontend
└── README.md
```

## Overview

This demo shows:
- LangGraph for managing AI conversation flow
- Real-time streaming of AI responses in a React application
- Integration between FastAPI and Next.js using Server-Sent Events

## Setup

### Backend

```bash
cd python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env
```

### Frontend

```bash
cd web
pnpm i
echo "BACKEND_URL=http://127.0.0.1:8000" > .env.local
```

## Running

1. **Start backend**
```bash
cd python
python stream.py
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
3. LangGraph processes the message and streams Claude's response
4. Frontend displays tokens as they arrive in real-time

## Troubleshooting

- Verify your Anthropic API key is correct
- Check both servers are running (backend: 8000, frontend: 3000)
- Ensure network allows streaming connections