import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import type { GeocodeResult } from "@/lib/geocoding";

export const dynamic = "force-dynamic";

type NominatimResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
  type?: string;
};

function toGeocodeResult(item: NominatimResult): GeocodeResult | null {
  const lat = item.lat ? Number(item.lat) : NaN;
  const lng = item.lon ? Number(item.lon) : NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !item.display_name) {
    return null;
  }

  return {
    displayName: item.display_name,
    lat,
    lng,
    type: item.type ?? "place",
    source: "nominatim",
  };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "GeoRegistros/1.0 (local development)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
  }

  const data = (await response.json()) as NominatimResult[];
  const results = data.map(toGeocodeResult).filter(Boolean);

  return NextResponse.json({ results });
}
