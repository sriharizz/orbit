# Orbit 🪐

**Orbit: Proactive Context-Aware Learning Built on AWS**

Current ed-tech relies on passive video consumption, leading to low completion rates and superficial understanding. **Orbit** is a serverless, event-driven learning platform that intercepts video lectures at critical AI-timed checkpoints, forcing active participation before the student can continue.

Built entirely on AWS, Orbit utilizes a fully serverless architecture scaling limitlessly without infrastructure overhead.

## 🚀 Key Features

1. **Video Interception**: Pauses lectures at AI-timed checkpoints — video locks until you code.
2. **Secure Code Editor**: Full-screen IDE with syntax highlighting, starter code, and instant evaluation.
3. **Conceptual Code Evaluation**: Amazon Bedrock (Nova 2 Lite) evaluates the logic of submitted code, not just syntax, providing adaptive, real-time hints when a student struggles.
4. **Viva Lock Verification**: To ensure true comprehension, students must verbally or textually explain their solution. Bedrock processes the input.
5. **Anti-Cheat Validation**: Bedrock Guardrails acts as a strict Anti-Cheat filter, instantly blocking copy-pasted or AI-generated answers.
6. **Contextual Mentor Mode**: Using Bedrock Knowledge Bases and Amazon S3, Orbit runs RAG on the actual video transcripts to answer doubts with highly specific, lecture-linked context rather than generic internet search results.

## 🏗 Architecture

Orbit leverages generative AI natively on AWS to transform passive watchers into active, verified builders.

- **Frontend**: React, Three.js, GSAP, Web Speech API. Hosted on **AWS Amplify** (Global CDN).
- **API & Compute**: **AWS API Gateway** routes traffic to **AWS Lambda (FastAPI)** for serverless execution.
- **Database**: **Amazon DynamoDB** stores and retrieves session states (tracking attempts, strict/mentor modes).
- **Core AI Inference**: **Amazon Bedrock (Nova 2 Lite)** evaluates code logic and handles the Viva flow.
- **Safety**: **Bedrock Guardrails** provides real-time anti-cheat validation.
- **RAG Knowledge**: **Bedrock Knowledge Bases** fetches context from **Amazon S3** (video transcripts) to provide lecture-accurate Mentor Mode responses.

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- AWS Account with Bedrock access (Nova 2 Lite enabled)

### Backend Setup (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (`.env`):
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend/orbit-builder-2
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🌍 "AI for Bharat" Relevance

Orbit is designed to scale limitlessly to millions of learners without prohibitive infrastructure costs. Future plans include optimizing for low-bandwidth environments (tier-2/3 cities) and introducing institutional dashboards for colleges and bootcamps to track genuine skill progression, directly addressing the need for scalable, high-quality education in India.
