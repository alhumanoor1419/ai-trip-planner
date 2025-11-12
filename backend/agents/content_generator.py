import anthropic
import json

class ContentGeneratorAgent:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.name = "Content Generator Agent"
    
    def generate_daily_activities(self, destination: str, days: int, interests: list, activity_budget: int) -> list:
        """Generate personalized daily activities using AI"""
        
        per_day_budget = activity_budget // days
        
        prompt = f"""You are a creative travel content generator. Create a {days}-day itinerary for {destination}.

Traveler Interests: {', '.join(interests)}
Budget per day: ₹{per_day_budget}
Activities per day: 3

For each day, create 3 diverse activities with:
- Morning (9 AM), Afternoon (1 PM), Evening (5 PM) activities
- Mix of free/paid activities
- Engaging descriptions (20-30 words)
- Realistic prices
- Durations (1-4 hours)
- High ratings (4.5-4.9)

Return ONLY a JSON array of {days} days:
[
  {{
    "day": 1,
    "activities": [
      {{
        "name": "Activity Name",
        "desc": "Engaging description...",
        "price": <number>,
        "duration": "X hours",
        "rating": 4.7,
        "time": "9:00 AM"
      }}
    ]
  }}
]"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=3000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            daily_plans = json.loads(response_text.strip())
            
            # Add dates and calculate costs
            from datetime import datetime, timedelta
            base_date = datetime.now()
            
            for i, day_plan in enumerate(daily_plans):
                day_plan['day'] = i + 1
                current_date = base_date + timedelta(days=i)
                day_plan['date'] = current_date.strftime("%b %d")
                day_plan['totalCost'] = sum(act['price'] for act in day_plan['activities'])
            
            return daily_plans
            
        except Exception as e:
            print(f"Error in generate_daily_activities: {e}")
            return self._get_mock_activities(destination, days, interests, per_day_budget)
    
    def _get_mock_activities(self, destination: str, days: int, interests: list, per_day_budget: int) -> list:
        """Fallback mock activity data"""
        from datetime import datetime, timedelta
        
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
            ],
            "Shopping": [
                {"name": "Handicraft Market", "desc": "Browse authentic handmade items from local artisans", "price": 1000, "duration": "2 hours", "rating": 4.4},
                {"name": "Mall Shopping", "desc": "Explore modern shopping complexes", "price": 2000, "duration": "3 hours", "rating": 4.3},
                {"name": "Bazaar Experience", "desc": "Navigate colorful traditional bazaars", "price": 800, "duration": "2.5 hours", "rating": 4.6}
            ],
            "Nature": [
                {"name": "Nature Trek", "desc": "Hike through pristine natural landscapes", "price": 600, "duration": "4 hours", "rating": 4.8},
                {"name": "Bird Watching", "desc": "Observe diverse bird species with expert guides", "price": 800, "duration": "3 hours", "rating": 4.5},
                {"name": "Botanical Garden", "desc": "Stroll through beautifully landscaped gardens", "price": 200, "duration": "2 hours", "rating": 4.6}
            ],
            "Nightlife": [
                {"name": "Rooftop Bar", "desc": "Sip cocktails under the stars with city views", "price": 1500, "duration": "2 hours", "rating": 4.5},
                {"name": "Live Music Venue", "desc": "Enjoy electrifying performances by talented musicians", "price": 1000, "duration": "3 hours", "rating": 4.6},
                {"name": "Night Market", "desc": "Experience vibrant energy of night markets", "price": 500, "duration": "2 hours", "rating": 4.7}
            ]
        }
        
        daily_plans = []
        times = ["9:00 AM", "1:00 PM", "5:00 PM"]
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