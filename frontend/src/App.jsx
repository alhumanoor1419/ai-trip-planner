import React, { useState } from 'react';
import axios from 'axios';
import { 
  Plane, Hotel, MapPin, DollarSign, Calendar, Users, 
  Sparkles, CheckCircle, Loader, Palmtree, UtensilsCrossed,
  Mountain, Camera, ShoppingBag, Music, Globe, Star
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const TripPlanner = () => {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: '1',
    interests: []
  });
  
  const [agentStatus, setAgentStatus] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const interestIcons = {
    Beach: Palmtree,
    Food: UtensilsCrossed,
    Adventure: Mountain,
    History: Camera,
    Culture: Globe,
    Shopping: ShoppingBag,
    Nature: Mountain,
    Nightlife: Music
  };

  const interestOptions = ['Beach', 'Food', 'Adventure', 'History', 'Culture', 'Shopping', 'Nature', 'Nightlife'];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const addAgentStatus = (agent, message, status = 'processing') => {
    setAgentStatus(prev => [...prev, { agent, message, status, timestamp: Date.now() }]);
  };

  const generateItinerary = async () => {
    setLoading(true);
    setAgentStatus([]);
    setItinerary(null);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/generate-itinerary`, {
        destination: formData.destination,
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget: parseInt(formData.budget),
        travelers: parseInt(formData.travelers),
        interests: formData.interests.length > 0 ? formData.interests : ['Culture', 'Food']
      }, {
        onDownloadProgress: (progressEvent) => {
          // Handle streaming updates if implemented
        }
      });

      if (response.data.success) {
        setItinerary(response.data.itinerary);
        setAgentStatus(response.data.agent_logs || []);
      } else {
        setError(response.data.error || 'Failed to generate itinerary');
      }

    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError(err.response?.data?.detail || 'Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.destination || !formData.startDate || !formData.endDate || !formData.budget) {
      alert('Please fill in all required fields');
      return;
    }
    generateItinerary();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <Plane className="w-12 h-12 text-indigo-600 float-animation" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              AI Trip Planner
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Powered by intelligent AI agents working together for your perfect journey</p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-indigo-600 shadow-md">
              🤖 Multi-Agent AI
            </span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-purple-600 shadow-md">
              ✨ Smart Optimization
            </span>
            <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-pink-600 shadow-md">
              🎯 Personalized Plans
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:shadow-3xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <MapPin className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Plan Your Journey</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Destination
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  placeholder="e.g., Goa, Jaipur, Kerala, Dubai"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    placeholder="30000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Travelers
                  </label>
                  <select
                    value={formData.travelers}
                    onChange={(e) => setFormData({...formData, travelers: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800"
                  >
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  What interests you? ✨
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => {
                    const Icon = interestIcons[interest];
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                          formData.interests.includes(interest)
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 pulse-glow"
              >
                {loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    AI Agents Working...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate My Dream Trip
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="text-red-600 text-2xl">⚠️</div>
                  <div>
                    <h3 className="font-bold text-red-800">Oops! Something went wrong</h3>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Activity */}
            {agentStatus.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">AI Agents at Work</h2>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {agentStatus.map((status, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      {status.status === 'complete' ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : status.status === 'error' ? (
                        <div className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5 text-xl">✕</div>
                      ) : (
                        <Loader className="w-6 h-6 text-indigo-600 animate-spin flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          <span className="px-2 py-1 bg-white rounded-lg text-xs">
                            {status.agent}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{status.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary Display */}
            {itinerary && (
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Your {itinerary.days}-Day {itinerary.destination} Adventure
                    </h2>
                    <p className="text-gray-600 text-sm">Crafted specially for you by AI</p>
                  </div>
                </div>

                {/* Budget Overview */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6 shadow-xl">
                  <div className="text-sm opacity-90 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Total Budget
                  </div>
                  <div className="text-4xl font-bold mb-4">₹{itinerary.budget.total.toLocaleString()}</div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-white bg-opacity-20 rounded-xl p-3">
                      <Plane className="w-4 h-4 mb-1 opacity-75" />
                      <div className="opacity-75">Flights</div>
                      <div className="font-bold text-lg">₹{itinerary.budget.flights.toLocaleString()}</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-xl p-3">
                      <Hotel className="w-4 h-4 mb-1 opacity-75" />
                      <div className="opacity-75">Hotel</div>
                      <div className="font-bold text-lg">₹{itinerary.budget.hotel.toLocaleString()}</div>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-xl p-3">
                      <Sparkles className="w-4 h-4 mb-1 opacity-75" />
                      <div className="opacity-75">Activities</div>
                      <div className="font-bold text-lg">₹{itinerary.budget.activities.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Flights */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Plane className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-800">Flight Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-gray-800">{itinerary.flights.outbound.airline}</div>
                          <div className="text-sm text-gray-600">{itinerary.flights.outbound.departure}</div>
                          <div className="text-xs text-gray-500 mt-1">⏱️ {itinerary.flights.outbound.duration}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">₹{itinerary.flights.outbound.price}</div>
                          <div className="text-xs text-gray-500">per person</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-gray-800">{itinerary.flights.return.airline}</div>
                          <div className="text-sm text-gray-600">{itinerary.flights.return.departure}</div>
                          <div className="text-xs text-gray-500 mt-1">⏱️ {itinerary.flights.return.duration}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">₹{itinerary.flights.return.price}</div>
                          <div className="text-xs text-gray-500">per person</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hotel */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Hotel className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">Accommodation</h3>
                  </div>
                  <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-xl text-gray-800">{itinerary.hotel.name}</div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <span className="flex items-center">
                            {'⭐'.repeat(Math.floor(itinerary.hotel.rating))}
                          </span>
                          <span>{itinerary.hotel.rating}</span>
                          <span>•</span>
                          <span>{itinerary.hotel.distance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">₹{itinerary.hotel.totalPrice.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{itinerary.hotel.nights} nights</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {itinerary.hotel.amenities.map((amenity, idx) => (
                        <span key={idx} className="text-xs bg-white px-3 py-1.5 rounded-full text-purple-700 font-medium">
                          ✨ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Itinerary */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-pink-600" />
                    <h3 className="text-lg font-bold text-gray-800">Daily Itinerary</h3>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {itinerary.dailyPlans.map((day, idx) => (
                      <div key={idx} className="border-l-4 border-gradient-to-b from-indigo-500 to-pink-500 pl-4 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-bold text-lg text-gray-800">Day {day.day}</div>
                            <div className="text-sm text-gray-600">{day.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Daily Budget</div>
                            <div className="font-bold text-indigo-600">₹{day.totalCost}</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {day.activities.map((activity, actIdx) => (
                            <div key={actIdx} className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="font-bold text-gray-800 flex items-center gap-2">
                                    {activity.name}
                                    <span className="text-yellow-500 text-sm">★ {activity.rating}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-3">
                                    <span>🕐 {activity.time}</span>
                                    <span>⏱️ {activity.duration}</span>
                                  </div>
                                </div>
                                <div className="text-lg font-bold text-indigo-600">₹{activity.price}</div>
                              </div>
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{activity.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remaining Budget */}
                {itinerary.budget.remaining > 0 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">💰</div>
                      <div>
                        <div className="font-bold text-green-800">Remaining Budget</div>
                        <div className="text-sm text-green-600">You have ₹{itinerary.budget.remaining} left for extras!</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Welcome Message */}
            {!loading && !itinerary && agentStatus.length === 0 && (
              <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl shadow-xl p-8 text-center border-2 border-indigo-200">
                <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Globe className="w-10 h-10 text-indigo-600 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to explore the world? 🌍</h3>
                <p className="text-gray-600 mb-4">
                  Fill in your travel details and let our AI agents craft the perfect itinerary for you!
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Smart Budget Planning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Personalized Activities</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>🤖 Powered by Multi-Agent AI System | Built for SapienOne Hackathon 2025</p>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;