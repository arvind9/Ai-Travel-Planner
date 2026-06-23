'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: string;
}

interface ItineraryDay {
  dayNumber: number;
  activities: Activity[];
}

interface PackingItem {
  _id?: string;
  item: string;
  category: string;
  isPacked: boolean;
}

interface Trip {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: string;
  itinerary: ItineraryDay[];
  packingList: PackingItem[];
  estimatedBudget: {
    total: number;
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
  };
}

const AVAILABLE_INTERESTS = [
  "Beaches", "Adventure", "History", "Food & Dining", 
  "Nightlife", "Shopping", "Nature & Wildlife", "Architecture"
];

const LOADING_PHRASES = [
  "Mapping optimal geographic routes...",
  "Querying local street food hubs and restaurant grids...",
  "Evaluating climate metrics for structural packing arrays...",
  "Curating historical landmarks and sightseeing timeline windows...",
  "Assembling custom pricing profiles and currency allocations..."
];

export default function Dashboard() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newActivityName, setNewActivityName] = useState<string>('');
  const [targetDay, setTargetDay] = useState<number>(1);
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Form input states for creating a new trip
  const [formDest, setFormDest] = useState('');
  const [formDays, setFormDays] = useState(3);
  const [formBudget, setFormBudget] = useState('Medium');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUserTrips();
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 1500);
    } else {
      setPhraseIndex(0); // Reset back to initial phrase
    }
    return () => clearInterval(interval);
  }, [generating]);

  const fetchUserTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/trips`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
        if (data.length > 0) setSelectedTrip(data[0]);
      }
    } catch (err) {
      console.error('Failed to query secure user records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDest.trim()) return;
    setGenerating(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination: formDest,
          durationDays: Number(formDays),
          budgetTier: formBudget,
          interests: selectedInterests
        })
      });

      if (res.ok) {
        const newTrip = await res.json();
        setTrips(prev => [newTrip, ...prev]);
        setSelectedTrip(newTrip);
        setFormDest('');
        setSelectedInterests([]);
      }
    } catch (err) {
      console.error('AI Trip Generation encountered an issue', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddActivity = async (dayNum: number) => {
    if (!newActivityName.trim() || !selectedTrip) return;

    const updatedItinerary = selectedTrip.itinerary.map(day => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          activities: [
            ...day.activities,
            { title: newActivityName, description: 'Custom traveler update', estimatedCostUSD: 0, timeOfDay: 'Afternoon' }
          ]
        };
      }
      return day;
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/trips/${selectedTrip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itinerary: updatedItinerary })
      });

      if (res.ok) {
        const updatedData = await res.json();
        setSelectedTrip(updatedData);
        setNewActivityName('');
      }
    } catch (err) {
      console.error('Dynamic layout append failed', err);
    }
  };

  const handleDeleteHistory = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stops the dashboard from trying to click/load the trip details

    if (!window.confirm("Are you sure you want to delete this trip from your history?")) {
    return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // 1. Get the base URL or fallback to localhost if it's missing
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // 2. Safely trim any trailing slash to avoid double slashes (//api/trips)
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      // 3. Make the network request
      const response = await fetch(`${cleanBaseUrl}/api/trips/${tripId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // Find the state tracking your array of history items and filter out the deleted item.
      // If your state array is named something else (e.g. savedTrips, tripHistory), change this name:
      setTrips((prev) => prev.filter((trip: any) => trip._id !== tripId));
      
      // Optional: If you delete the trip currently being viewed on screen, clear it out too
      if (selectedTrip?._id === tripId) {
        // change this to your active trip state setter if needed (e.g., setUpdatedItinerary(null))
        setSelectedTrip(null);
      }
    } else {
      alert("Failed to delete history item.");
    }
    } catch (error) {
    console.error("Error deleting record:", error);
    }
  };

  const togglePackingItem = async (itemId: string) => {
    if (!selectedTrip) return;

    const updatedPacking = selectedTrip.packingList.map(item => {
      if (item._id === itemId) return { ...item, isPacked: !item.isPacked };
      return item;
    });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/trips/${selectedTrip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ packingList: updatedPacking })
      });

      if (res.ok) {
        const updatedData = await res.json();
        setSelectedTrip(updatedData);
      }
    } catch (err) {
      console.error('Checkbox toggle update synchronization failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950 text-white">
        <p className="text-xl animate-pulse font-mono">Verifying Data Enclave Token Security...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center border-b border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            AI Travel Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Isolated Multi-User Deployment Verified</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
          className="bg-red-500/10 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 transition duration-200 px-4 py-2 rounded-xl text-xs font-semibold"
        >
          Sign Out
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Input Form & History Sidebar Wrapper */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Plan an Intelligent New Trip</h2>
            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Destination Target</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Tokyo, Paris, Goa"
                  value={formDest}
                  onChange={(e) => setFormDest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formDays}
                    onChange={(e) => setFormDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Budget profile</label>
                  <select
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
                  >
                    <option value="Low">Low Cost</option>
                    <option value="Medium">Medium</option>
                    <option value="High">Luxury / High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Your Interests
                </label>
                
                {/* The Dropdown selector */}
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !selectedInterests.includes(value)) {
                      handleInterestToggle(value);
                    }
                    e.target.value = ""; // Reset dropdown view selection
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-300 cursor-pointer"
                >
                  <option value="">-- Choose an Interest --</option>
                  {AVAILABLE_INTERESTS.map((interest) => (
                    <option key={interest} value={interest} disabled={selectedInterests.includes(interest)}>
                      {interest} {selectedInterests.includes(interest) ? "✓" : ""}
                    </option>
                  ))}
                </select>

                {/* Active Selection Tags Block */}
                {selectedInterests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold hover:bg-red-600/20 hover:border-red-500/30 hover:text-red-400 transition cursor-pointer"
                        title="Click to remove"
                      >
                        {interest} <span className="text-[10px] opacity-60">✕</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={generating}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-blue-600/10"
              >
                {generating ? 'Querying Gemini Agent Cluster...' : 'Generate AI Itinerary'}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-slate-400 mb-3">Your Saved Core Histories</h2>
            {trips.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No itineraries stored in user enclave.</p>
            ) : (
              <div className="space-y-2">
                {trips.map((t) => (
                  <button
                  key={t._id}
                  onClick={() => setSelectedTrip(t)}
                  className={`w-full text-left p-3 rounded-xl transition text-xs flex justify-between items-center ${
                    selectedTrip?._id === t._id ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-bold">{t.destination}</p>
                    <p className="opacity-70 text-[10px] mt-0.5">{t.durationDays} Days • {t.budgetTier} Budget</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span>➡️</span>
                    <span
                      onClick={(e) => handleDeleteHistory(t._id, e)} // <-- FIX: Changed from trip._id to t._id
                      className="p-1.5 ml-2 bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white rounded-lg text-xs transition duration-150 cursor-pointer"
                      title="Delete History"
                    >
                      🗑️
                    </span>
                  </div>
                </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Dynamic Travel Timeline & Financial Costs Content Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTrip ? (
            <>
              {/* Financial Dashboard Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">✈️ Transport</p>
                  <p className="text-base font-extrabold text-white mt-0.5">₹{selectedTrip.estimatedBudget.transport}</p>
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">🏨 Lodging</p>
                  <p className="text-base font-extrabold text-white mt-0.5">₹{selectedTrip.estimatedBudget.accommodation}</p>
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">🍔 Dining</p>
                  <p className="text-base font-extrabold text-white mt-0.5">₹{selectedTrip.estimatedBudget.food}</p>
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">🎟️ Tickets</p>
                  <p className="text-base font-extrabold text-white mt-0.5">₹{selectedTrip.estimatedBudget.activities}</p>
                </div>
                <div className="p-2 col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4">
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Grand Total</p>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">₹{selectedTrip.estimatedBudget.total}</p>
                </div>
              </div>

              {/* Day-by-Day View Routing */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-extrabold text-slate-100 border-b border-slate-800 pb-3 mb-6">
                  {selectedTrip.destination} Complete Activity Timeline
                </h2>
                <div className="space-y-6">
                  {selectedTrip.itinerary.map((day) => (
                    <div key={day.dayNumber} className="border-l border-blue-500 pl-6 relative ml-3">
                      <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                      <h3 className="text-sm font-black text-blue-400 tracking-wide uppercase mb-3">Day {day.dayNumber}</h3>
                      
                      <div className="space-y-3 mb-4">
                        {day.activities.map((act, idx) => (
                          <div key={idx} className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold text-white">{act.title}</p>
                              <p className="text-xs text-slate-400 mt-1">{act.description}</p>
                            </div>
                            <span className="text-[10px] bg-indigo-950 border border-indigo-900/50 text-indigo-300 font-semibold px-2 py-0.5 rounded-full uppercase">
                              {act.timeOfDay}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Inline Dynamic Form Modifier Control */}
                      <div className="flex items-center gap-2 max-w-sm">
                        <input
                          type="text"
                          placeholder="Inject custom planning event item..."
                          value={targetDay === day.dayNumber ? newActivityName : ''}
                          onChange={(e) => {
                            setTargetDay(day.dayNumber);
                            setNewActivityName(e.target.value);
                          }}
                          className="bg-slate-950 border border-slate-850 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-blue-500 w-full text-slate-200"
                        />
                        <button
                          onClick={() => handleAddActivity(day.dayNumber)}
                          className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg transition font-semibold"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Creative Custom Feature Board View: Weather Packing Assistant */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    ⛈️ AI Weather-Aware Packing Assistant
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target destination metrics matched with custom weather matrices generate this live structural tracking catalog:
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTrip.packingList?.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => togglePackingItem(item._id!)}
                      className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-700 transition duration-150"
                    >
                      <input
                        type="checkbox"
                        checked={item.isPacked}
                        readOnly
                        className="h-4 w-4 rounded border-slate-800 bg-slate-900 accent-emerald-500 cursor-pointer focus:ring-0 focus:ring-offset-0"
                      />
                      <span className={`text-xs ${item.isPacked ? 'line-through text-slate-600 font-medium' : 'text-slate-300 font-medium'}`}>
                        {item.item}
                      </span>
                      <span className="ml-auto text-[9px] tracking-wide font-mono bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-slate-900 border border-slate-800 border-dashed rounded-2xl text-slate-500 p-8">
              <span className="text-4xl mb-3">🧭</span>
              <p className="text-sm font-medium">Your multi-user dynamic dashboard is empty.</p>
              <p className="text-xs text-slate-600 mt-1">Use the preference form on the left to invoke your custom AI travel agent planner.</p>
            </div>
          )}
        </div>
      </main>
      {generating && (
            <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-slate-950/80 backdrop-blur-md transition-all duration-300">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6 flex flex-col items-center">
                
                {/* Smooth Spinning Compass Icon */}
                <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-3xl animate-spin [animation-duration:3s]">
                  🧭
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-white tracking-wider uppercase font-mono animate-pulse">
                    Invoking Gemini AI Agent Cluster
                  </h3>
                  <p className="text-xs text-slate-400 min-h-[32px] px-2 transition-all duration-300 font-medium">
                    {LOADING_PHRASES[phraseIndex]}
                  </p>
                </div>
                
                {/* Visual horizontal loading track bar layout indicator */}
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-800/40">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-4/5 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          )}
    </div>
  );
}