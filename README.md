# AI Trip Planner

An AI-powered trip planning application that leverages multiple AI agents to provide personalized travel recommendations and optimized itineraries.

---

## 🚀 Features

- **Research Agent (Gemini AI)**: Gathers and analyzes destination data, attractions, hotels, and travel options.
- **Optimization Agent (Claude AI)**: Generates the most efficient and enjoyable itinerary based on user preferences and constraints.
- **CSV & JSON Data Handling**: Converts API responses into structured data for easier processing.
- **Interactive Frontend**: Built with React + Tailwind CSS for smooth user experience.
- **Backend API**: Powered by FastAPI to manage AI requests, process data, and return optimized trip plans.

---

## 🛠️ Tech Stack

| Layer              | Technology            |
|-------------------|---------------------|
| Frontend           | React, Tailwind CSS  |
| Backend            | FastAPI, Python      |
| AI Agents          | Gemini AI, Claude AI |
| Data Handling      | Pandas, JSON, CSV   |
| Deployment         | Vercel / Optional   |

---

## 💡 How It Works

1. User inputs travel preferences (destinations, duration, budget, interests).  
2. **Research Agent** queries AI models and external APIs to gather destination data.  
3. Data is processed and converted into structured formats (JSON → CSV).  
4. **Optimization Agent** generates an itinerary that maximizes enjoyment while minimizing travel time and cost.  
5. Frontend displays the trip plan interactively with recommended places, activities, and logistics.

---

## 📂 Project Structure

ai-trip-planner/
│
├─ backend/ # FastAPI backend
│ ├─ main.py
│ ├─ research_agent.py
│ ├─ optimization_agent.py
│ └─ requirements.txt
│
├─ frontend/ # React + Tailwind CSS frontend
│ ├─ src/
│ └─ package.json
│
├─ data/ # Stores JSON/CSV data
│
├─ .env # Environment variables for API keys
└─ README.md

# AI Trip Planner

A simple AI-powered trip planner using Gemini AI and Claude AI agents for research and optimization.

---

## ⚙️ Setup

# Clone the repo
git clone https://github.com/alhumanoor1419/ai-trip-planner.git
cd ai-trip-planner

# Setup backend
cd backend
python -m venv .venv        # Create virtual environment

# Activate environment
# Mac/Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY=your_gemini_api_key
export CLAUDE_API_KEY=your_claude_api_key

# Run backend
uvicorn main:app --reload

# Setup frontend
cd ../frontend
npm install
npm start
