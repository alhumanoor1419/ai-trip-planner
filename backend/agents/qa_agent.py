class QAAgent:
    def __init__(self):
        self.name = "Quality Assurance Agent"
    
    def verify_itinerary(self, itinerary: dict) -> dict:
        """Verify itinerary completeness and quality"""
        
        checks = {
            "has_flights": bool(itinerary.get('flights')),
            "has_hotel": bool(itinerary.get('hotel')),
            "has_activities": len(itinerary.get('dailyPlans', [])) > 0,
            "budget_allocated": bool(itinerary.get('budget')),
            "within_budget": itinerary.get('budget', {}).get('remaining', 0) >= 0
        }
        
        checks['all_passed'] = all(checks.values())
        
        issues = []
        if not checks['has_flights']:
            issues.append("Missing flight information")
        if not checks['has_hotel']:
            issues.append("Missing hotel information")
        if not checks['has_activities']:
            issues.append("No activities planned")
        if not checks['within_budget']:
            issues.append("Budget exceeded")
        
        return {
            "checks": checks,
            "issues": issues,
            "quality_score": sum(checks.values()) / len(checks) * 100
        }
    
    def suggest_improvements(self, itinerary: dict, verification: dict) -> list:
        """Suggest improvements to itinerary"""
        
        suggestions = []
        
        if verification['quality_score'] < 100:
            for issue in verification['issues']:
                if "flight" in issue.lower():
                    suggestions.append("Consider adding flight options")
                elif "hotel" in issue.lower():
                    suggestions.append("Add accommodation details")
                elif "activities" in issue.lower():
                    suggestions.append("Include more activities")
                elif "budget" in issue.lower():
                    suggestions.append("Reduce activity costs or adjust budget")
        
        # Check activity distribution
        if itinerary.get('dailyPlans'):
            activities_per_day = [len(day.get('activities', [])) for day in itinerary['dailyPlans']]
            if min(activities_per_day) < 2:
                suggestions.append("Some days have too few activities")
        
        return suggestions