"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ODISHA_DISTRICTS, ODISHA_DISTRICT_BLOCKS } from "@/lib/locations";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  international_phone_number?: string;
  website?: string;
  photoUrls?: string[];
  location?: { latitude: number; longitude: number };
}

export default function AdminImporter() {
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [pincode, setPincode] = useState("");
  const [keyword, setKeyword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrict(e.target.value);
    setBlock(""); // reset block when district changes
  };

  const executeSearch = async (token: string | null = null) => {
    if (!keyword.trim() && !district && !block) return;
    
    setLoading(true);
    
    // Construct the smart query
    let queryParts = [keyword.trim()];
    if (block) queryParts.push(block);
    if (district) queryParts.push(district);
    queryParts.push("Odisha");
    if (pincode) queryParts.push(pincode);
    
    const finalQuery = queryParts.filter(Boolean).join(", ");
    
    try {
      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: finalQuery, pageToken: token }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from API");
      }

      const data = await response.json();
      
      if (data.places) {
        const mappedResults: PlaceResult[] = data.places.map((p: any) => ({
          place_id: p.id,
          name: p.displayName?.text || "Unknown Name",
          formatted_address: p.formattedAddress || "",
          rating: p.rating,
          user_ratings_total: p.userRatingCount,
          international_phone_number: p.nationalPhoneNumber || p.internationalPhoneNumber,
          website: p.websiteUri,
          photoUrls: p.photoUrls || [],
          location: p.location,
        }));
        
        if (token) {
          setResults(prev => [...prev, ...mappedResults]);
        } else {
          setResults(mappedResults);
        }
        setNextPageToken(data.nextPageToken || null);
      } else if (!token) {
        setResults([]);
        setNextPageToken(null);
      }
      
    } catch (error) {
      console.error("Error fetching places:", error);
      alert("Failed to search places. Make sure your GOOGLE_MAPS_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(null);
  };

  const handleLoadMore = () => {
    if (nextPageToken) {
      executeSearch(nextPageToken);
    }
  };

  const importToDirectory = async (place: PlaceResult, type: "weaver" | "store") => {
    if (!district) {
      alert("Please select a District first so the imported profile gets structured properly.");
      return;
    }
    
    setImporting(place.place_id);
    try {
      const collectionName = type === "weaver" ? "weavers" : "stores";
      
      const img = place.photoUrls && place.photoUrls.length > 0 ? place.photoUrls[0] : "";
      const gallery = place.photoUrls && place.photoUrls.length > 1 ? place.photoUrls.slice(1, 4) : [];
      const googlePin = place.location ? `${place.location.latitude},${place.location.longitude}` : "";

      const newDoc = {
        title: place.name,
        slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4),
        address: place.formatted_address,
        state: "Odisha",
        district: district,
        block: block || "",
        pincode: pincode || "",
        country: "India",
        rating: place.rating || 0,
        reviews_count: place.user_ratings_total || 0,
        phone: place.international_phone_number || "",
        website: place.website || "",
        img: img,
        gallery: gallery,
        googlePin: googlePin,
        source: "google_places",
        googlePlaceId: place.place_id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isVerified: false,
        status: "active" // typically active directly if imported by admin
      };

      await addDoc(collection(db, collectionName), newDoc);
      alert(`${place.name} has been successfully imported to ${type}s directory!`);
      
      setResults(prev => prev.filter(p => p.place_id !== place.place_id));
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import business data.");
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Advanced Places Importer</h2>
        <p className="text-gray-500">Search and import structured data strictly mapped to Odisha's Directory architecture.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">State</label>
              <select disabled className="w-full px-3 py-2 bg-gray-100 rounded-lg border border-gray-300 text-gray-600">
                <option>Odisha</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">District *</label>
              <select 
                required
                value={district} 
                onChange={handleDistrictChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-gray-800"
              >
                <option value="">Select District</option>
                {ODISHA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Block</label>
              <select 
                value={block} 
                onChange={(e) => setBlock(e.target.value)}
                disabled={!district}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-gray-800 disabled:bg-gray-50"
              >
                <option value="">Any Block</option>
                {district && ODISHA_DISTRICT_BLOCKS[district]?.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Pincode</label>
              <input 
                type="text" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none text-gray-800"
              />
            </div>
          </div>

          <div className="flex gap-4 items-end mt-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Search Keyword</label>
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. 'Handloom Store' or 'Saree Shop'"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-800"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !district}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0 h-12"
            >
              {loading && !nextPageToken ? "Searching..." : "Search Places"}
            </button>
          </div>
        </form>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-gray-800">Search Results ({results.length})</h3>
          </div>
          
          {results.map(place => (
            <div key={place.place_id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              
              {/* Image Preview Thumbnail */}
              <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center relative">
                {place.photoUrls && place.photoUrls.length > 0 ? (
                  <>
                    <img src={place.photoUrls[0]} alt="preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-tl-lg font-bold">
                      {place.photoUrls.length} imgs
                    </div>
                  </>
                ) : (
                  <span className="text-2xl opacity-20">📷</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-gray-900 mb-1 truncate">{place.name}</h4>
                <div className="flex flex-wrap gap-2 text-xs font-bold mb-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">★ {place.rating || "N/A"} ({place.user_ratings_total || 0})</span>
                  {place.international_phone_number ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">📞 {place.international_phone_number}</span>
                  ) : (
                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded">No Phone</span>
                  )}
                  {place.website ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">🌐 Has Website</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">No Website</span>
                  )}
                  {place.location && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">📍 GPS Tagged</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p className="truncate">📍 {place.formatted_address}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px] shrink-0 justify-center">
                <button 
                  onClick={() => importToDirectory(place, "weaver")}
                  disabled={importing === place.place_id}
                  className="w-full py-2 bg-[#051815] text-[#C5A059] font-bold text-xs uppercase tracking-wider rounded border border-[#C5A059] hover:bg-[#C5A059] hover:text-[#0A1021] transition-colors"
                >
                  {importing === place.place_id ? "Importing..." : "Import as Weaver"}
                </button>
                <button 
                  onClick={() => importToDirectory(place, "store")}
                  disabled={importing === place.place_id}
                  className="w-full py-2 bg-white text-gray-800 font-bold text-xs uppercase tracking-wider rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  {importing === place.place_id ? "Importing..." : "Import as Store"}
                </button>
              </div>

            </div>
          ))}

          {nextPageToken && (
            <div className="pt-6 pb-12 flex justify-center">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-full border border-gray-300 transition-colors shadow-sm flex items-center gap-2"
              >
                {loading ? "Loading..." : "↓ Load More Results"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
