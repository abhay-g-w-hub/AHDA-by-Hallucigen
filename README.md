Demo Link: https://youtu.be/AhTp5TsGe9o

AHDA: Autonomous Hallucination Detection Agent

The Factual Firewall for Enterprise GenAI

AHDA is a production-grade, multi-agent orchestration framework designed to identify, flag, and verify hallucinations in AI-generated content. Built for high-stakes industries like Healthcare, Legal, and Finance, AHDA systematically audits LLM responses by decomposing them into atomic claims and cross-referencing them against real-time grounded evidence.

🚀 Key Features

- **Multi-Agent Orchestration:** A specialized pipeline of agents (Planner, Extractor, Retriever, Verifier, and Critic) working in concert via a state-machine architecture.
- **Real-Time Intelligence Reports:** Claim-by-claim verification with color-coded verdicts (TRUE, FALSE, UNVERIFIABLE), confidence scores, and detailed reasoning.
- **Evidence Backlinking:** Every verification verdict is supported by live source links and snippets retrieved from the web.
- **Hybrid High-Speed Engine:** Utilizes the **Groq Llama-3 API** for sub-second verification latency, paired with **OpenClaw** in the background for deep logging, memory, and persistence.
- **Cross-Platform Access:**
  - **Premium Web Dashboard:** A stunning "Sunset to Plum" themed interface with real-time workflow visualization.
  - **Telegram Bot Adapter:** On-the-go verification via a dedicated Telegram bot interface.
- **Critic Loop:** A self-correcting mechanism where the 'Critic' agent identifies weak evidence and triggers secondary, refined searches to ensure accuracy.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS (Custom Sunset-Plum Theme)
- **Animations:** Framer Motion (Workflow Visualizer, smooth transitions)
- **State Management:** React Hooks & `next-themes` (Dark/Light mode)

### Backend (Node.js Adapter)
- **Runtime:** Node.js
- **Framework:** Express
- **Messaging:** `node-telegram-bot-api`
- **Database:** SQLite (Memory & Conversation logs)

### AI Execution Engine (Python/Agent Layer)
- **Orchestration:** LangGraph-inspired logic
- **Inference:** Groq API (Llama-3.3-70B)
- **Agent Framework:** OpenClaw (Local execution via WSL)
- **Retrieval:** DuckDuckGo Search API

---

## 🏗️ Architecture Overview

AHDA employs a decoupled microservices architecture to ensure scalability and low-latency performance:

1.  **Frontend (Next.js):** Provides a rich UI/UX. Users paste text, and results are streamed via the Node backend.
2.  **Node.js Backend:** Acts as the API Gateway. It handles Telegram interactions and coordinates the AI pipeline.
3.  **Grounded Pipeline:**
    *   **Main Thread:** Uses Groq for ultra-fast Claim Extraction and Verification.
    *   **Background (WSL):** Triggers **OpenClaw** for persistent logging and agentic memory, ensuring no data loss and robust traceability.

---

## 🚦 Getting Started

To run the full AHDA prototype, you need to start three separate services.

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- WSL (for OpenClaw background tasks)
- API Keys: `GROQ_API_KEY`, `TELEGRAM_BOT_TOKEN`

### Step 1: Start the Engine (Node Backend)
```bash
cd ahda-prototype/node-backend
npm install
npm start
```
*Port: 8080*

### Step 2: Start the Telegram Adapter
```bash
cd ahda-prototype/node-backend
npm run start:telegram
```

### Step 3: Start the Frontend Dashboard
```bash
cd ahda-prototype/frontend
npm install
npm run dev
```
*URL: Hosted at http://localhost:3000 locally.

---

## 🎨 Design Aesthetic
The project features a premium **"Sunset to Plum Night Sky"** aesthetic.
- **Light Mode:** Vibrant Amber-to-Rose gradients representing a warm sunset.
- **Dark Mode:** Deep Plum-to-Midnight transitions with frosted-glass UI components.
- **Workflow Visualizer:** A real-time pulsing UI that shows exactly which agent is currently processing your data.

---

## 🔮 Future Roadmap: The Proactive Firewall
Currently, AHDA flags hallucinations after they are generated. Our roadmap includes:
- **Streaming Interception:** Verifying and correcting tokens *during* the LLM inference phase.
- **Enterprise RAG Integration:** Connecting AHDA directly to internal company knowledge bases (Notion, Confluence, Google Drive).
- **Domain-Specific Fine-Tuning:** Specialised verification models for Legal (Case Law) and Medical (PubMed) accuracy.