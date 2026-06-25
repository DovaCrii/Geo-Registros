export type WeatherData = {
  temperatureMax: number | null;
  temperatureMin: number | null;
  windSpeedMax: number | null;
  windDirection: number | null;
  unit: "C" | "F";
};

export type WeatherError = {
  error: string;
};

/**
 * Extract centroid lat/lon from a GeoJSON geometry.
 * Supports Point, Polygon, MultiPolygon, LineString, MultiLineString.
 * Returns null if geometry is missing or unsupported.
 */
function extractCoordinates(geometryJson: unknown): { lat: number; lon: number } | null {
  if (!geometryJson || typeof geometryJson !== "object") return null;

  const geo = geometryJson as Record<string, unknown>;
  const type = geo.type as string | undefined;
  const coords = geo.coordinates;

  if (!type || !Array.isArray(coords) || coords.length === 0) return null;

  try {
    switch (type) {
      case "Point": {
        const [lon, lat] = coords as [number, number];
        return { lat, lon };
      }
      case "LineString":
      case "MultiPoint": {
        const points = coords as number[][];
        const avg = points.reduce(
          (acc, [lon, lat]) => ({ lat: acc.lat + lat, lon: acc.lon + lon }),
          { lat: 0, lon: 0 },
        );
        return { lat: avg.lat / points.length, lon: avg.lon / points.length };
      }
      case "Polygon": {
        const ring = (coords as number[][][])[0];
        if (!ring || ring.length === 0) return null;
        const avg = ring.reduce((acc, [lon, lat]) => ({ lat: acc.lat + lat, lon: acc.lon + lon }), {
          lat: 0,
          lon: 0,
        });
        return { lat: avg.lat / ring.length, lon: avg.lon / ring.length };
      }
      case "MultiPolygon": {
        const firstPoly = (coords as number[][][][])[0]?.[0];
        if (!firstPoly || firstPoly.length === 0) return null;
        const avg = firstPoly.reduce(
          (acc, [lon, lat]) => ({ lat: acc.lat + lat, lon: acc.lon + lon }),
          { lat: 0, lon: 0 },
        );
        return { lat: avg.lat / firstPoly.length, lon: avg.lon / firstPoly.length };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Fetch weather forecast from Open-Meteo for a given lat/lon + date.
 * Uses the free Open-Meteo API (no API key required).
 */
export async function getWeatherForecast(
  geometryJson: unknown,
  operationDate: Date,
): Promise<WeatherData | WeatherError> {
  const coords = extractCoordinates(geometryJson);

  if (!coords) {
    return { error: "No geometry data available for weather lookup." };
  }

  const { lat, lon } = coords;
  const dateStr = formatDate(operationDate);
  const today = formatDate(new Date());

  try {
    // Use forecast API for future dates, archive API for past dates
    let url: string;

    if (dateStr >= today) {
      url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lat}&longitude=${lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant` +
        `&timezone=auto&forecast_days=1`;
    } else {
      url =
        `https://archive-api.open-meteo.com/v1/archive?` +
        `latitude=${lat}&longitude=${lon}` +
        `&start_date=${dateStr}&end_date=${dateStr}` +
        `&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,wind_direction_10m_dominant` +
        `&timezone=auto`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour

    if (!res.ok) {
      return { error: `Weather service returned ${res.status}.` };
    }

    const data = (await res.json()) as {
      daily?: {
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        wind_speed_10m_max?: number[];
        wind_direction_10m_dominant?: number[];
      };
      daily_units?: {
        temperature_2m_max?: string;
      };
    };

    if (!data.daily) {
      return { error: "No weather data available for this date and location." };
    }

    return {
      temperatureMax: data.daily.temperature_2m_max?.[0] ?? null,
      temperatureMin: data.daily.temperature_2m_min?.[0] ?? null,
      windSpeedMax: data.daily.wind_speed_10m_max?.[0] ?? null,
      windDirection: data.daily.wind_direction_10m_dominant?.[0] ?? null,
      unit: data.daily_units?.temperature_2m_max?.includes("F") ? "F" : "C",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: `Weather fetch failed: ${message}` };
  }
}
