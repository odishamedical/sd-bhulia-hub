"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  international_phone_number?: string;
  website?: string;
}

export default function AdminImporter() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [importing, setImporting] = useState<string | null>(null);

  const searchPlaces = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    
    // In a production environment, this should call a Next.js API route 
    // to securely use your Google Places API Key without exposing it to the client.
    // For now, we simulate a response to demonstrate the UI flow.
    
    try {
      // MOCK DATA RESPONSE
      setTimeout(() => {
        setResults([
          {
            place_id: "ChIJ123456789",
            name: `${query} Premium Handloom`,
            formatted_address: "123 Weaver Street, Bargarh, Odisha, India",
            rating: 4.8,
            user_ratings_total: 124,
            international_phone_number: "+91 98765 43210",
          },
          {
            place_id: "ChIJ987654321",
            name: `${query} Textiles & Sarees`,
            formatted_address: "45 Market Road, Sambalpur, Odisha, India",
            rating: 4.2,
            user_ratings_total: 56,
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error fetching places:", error);
      alert("Failed to search places.");
      setLoading(false);
    }
  };

  const importToDirectory = async (place: PlaceResult, type: "weaver" | "store") => {
    setImporting(place.place_id);
    try {
      const collectionName = type === "weaver" ? "weavers" : "stores";
      
      const newDoc = {
        title: place.name,
        slug: place.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        address: place.formatted_address,
        rating: place.rating || 0,
        reviews_count: place.user_ratings_total || 0,
        phone: place.international_phone_number || "",
        website: place.website || "",
        source: "google_places",
        google_place_id: place.place_id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isVerified: false,
        status: "active"
      };

      await addDoc(collection(db, collectionName), newDoc);
      alert(`${place.name} has been successfully imported to ${type}s directory!`);
      
      // Remove from results to prevent double-import
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
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Google Places Importer</h2>
        <p className="text-gray-500">Search for businesses and seamlessly import their public data into our Ecosystem Directory.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={searchPlaces} className="flex gap-4">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'Sambalpuri Saree Shop in Bargarh'"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-800"
          />
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Searching..." : "Search Places"}
          </button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Search Results ({results.length})</h3>
          {results.map(place => (
            <div key={place.place_id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900 mb-1">{place.name}</h4>
                <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                  <span className="text-yellow-500 font-bold">★ {place.rating || "N/A"}</span> 
                  <span className="text-gray-400">({place.user_ratings_total || 0} reviews)</span>
                </p>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📍 {place.formatted_address}</p>
                  {place.international_phone_number && <p>📞 {place.international_phone_number}</p>}
                  {place.website && <p>🌐 <a href={place.website} target="_blank" className="text-blue-500 hover:underline">{place.website}</a></p>}
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px]">
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
        </div>
      )}
    </div>
  );
}
