from pydantic import BaseModel
from typing import List, Optional

class TripRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: int
    travelers: int
    interests: List[str]

class Flight(BaseModel):
    airline: str
    departure: str
    arrival: str
    price: int
    duration: str

class Hotel(BaseModel):
    name: str
    rating: float
    pricePerNight: int
    totalPrice: int
    amenities: List[str]
    distance: str
    nights: int

class Activity(BaseModel):
    name: str
    desc: str
    price: int
    duration: str
    rating: float
    time: str

class DailyPlan(BaseModel):
    day: int
    date: str
    activities: List[Activity]
    totalCost: int

class Budget(BaseModel):
    total: int
    flights: int
    hotel: int
    activities: int
    remaining: int

class Itinerary(BaseModel):
    destination: str
    days: int
    flights: dict
    hotel: Hotel
    dailyPlans: List[DailyPlan]
    budget: Budget

class AgentLog(BaseModel):
    agent: str
    message: str
    status: str