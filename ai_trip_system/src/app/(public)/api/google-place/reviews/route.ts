// app/api/google-place/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat or lon" }, { status: 400 });
  }

  try {
    // Step 1: Search for nearby places using lat/lon
    const nearbyRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=100&type=tourist_attraction&key=${GOOGLE_API_KEY}`
    );
    const nearbyData = await nearbyRes.json();

    if (!nearbyData.results || nearbyData.results.length === 0) {
      return NextResponse.json({ error: "No places found" }, { status: 404 });
    }

    const placeId = nearbyData.results[0].place_id;

    // Step 2: Get place details using place_id
    const detailRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating&language=vi&key=${GOOGLE_API_KEY}`
    );
    const detailData = await detailRes.json();

    return NextResponse.json(detailData.result || {});
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
