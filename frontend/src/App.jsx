import React, { useState, useEffect } from 'react';
import { Plane, MapPin, Calendar, Users, DollarSign, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

const TripPlanner = () => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    travelers: '',
    interests: ''
  });
  const [tripPlan, setTripPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const travelImages = [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80',
    'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1920&q=80',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % travelImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [travelImages.length]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateTrip = async () => {
    setLoading(true);
    
    const prompt = `Create a detailed trip plan for ${formData.destination} (${formData.duration} days, $${formData.budget} budget, ${formData.travelers} travelers, interests: ${formData.interests || 'general'}). Include day-by-day itinerary, accommodation, dining, budget breakdown, and travel tips. Make it exciting with emojis!`;

    try {
     const response = await fetch("http://localhost:5000/generate-trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      destination: formData.destination,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + formData.duration * 86400000).toISOString().split("T")[0],
      budget: formData.budget,
      interests: formData.interests.split(",").map(i => i.trim())
      })
     });


     if (!response.ok) throw new Error(`API Error: ${response.status}`);

     const data = await response.json();
     setTripPlan(JSON.stringify(data, null, 2)); 
     setCurrentPage("results");
    } catch (error) {
    console.error('Error:', error);
      
    const mockPlan = `🎉 Your ${formData.duration}-Day Adventure to ${formData.destination}

📍 Destination: ${formData.destination}
💰 Budget: $${formData.budget}
👥 Travelers: ${formData.travelers}
🎯 Interests: ${formData.interests || 'General sightseeing'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 DAY-BY-DAY ITINERARY

Day 1: Arrival & Exploration
🕐 Morning: Arrive at ${formData.destination} airport, check into hotel
🕐 Afternoon: Visit main landmarks, explore city center
🕐 Evening: Welcome dinner at local restaurant
💵 Daily Cost: $${Math.round(formData.budget / formData.duration / 1.5)}

Day 2: Cultural Immersion
🕐 Morning: Museum tours, historical sites
🕐 Afternoon: Local markets, authentic cuisine
🕐 Evening: Cultural show or performance
💵 Daily Cost: $${Math.round(formData.budget / formData.duration / 1.2)}

Day 3: Adventure Activities
🕐 Morning: ${formData.interests.toLowerCase().includes('adventure') ? 'Hiking, water sports' : 'Relaxing activities'}
🕐 Afternoon: Guided tours, photo opportunities
🕐 Evening: Sunset viewing, celebratory dinner
💵 Daily Cost: $${Math.round(formData.budget / formData.duration / 1.1)}

${formData.duration > 3 ? `Day 4: Hidden Gems
🕐 Morning: Off-the-beaten-path locations
🕐 Afternoon: Cooking class, hands-on experiences
🕐 Evening: Rooftop dining, souvenir shopping
💵 Daily Cost: $${Math.round(formData.budget / formData.duration)}` : ''}

${formData.duration > 4 ? `Day 5: Relaxation & Departure
🕐 Morning: Spa activities, leisurely breakfast
🕐 Afternoon: Final exploration, airport transfer
💵 Daily Cost: $${Math.round(formData.budget / formData.duration / 1.3)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏨 ACCOMMODATION OPTIONS

⭐⭐⭐⭐⭐ Luxury: $${Math.round(formData.budget * 0.45 / formData.duration)}/night
⭐⭐⭐⭐ Mid-Range: $${Math.round(formData.budget * 0.30 / formData.duration)}/night
⭐⭐⭐ Budget: $${Math.round(formData.budget * 0.15 / formData.duration)}/night

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🍽️ FOOD & DINING

🌟 Fine Dining: $80-150/person
🍴 Mid-Range: $25-50/person
🥘 Local Eateries: $10-20/person
🌮 Street Food: $5-12/person

Daily Food Budget: $${Math.round(formData.budget * 0.30 / formData.duration)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💵 BUDGET BREAKDOWN

✈️ Flights: $${Math.round(formData.budget * 0.30)} (30%)
🏨 Accommodation: $${Math.round(formData.budget * 0.30)} (30%)
🍽️ Food: $${Math.round(formData.budget * 0.20)} (20%)
🎯 Activities: $${Math.round(formData.budget * 0.12)} (12%)
🚕 Transport: $${Math.round(formData.budget * 0.05)} (5%)
🎁 Shopping: $${Math.round(formData.budget * 0.03)} (3%)

Total: $${formData.budget}
Daily Average: $${Math.round(formData.budget / formData.duration)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TRAVEL TIPS

Before You Go:
✓ Check visa requirements
✓ Get travel insurance
✓ Book in advance for better rates
✓ Learn basic local phrases
✓ Download offline maps

Packing Essentials:
✓ Comfortable walking shoes
✓ Weather-appropriate clothing
✓ Power adapters
✓ First aid kit
✓ Important documents

During Your Trip:
✓ Stay hydrated
✓ Keep valuables secure
✓ Try local transportation
✓ Respect local culture
✓ Take photos but enjoy the moment!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎒 BONUS RECOMMENDATIONS

📸 Instagram Spots:
• Iconic landmarks at sunrise
• Street art districts
• Scenic viewpoints
• Local markets

🛍️ Shopping:
• Traditional markets
• Artisan craft shops
• Modern shopping districts

🌙 Nightlife:
• Rooftop bars
• Live music venues
• Night markets

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Have an amazing trip to ${formData.destination}! 🌍✈️
Safe travels! 🧳✨`;

      setTripPlan(mockPlan);
      setCurrentPage('results');
      alert('Using demo mode. Add your Anthropic API key for real AI generation.');
    } finally {
      setLoading(false);
    }
  };

  const resetPlanner = () => {
    setFormData({ destination: '', duration: '', budget: '', travelers: '', interests: '' });
    setTripPlan(null);
    setCurrentPage('planner');
  };

  if (currentPage === 'welcome') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0">
          {travelImages.map((img, index) => (
            <div key={index} className="absolute inset-0 transition-all duration-1000 ease-in-out" style={{
              backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: currentImageIndex === index ? 1 : 0,
              transform: currentImageIndex === index ? 'translateY(0) scale(1)' : 'translateY(-50px) scale(1.1)',
            }} />
          ))}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6">
          <div className="text-center space-y-6">
            <Plane className="w-20 h-20 mx-auto mb-6 animate-bounce" />
            <h1 className="text-7xl font-bold tracking-wider mb-4 drop-shadow-2xl" style={{ letterSpacing: '0.1em' }}>KOPIKO</h1>
            <div className="h-1 w-32 bg-white mx-auto mb-6 shadow-lg" />
            <p className="text-3xl font-light mb-8 drop-shadow-lg">Your journey starts here.</p>
            <button onClick={() => setCurrentPage('planner')} className="group mt-12 px-10 py-4 bg-white text-gray-800 rounded-full font-semibold text-lg hover:bg-opacity-90 transition-all duration-300 flex items-center gap-3 mx-auto shadow-2xl hover:scale-105">
              Start Planning <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
            {travelImages.map((_, index) => (
              <div key={index} className={`h-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'planner') {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        <div className="fixed inset-0 -z-10">
          {travelImages.map((img, index) => (
            <div key={index} className="absolute inset-0 transition-all duration-1000 ease-in-out" style={{
              backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: currentImageIndex === index ? 1 : 0,
              transform: currentImageIndex === index ? 'translateY(0) scale(1)' : 'translateY(-50px) scale(1.1)',
            }} />
          ))}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 min-h-screen py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 text-white">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Sparkles className="w-8 h-8" />
                <h1 className="text-4xl font-bold drop-shadow-lg">KOPIKO Trip Planner</h1>
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-lg opacity-90 drop-shadow">AI-powered personalized travel planning</p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />Destination
                  </label>
                  <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} placeholder="e.g., Paris, Tokyo, New York" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                    <Calendar className="w-5 h-5 text-green-600" />Duration (days)
                  </label>
                  <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="e.g., 5" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                    <DollarSign className="w-5 h-5 text-yellow-600" />Budget (USD)
                  </label>
                  <input type="number" name="budget" value={formData.budget} onChange={handleInputChange} placeholder="e.g., 2000" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                    <Users className="w-5 h-5 text-purple-600" />Number of Travelers
                  </label>
                  <input type="number" name="travelers" value={formData.travelers} onChange={handleInputChange} placeholder="e.g., 2" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                    <Sparkles className="w-5 h-5 text-pink-600" />Interests & Preferences
                  </label>
                  <textarea name="interests" value={formData.interests} onChange={handleInputChange} placeholder="e.g., beaches, museums, local cuisine, adventure sports" rows="3" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors resize-none" />
                </div>
                <button onClick={generateTrip} disabled={loading || !formData.destination || !formData.duration} className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  {loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />AI is Planning Your Trip...</>) : (<><Plane className="w-5 h-5" />Generate My Trip with AI</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'results') {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-blue-100 to-indigo-200">
      {/* Floating travel icons */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <Plane className="absolute text-blue-300 opacity-30 animate-bounce" style={{ top: '15%', left: '10%', width: '80px', height: '80px' }} />
        <MapPin className="absolute text-red-400 opacity-40 animate-pulse" style={{ top: '50%', right: '15%', width: '60px', height: '60px' }} />
        <Sparkles className="absolute text-yellow-400 opacity-40 animate-spin" style={{ bottom: '20%', left: '30%', width: '50px', height: '50px' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Your Personalized AI Trip ✈️
          </h1>
          <p className="text-lg text-gray-700">
            📍 <strong>{formData.destination}</strong> | 📅 {formData.duration} Days | 💰 ${formData.budget} | 👥 {formData.travelers} Travelers
          </p>
        </div>

        {/* Budget Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: <Plane className="w-10 h-10 text-blue-500 mx-auto" />, title: 'Flights', value: formData.budget * 0.3 },
            { icon: <MapPin className="w-10 h-10 text-green-500 mx-auto" />, title: 'Hotels', value: formData.budget * 0.3 },
            { icon: <DollarSign className="w-10 h-10 text-yellow-500 mx-auto" />, title: 'Food', value: formData.budget * 0.2 },
            { icon: <Sparkles className="w-10 h-10 text-purple-500 mx-auto" />, title: 'Activities', value: formData.budget * 0.12 },
            { icon: <Users className="w-10 h-10 text-pink-500 mx-auto" />, title: 'Transport', value: formData.budget * 0.05 },
            { icon: <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" />, title: 'Shopping', value: formData.budget * 0.03 },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform">
              {card.icon}
              <h2 className="font-bold text-gray-800 text-xl mt-2">{card.title}</h2>
              <p className="text-gray-600 mt-2">${Math.round(card.value)}</p>
            </div>
          ))}
        </div>

        {/* Detailed Itinerary Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-gray-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600')] opacity-5 bg-cover bg-center"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-blue-700">Day-by-Day Itinerary</h2>
            </div>

            {/* Itinerary Content - Graphically Enhanced */}
            <div className="space-y-8">
              {tripPlan.split("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━").map((section, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-gradient-to-br from-white via-sky-50 to-blue-100 shadow-md border-l-4 border-blue-400 hover:shadow-lg transition-all"
                >
                  {/* Section Title Icons */}
                  {section.includes("DAY") && (
                    <div className="flex items-center gap-3 mb-3 text-xl font-semibold text-blue-700">
                      <Plane className="w-6 h-6 text-blue-500" />
                      <span>🗓️ {section.split("\n")[0]}</span>
                    </div>
                  )}
                  {section.includes("ACCOMMODATION") && (
                    <div className="flex items-center gap-3 mb-3 text-xl font-semibold text-green-700">
                      <MapPin className="w-6 h-6 text-green-500" />
                      <span>🏨 Accommodation</span>
                    </div>
                  )}
                  {section.includes("FOOD") && (
                    <div className="flex items-center gap-3 mb-3 text-xl font-semibold text-yellow-700">
                      <DollarSign className="w-6 h-6 text-yellow-500" />
                      <span>🍽️ Food & Dining</span>
                    </div>
                  )}
                  {section.includes("BUDGET") && (
                    <div className="flex items-center gap-3 mb-3 text-xl font-semibold text-purple-700">
                      <DollarSign className="w-6 h-6 text-purple-500" />
                      <span>💵 Budget Breakdown</span>
                    </div>
                  )}
                  {section.includes("TRAVEL TIPS") && (
                    <div className="flex items-center gap-3 mb-3 text-xl font-semibold text-indigo-700">
                      <Sparkles className="w-6 h-6 text-indigo-500" />
                      <span>💡 Travel Tips</span>
                    </div>
                  )}
                  {section.includes("BONUS") && (
                    <div className="flex items-center gap-3 mb-3 text-xl font-semibold text-pink-700">
                      <Sparkles className="w-6 h-6 text-pink-500" />
                      <span>🎒 Bonus Recommendations</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed text-md">
                    {section.trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div className="text-center mt-10">
          <button
            onClick={resetPlanner}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-3 mx-auto"
          >
            <ArrowLeft className="w-6 h-6" /> Plan Another Trip
          </button>
        </div>
      </div>
    </div>
  );
  }


};

export default TripPlanner;