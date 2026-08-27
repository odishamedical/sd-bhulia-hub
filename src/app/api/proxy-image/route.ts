import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    let finalUrl = imageUrl;
    
    // If it's a Google Places/Maps URL, replace the API key with the server's valid key
    // This fixes issues where the URL in the database has an old/expired API key
    // and bypasses Referer restrictions that block client-side fetch
    if (finalUrl.includes('places.googleapis.com') || finalUrl.includes('maps.googleapis.com')) {
      const urlObj = new URL(finalUrl);
      const serverKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (serverKey) {
        urlObj.searchParams.set('key', serverKey);
        finalUrl = urlObj.toString();
      }
    }

    const response = await fetch(finalUrl, {
      headers: {
        'Referer': 'https://bhulia.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(buffer, {
      headers,
      status: 200,
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
