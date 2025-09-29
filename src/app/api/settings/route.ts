
import { NextResponse } from 'next/server';

// Simple in-memory store for settings. In a real app, use a database.
let settings = {
  latitude: null,
  longitude: null,
};

// GET /api/settings - Fetches the current settings
export async function GET() {
  return NextResponse.json(settings);
}

// POST /api/settings - Updates the settings
export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Latitude and Longitude are required' }, { status: 400 });
    }

    settings = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
