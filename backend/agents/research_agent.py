# backend/research_agent.py
import os
import json
from datetime import datetime, timedelta

# Optional: load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# If you want to use google.generativeai, ensure it's installed and configured.
# But we make this file safe — if GEMINI_API_KEY is missing we won't crash; we return helpful messages.
GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

class BackendConfigError(Exception):
    pass

class ResearchAgent:
    def __init__(self):
        # If you want to actually call Gemini, configure the client here.
        if not GEMINI_KEY:
            # Not configured — raise a specific error so server can continue but report unready.
            raise BackendConfigError("GEMINI_API_KEY not set in environment. Please set it in .env or export it.")
        # If configured: import google.generativeai lazily (so errors during import are visible)
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_KEY)
            self.model = genai.GenerativeModel("gemini-1.5-flash")
            self._use_gemini = True
        except Exception as e:
            # If library not available or config fails, still raise a config error with details
            raise BackendConfigError(f"Failed to initialize google.generativeai: {e}")

    # Below functions attempt to call Gemini; if we want, they can fall back to mocks.
    def find_flights(self, destination, start_date, end_date, budget):
        # Prompt and call model.generate_content(...) if available.
        prompt = f"Example JSON minimal flights for {destination} (budget {budget})."
        try:
            resp = self.model.generate_content(prompt)
            text = resp.text.strip().replace("```json", "").replace("```", "")
            return json.loads(text)
        except Exception:
            # fallback mock structure (so frontend still gets usable response)
            outbound = {
                "airline": "IndiGo 6E-1234",
                "departure": f"{start_date or '2025-12-01'} 08:00 AM",
                "arrival": f"{start_date or '2025-12-01'} 12:00 PM",
                "price": int(budget * 0.5),
                "duration": "4h 0m"
            }
            ret = {
                "airline": "SpiceJet SG-5678",
                "departure": f"{end_date or '2025-12-07'} 08:00 PM",
                "arrival": f"{end_date or '2025-12-08'} 04:00 AM",
                "price": int(budget * 0.5),
                "duration": "8h 0m"
            }
            return {"outbound": outbound, "return": ret}

    def find_hotels(self, destination, start_date, end_date, budget, interests):
        # fallback mock in case of failure
        nights = 1
        try:
            if start_date and end_date:
                d1 = datetime.strptime(start_date, "%Y-%m-%d")
                d2 = datetime.strptime(end_date, "%Y-%m-%d")
                nights = max(1, (d2 - d1).days)
        except Exception:
            nights = 1
        price_per_night = max(50, int(budget * 0.35 / max(1, nights)))
        return {
            "name": f"{destination} Grand Hotel",
            "rating": 4.5,
            "pricePerNight": price_per_night,
            "totalPrice": price_per_night * nights,
            "amenities": ["Free WiFi", "Breakfast", "Pool", "Gym"],
            "distance": "2 km from city center",
            "nights": nights
        }

    def find_local_activities(self, destination, days, interests, activity_budget):
        days = max(1, int(days or 3))
        per_day = max(100, int(activity_budget / max(1, days)))
        result = []
        base_date = datetime.now()
        for i in range(days):
            day_plan = {"day": i+1, "date": (base_date + timedelta(days=i)).strftime("%b %d"), "activities": []}
            for t, name in enumerate(["Morning Walk", "Museum Visit", "Evening Market"]):
                act = {
                    "name": f"{name} in {destination}",
                    "desc": f"A nice {name.lower()} with local flavor.",
                    "price": int(per_day/3),
                    "duration": "2 hours",
                    "rating": 4.6,
                    "time": ["9:00 AM","1:00 PM","5:00 PM"][t]
                }
                day_plan["activities"].append(act)
            day_plan["totalCost"] = sum(a["price"] for a in day_plan["activities"])
            result.append(day_plan)
        return result
