from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import TripRequest, Itinerary, AgentLog
from agents.research_agent import ResearchAgent
from agents.content_generator import ContentGeneratorAgent
from agents.optimizer_agent import OptimizerAgent
from agents.qa_agent import QAAgent
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Trip Planner API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agents
API_KEY = os.getenv("ANTHROPIC_API_KEY")

if not API_KEY or API_KEY == "your_api_key_here":
    print("⚠️  WARNING: ANTHROPIC_API_KEY not set! Using mock data mode.")
    print("   Get your API key from: https://console.anthropic.com/")
    USE_MOCK = True
else:
    USE_MOCK = False

@app.get("/")
async def root():
    return {
        "message": "AI Trip Planner API",
        "version": "1.0.0",
        "status": "running",
        "mock_mode": USE_MOCK
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/generate-itinerary")
async def generate_itinerary(request: TripRequest):
    """Generate complete trip itinerary using AI agents"""
    
    agent_logs = []
    
    try:
        # Calculate days
        start = datetime.strptime(request.start_date, "%Y-%m-%d")
        end = datetime.strptime(request.end_date, "%Y-%m-%d")
        days = (end - start).days + 1
        
        if days < 1:
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        if days > 30:
            raise HTTPException(status_code=400, detail="Maximum trip duration is 30 days")
        
        # Initialize agents
        if not USE_MOCK:
            research_agent = ResearchAgent(API_KEY)
            content_agent = ContentGeneratorAgent(API_KEY)
        
        optimizer_agent = OptimizerAgent()
        qa_agent = QAAgent()
        
        # Step 1: Optimize Budget
        agent_logs.append({
            "agent": "Optimizer Agent",
            "message": "Analyzing budget and optimizing allocation...",
            "status": "processing"
        })
        
        budget_allocation = optimizer_agent.optimize_budget(request.budget, days)
        
        agent_logs[-1]["status"] = "complete"
        
        # Step 2: Research Flights
        agent_logs.append({
            "agent": "Research Agent",
            "message": f"Finding best flight options to {request.destination}...",
            "status": "processing"
        })
        
        if USE_MOCK:
            flights = _get_mock_flights(request.start_date, request.end_date, budget_allocation["flights"])
        else:
            flights = research_agent.find_flights(
                request.destination,
                request.start_date,
                request.end_date,
                budget_allocation["flights"]
            )
        
        agent_logs[-1]["status"] = "complete"
        
        # Step 3: Research Hotels
        agent_logs.append({
            "agent": "Research Agent",
            "message": "Searching for perfect accommodation...",
            "status": "processing"
        })
        
        if USE_MOCK:
            hotel = _get_mock_hotel(request.destination, days, budget_allocation["hotel"], request.interests)
        else:
            hotel = research_agent.find_hotels(
                request.destination,
                request.start_date,
                request.end_date,
                budget_allocation["hotel"],
                request.interests
            )
        
        agent_logs[-1]["status"] = "complete"
        
        # Step 4: Generate Activities
        agent_logs.append({
            "agent": "Content Generator",
            "message": "Creating personalized activity recommendations...",
            "status": "processing"
        })
        
        if USE_MOCK:
            daily_plans = _get_mock_activities(request.destination, days, request.interests, budget_allocation["activities"])
        else:
            daily_plans = content_agent.generate_daily_activities(
                request.destination,
                days,
                request.interests,
                budget_allocation["activities"]
            )
        
        agent_logs[-1]["status"] = "complete"
        
        # Step 5: Optimize Activities
        agent_logs.append({
            "agent": "Optimizer Agent",
            "message": "Optimizing activities based on your preferences...",
            "status": "processing"
        })
        
        # Score and optimize activities
        for day_plan in daily_plans:
            day_plan['activities'] = optimizer_agent.score_activities(
                day_plan['activities'],
                request.interests,
                budget_allocation["activities"] // days
            )[:3]  # Take top 3
        
        agent_logs[-1]["status"] = "complete"
        
        # Calculate actual costs
        flight_cost = flights['outbound']['price'] + flights['return']['price']
        hotel_cost = hotel['totalPrice']
        activity_cost = sum(day['totalCost'] for day in daily_plans)
        total_cost = flight_cost + hotel_cost + activity_cost
        
        # Step 6: Quality Assurance
        agent_logs.append({
            "agent": "Quality Assurance",
            "message": "Verifying itinerary quality and budget compliance...",
            "status": "processing"
        })
        
        itinerary_data = {
            "destination": request.destination,
            "days": days,
            "flights": flights,
            "hotel": hotel,
            "dailyPlans": daily_plans,
            "budget": {
                "total": request.budget,
                "flights": flight_cost,
                "hotel": hotel_cost,
                "activities": activity_cost,
                "remaining": request.budget - total_cost
            }
        }
        
        verification = qa_agent.verify_itinerary(itinerary_data)
        
        if not verification['checks']['all_passed']:
            agent_logs[-1]["status"] = "warning"
            agent_logs[-1]["message"] += f" (Quality score: {verification['quality_score']:.0f}%)"
        else:
            agent_logs[-1]["status"] = "complete"
        
        # Final log
        agent_logs.append({
            "agent": "System",
            "message": f"✨ Your perfect {days}-day {request.destination} itinerary is ready!",
            "status": "complete"
        })
        
        return {
            "success": True,
            "itinerary": itinerary_data,
            "agent_logs": agent_logs,
            "verification": verification
        }
        
    except Exception as e:
        print(f"Error generating itinerary: {e}")
        agent_logs.append({
            "agent": "System",
            "message": f"Error: {str(e)}",
            "status": "error"
        })
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate itinerary: {str(e)}"
        )

