import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Menggunakan OpenStreetMap Nominatim Geocoding API (100% Gratis tanpa API key)
    const encodedQuery = encodeURIComponent(query.trim());
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=6&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'DeniaCoupleMemories/1.0 (contact: local-app)',
        'Accept-Language': 'id,en;q=0.8',
      },
      signal: AbortSignal.timeout(4000), // Max 4 seconds timeout
      next: { revalidate: 3600 }, // Cache search queries for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Gagal mencari lokasi' }, { status: res.status });
    }

    const data = await res.json();

    interface NominatimItem {
      place_id: number;
      name?: string;
      display_name: string;
      lat: string;
      lon: string;
      type?: string;
      class?: string;
    }

    const formatted = data.map((item: NominatimItem) => {
      // Ambil nama tempat utama (jika kosong, gunakan bagian pertama dari display_name)
      const primaryName = item.name && item.name.trim() !== '' 
        ? item.name 
        : item.display_name.split(',')[0].trim();

      return {
        id: String(item.place_id),
        name: primaryName,
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type || item.class || 'place',
      };
    });

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error: unknown) {
    console.error('Geocode search error:', error);
    const message = error instanceof Error ? error.message : 'Search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
