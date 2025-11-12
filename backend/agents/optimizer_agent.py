class OptimizerAgent:
    def __init__(self):
        self.name = "Optimizer Agent"
    
    def optimize_budget(self, total_budget: int, days: int) -> dict:
        """Optimize budget allocation across categories"""
        
        # Smart allocation: 30% flights, 35% hotel, 35% activities
        allocation = {
            "flights": int(total_budget * 0.30),
            "hotel": int(total_budget * 0.35),
            "activities": int(total_budget * 0.35)
        }
        
        return allocation
    
    def score_activities(self, activities: list, interests: list, budget: int) -> list:
        """Score and rank activities based on multiple factors"""
        
        scored_activities = []
        
        for activity in activities:
            # Multi-factor scoring
            rating_score = activity.get('rating', 4.5) / 5.0  # 40% weight
            
            # Affordability score (inverse of price ratio)
            price_score = 1 - (activity.get('price', 0) / max(budget, 1))  # 40% weight
            if price_score < 0:
                price_score = 0
            
            # Interest match score
            interest_score = 0.5  # Base score
            activity_name = activity.get('name', '').lower()
            activity_desc = activity.get('desc', '').lower()
            
            for interest in interests:
                if interest.lower() in activity_name or interest.lower() in activity_desc:
                    interest_score = 1.0
                    break
            
            # Combined score
            final_score = (rating_score * 0.4) + (price_score * 0.4) + (interest_score * 0.2)
            
            scored_activities.append({
                'activity': activity,
                'score': final_score
            })
        
        # Sort by score (descending)
        scored_activities.sort(key=lambda x: x['score'], reverse=True)
        
        return [item['activity'] for item in scored_activities]
    
    def validate_itinerary(self, itinerary: dict, original_budget: int) -> dict:
        """Validate and adjust itinerary to fit budget"""
        
        total_spent = (
            itinerary['budget']['flights'] +
            itinerary['budget']['hotel'] +
            itinerary['budget']['activities']
        )
        
        remaining = original_budget - total_spent
        
        return {
            "is_valid": remaining >= 0,
            "total_spent": total_spent,
            "remaining": remaining,
            "over_budget": max(0, -remaining)
        }