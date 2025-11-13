# backend/server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from research_agent import ResearchAgent, BackendConfigError

app = Flask(__name__)
CORS(app)

# logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trip-planner-server")

# instantiate agent (safe: ResearchAgent will raise BackendConfigError if config missing)
try:
    agent = ResearchAgent()
    logger.info("ResearchAgent initialized.")
except BackendConfigError as e:
    agent = None
    logger.error(f"ResearchAgent init failed: {e}")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "agent_ready": agent is not None}), 200

@app.route("/generate-trip", methods=["POST"])
def generate_trip():
    if agent is None:
        return jsonify({"error": "Backend not configured. Check GEMINI_API_KEY and server logs."}), 500

    data = request.json or {}
    destination = data.get("destination", "Unknown")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    budget = int(data.get("budget", 1000))
    interests = data.get("interests", [])

    logger.info(f"generate-trip request: destination={destination}, start={start_date}, end={end_date}, budget={budget}")

    try:
        flights = agent.find_flights(destination, start_date, end_date, budget)
        hotels = agent.find_hotels(destination, start_date, end_date, budget, interests)
        activities = agent.find_local_activities(destination, (int(data.get("duration", 3)) or 3), interests, int(budget * 0.15))
        return jsonify({"flights": flights, "hotels": hotels, "activities": activities})
    except Exception as e:
        logger.exception("Error generating trip")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    # Use 0.0.0.0 so other devices can reach it if needed; for local dev 127.0.0.1 also OK
    app.run(host="0.0.0.0", port=3000, debug=True)
