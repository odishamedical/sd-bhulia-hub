import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query, pageToken } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      // Return mock data if API key is not yet set
      console.warn("GOOGLE_MAPS_API_KEY is not set in .env.local. Returning mock data.");
      return NextResponse.json({
        places: [
          {
            id: "mock_place_1",
            displayName: { text: "Mock Sambalpuri Emporium" },
            formattedAddress: "123 Janpath Rd, Bapuji Nagar, Bhubaneswar, Odisha 751009",
            nationalPhoneNumber: "0674 253 1234",
            websiteUri: "https://www.mockemporium.com",
            rating: 4.8,
            userRatingCount: 124,
            location: { latitude: 20.296, longitude: 85.824 }
          },
          {
            id: "mock_place_2",
            displayName: { text: "Demo Handlooms Store" },
            formattedAddress: "Plot 45, Unit 2, Ashok Nagar, Bhubaneswar, Odisha 751001",
            nationalPhoneNumber: "098765 43210",
            rating: 4.5,
            userRatingCount: 89,
            location: { latitude: 20.266, longitude: 85.844 }
          }
        ],
        nextPageToken: "mock_next_page_token"
      });
    }

    const url = 'https://places.googleapis.com/v1/places:searchText';
    
    const requestBody: any = {
      textQuery: query,
    };
    
    if (pageToken) {
      requestBody.pageToken = pageToken;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName.text,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.location,places.photos,nextPageToken'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API Error:", errorText);
      return NextResponse.json({ error: "Failed to fetch from Google API" }, { status: response.status });
    }

    const data = await response.json();

    // Map photoUrls using the API key (up to 4 photos)
    if (data.places) {
      data.places = data.places.map((place: any) => {
        const photoUrls: string[] = [];
        if (place.photos && place.photos.length > 0) {
          const maxPhotos = Math.min(place.photos.length, 4);
          for (let i = 0; i < maxPhotos; i++) {
            const photoName = place.photos[i].name;
            photoUrls.push(`https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${apiKey}`);
          }
        }
        return { ...place, photoUrls };
      });
    }

    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