# Mock data functions (fallback when API key not available)
def _get_mock_flights(start_date: str, end_date: str, budget: int) -> dict:
    return {
        "outbound": {
            "airline": "IndiGo 6E-2345",
            "departure": f"{start_date} 08:30 AM",
            "arrival": f"{start_date} 11:45 AM",
            "price": budget // 2,
            "duration": "3h 15m"
        },
        "return": {
            "airline": "SpiceJet SG-8732",
            "departure": f"{end_date} 06:15 PM",
            "arrival": f"{end_date} 09:30 PM",
            "price": budget // 2,
            "duration": "3h 15m"
        }
    }

def _get_mock_hotel(destination: str, days: int, budget: int, interests: list) -> dict:
    beach_hotels = ["Seaside Paradise Resort", "Ocean Breeze Hotel", "Coastal Haven"]
    heritage_hotels = ["Heritage Grand Palace", "Royal Residency", "Historic Manor"]
    
    name = beach_hotels[0] if "Beach" in interests else heritage_hotels[0]
    nights = days - 1
    
    return {
        "name": name,
        "rating": 4.5,
        "pricePerNight": budget // max(nights, 1),
        "totalPrice": budget,
        "amenities": ["Free WiFi", "Breakfast Included", "Swimming Pool", "Spa & Wellness"],
        "distance": "2.5 km from city center",
        "nights": nights
    }

def _get_mock_activities(destination: str, days: int, interests: list, budget: int) -> list:
    activity_templates = {
        "Beach": [
            {"name": "Beach Parasailing", "desc": "Soar high above crystal-clear waters with breathtaking coastal views", "price": 2500, "duration": "2 hours", "rating": 4.7},
            {"name": "Sunset Beach Walk", "desc": "Romantic stroll along pristine shoreline as the sun sets", "price": 0, "duration": "1.5 hours", "rating": 4.8},
            {"name": "Beach Volleyball", "desc": "Join locals for energetic beach sports and fun", "price": 300, "duration": "2 hours", "rating": 4.6}
        ],
        "Food": [
            {"name": "Street Food Tour", "desc": "Culinary adventure through bustling local markets", "price": 800, "duration": "3 hours", "rating": 4.6},
            {"name": "Cooking Class", "desc": "Learn traditional dishes from expert local chefs", "price": 2000, "duration": "4 hours", "rating": 4.7},
            {"name": "Fine Dining", "desc": "Exquisite multi-course meal at renowned restaurant", "price": 3000, "duration": "2 hours", "rating": 4.8}
        ],
        "History": [
            {"name": "Fort Tour", "desc": "Explore ancient fortifications with rich historical significance", "price": 500, "duration": "3 hours", "rating": 4.8},
            {"name": "Museum Visit", "desc": "Discover fascinating artifacts chronicling regional heritage", "price": 300, "duration": "2 hours", "rating": 4.5},
            {"name": "Heritage Walk", "desc": "Wander historic neighborhoods with knowledgeable guide", "price": 400, "duration": "2.5 hours", "rating": 4.7}
        ],
        "Culture": [
            {"name": "Traditional Dance Show", "desc": "Mesmerizing classical dance performance", "price": 800, "duration": "2 hours", "rating": 4.6},
            {"name": "Temple Visit", "desc": "Experience spiritual serenity at ornate temples", "price": 0, "duration": "2 hours", "rating": 4.7},
            {"name": "Local Market Tour", "desc": "Vibrant markets brimming with handicrafts", "price": 200, "duration": "2.5 hours", "rating": 4.5}
        ],
        "Adventure": [
            {"name": "Zip Lining", "desc": "Adrenaline rush through lush canopies", "price": 1500, "duration": "2 hours", "rating": 4.7},
            {"name": "ATV Safari", "desc": "Navigate rugged terrain on all-terrain vehicle", "price": 2500, "duration": "3 hours", "rating": 4.6},
            {"name": "Rock Climbing", "desc": "Challenge yourself with guided climbing", "price": 2000, "duration": "4 hours", "rating": 4.5}
        ]
    }
    
    daily_plans = []
    times = ["9:00 AM", "1:00 PM", "5:00 PM"]
    per_day_budget = budget // days
    base_date = datetime.now()
    
    for day in range(1, days + 1):
        activities = []
        day_spent = 0
        
        relevant_interests = interests if interests else ["Culture", "Food"]
        
        for i, time in enumerate(times):
            interest = relevant_interests[i % len(relevant_interests)]
            available = activity_templates.get(interest, activity_templates["Culture"])
            activity = available[i % len(available)].copy()
            activity['time'] = time
            
            if day_spent + activity['price'] <= per_day_budget:
                activities.append(activity)
                day_spent += activity['price']
        
        current_date = base_date + timedelta(days=day-1)
        daily_plans.append({
            "day": day,
            "date": current_date.strftime("%b %d"),
            "activities": activities,
            "totalCost": day_spent
        })
    
    return daily_plans

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)