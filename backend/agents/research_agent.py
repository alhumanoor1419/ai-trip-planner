import anthropic
import json
from datetime import datetime, timedelta

class ResearchAgent:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.name = "Research Agent"
    
    def find_flights(self, destination: str, start_date: str, end_date: str, budget: int) -> dict:
        """Find flight options using AI"""
        
        flight_budget = int(budget * 0.3)
        
        prompt = f"""You are a travel research agent. Find realistic flight options for:

Destination: {destination}
Departure Date: {start_date}
Return Date: {end_date}
Flight Budget: ₹{flight_budget}

Provide realistic Indian airline options (IndiGo, SpiceJet, Air India, Vistara) with:
- Flight numbers
- Departure/arrival times
- Duration
- Prices (split budget between outbound and return)

Return ONLY a JSON object with this structure:
{{
  "outbound": {{
    "airline": "IndiGo 6E-XXXX",
    "departure": "YYYY-MM-DD HH:MM AM/PM",
    "arrival": "YYYY-MM-DD HH:MM AM/PM",
    "price": <number>,
    "duration": "Xh YYm"
  }},
  "return": {{
    "airline": "SpiceJet SG-XXXX",
    "departure": "YYYY-MM-DD HH:MM AM/PM",
    "arrival": "YYYY-MM-DD HH:MM AM/PM",
    "price": <number>,
    "duration": "Xh YYm"
  }}
}}"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text
            # Clean up response
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            flights = json.loads(response_text.strip())
            return flights
            
        except Exception as e:
            print(f"Error in find_flights: {e}")
            # Fallback to mock data
            return self._get_mock_flights(start_date, end_date, flight_budget)
    
    def find_hotels(self, destination: str, start_date: str, end_date: str, budget: int, interests: list) -> dict:
        """Find hotel options using AI"""
        
        # Calculate nights
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        nights = (end - start).days
        
        hotel_budget = int(budget * 0.35)
        
        prompt = f"""You are a hotel research agent. Find a suitable hotel for:

Destination: {destination}
Check-in: {start_date}
Check-out: {end_date}
Nights: {nights}
Total Hotel Budget: ₹{hotel_budget}
Traveler Interests: {', '.join(interests)}

Recommend ONE hotel with:
- Creative name matching the destination and interests
- Star rating (4-5 stars)
- Price per night
- Amenities (4-5 items)
- Distance from city center

Return ONLY a JSON object:
{{
  "name": "Hotel Name",
  "rating": 4.5,
  "pricePerNight": <price>,
  "totalPrice": <total>,
  "amenities": ["Free WiFi", "Breakfast", "Pool", "Spa"],
  "distance": "X km from city center",
  "nights": {nights}
}}"""

        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = message.content[0].text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            hotel = json.loads(response_text.strip())
            hotel['nights'] = nights
            hotel['totalPrice'] = hotel.get('pricePerNight', hotel_budget // nights) * nights
            
            return hotel
            
        except Exception as e:
            print(f"Error in find_hotels: {e}")
            return self._get_mock_hotel(destination, nights, hotel_budget, interests)
    
    def _get_mock_flights(self, start_date: str, end_date: str, budget: int) -> dict:
        """Fallback mock flight data"""
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
    
    def _get_mock_hotel(self, destination: str, nights: int, budget: int, interests: list) -> dict:
        """Fallback mock hotel data"""
        beach_hotels = ["Seaside Paradise Resort", "Ocean Breeze Hotel", "Coastal Haven"]
        heritage_hotels = ["Heritage Grand Palace", "Royal Residency", "Historic Manor"]
        
        name = beach_hotels[0] if "Beach" in interests else heritage_hotels[0]
        
        return {
            "name": name,
            "rating": 4.5,
            "pricePerNight": budget // nights,
            "totalPrice": budget,
            "amenities": ["Free WiFi", "Breakfast Included", "Swimming Pool", "Spa & Wellness"],
            "distance": "2.5 km from city center",
            "nights": nights
        }