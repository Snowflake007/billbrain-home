import { NextResponse } from "next/server";
import type { WeatherLookupResult } from "@/lib/types";

type GeocodingResponse = {
  results?: Array<{
    name: string;
    admin1?: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
};

type ArchiveResponse = {
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

function toISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query." }, { status: 400 });
  }

  try {
    const geocodingUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;

    const geocodingResponse = await fetch(geocodingUrl, { cache: "no-store" });
    if (!geocodingResponse.ok) {
      return NextResponse.json({ error: "Failed to resolve location." }, { status: 500 });
    }

    const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;
    const hit = geocodingData.results?.[0];

    if (!hit) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    const today = new Date();
    const endCurrent = new Date(today);
    endCurrent.setDate(endCurrent.getDate() - 1);

    const startCurrent = new Date(endCurrent);
    startCurrent.setDate(startCurrent.getDate() - 29);

    const endPrevious = new Date(startCurrent);
    endPrevious.setDate(endPrevious.getDate() - 1);

    const startPrevious = new Date(endPrevious);
    startPrevious.setDate(endPrevious.getDate() - 29);

    const archiveUrl =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${hit.latitude}&longitude=${hit.longitude}` +
      `&start_date=${toISO(startPrevious)}&end_date=${toISO(endCurrent)}` +
      `&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    const archiveResponse = await fetch(archiveUrl, { cache: "no-store" });
    if (!archiveResponse.ok) {
      return NextResponse.json({ error: "Failed to load historical weather." }, { status: 500 });
    }

    const archiveData = (await archiveResponse.json()) as ArchiveResponse;
    const maxes = archiveData.daily?.temperature_2m_max || [];
    const mins = archiveData.daily?.temperature_2m_min || [];

    if (!maxes.length || !mins.length || maxes.length !== mins.length) {
      return NextResponse.json({ error: "Weather response was incomplete." }, { status: 500 });
    }

    const means = maxes.map((max, index) => (max + mins[index]) / 2);

    const previousMeans = means.slice(0, 30);
    const currentMeans = means.slice(30, 60);

    const previousAvg = average(previousMeans);
    const currentAvg = average(currentMeans);

    const deltaPercent =
      previousAvg === 0 ? 0 : round(((currentAvg - previousAvg) / Math.abs(previousAvg)) * 100);

    const colder = currentAvg < previousAvg;
    const summary =
      colder
        ? `Recent weather in ${hit.name} was colder than the prior 30-day window (${round(
            currentAvg
          )}°C vs ${round(previousAvg)}°C average), which can help explain higher heating demand.`
        : `Recent weather in ${hit.name} was milder than the prior 30-day window (${round(
            currentAvg
          )}°C vs ${round(previousAvg)}°C average), so weather alone is a weaker explanation for a bill spike.`;

    const resolvedName = [hit.name, hit.admin1, hit.country].filter(Boolean).join(", ");

    const result: WeatherLookupResult = {
      resolvedName,
      latitude: hit.latitude,
      longitude: hit.longitude,
      currentWindowAvgC: round(currentAvg),
      previousWindowAvgC: round(previousAvg),
      deltaPercent,
      summary,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unexpected weather lookup failure." }, { status: 500 });
  }
}