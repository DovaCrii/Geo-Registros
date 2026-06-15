import type { WeatherData, WeatherError } from "@/server/weather/service";

function windDirectionLabel(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function WeatherDisplay({ data }: { data: WeatherData }) {
  const tempUnit = data.unit === "C" ? "°C" : "°F";
  const windUnit = "km/h";

  return (
    <div className="space-y-4">
      {/* Temperature */}
      <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/50 px-4 py-3">
        <span className="text-sm text-slate-400">Temperatura</span>
        <span className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>
          {data.temperatureMin !== null ? `${Math.round(data.temperatureMin)}${tempUnit}` : "--"}{" "}
          <span className="text-slate-500">/</span>{" "}
          {data.temperatureMax !== null ? `${Math.round(data.temperatureMax)}${tempUnit}` : "--"}
        </span>
      </div>

      {/* Min/Max labels */}
      <div className="-mt-3 flex justify-between px-4 text-[10px] uppercase tracking-wide text-slate-500">
        <span>Mín</span>
        <span>Máx</span>
      </div>

      {/* Wind */}
      <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/50 px-4 py-3">
        <span className="text-sm text-slate-400">Viento máx</span>
        <span className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>
          {data.windSpeedMax !== null ? `${Math.round(data.windSpeedMax)} ${windUnit}` : "--"}
        </span>
      </div>

      {/* Wind direction */}
      {data.windDirection !== null && (
        <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/50 px-4 py-3">
          <span className="text-sm text-slate-400">Dirección</span>
          <span className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-mono)" }}>
            {windDirectionLabel(data.windDirection)} ({data.windDirection}°)
          </span>
        </div>
      )}

      {/* Source */}
      <p className="text-[10px] text-slate-600">
        Datos: Open-Meteo · Pronóstico gratuito
      </p>
    </div>
  );
}

function WeatherErrorDisplay({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <p className="text-xs text-amber-300/80">{error}</p>
      <p className="mt-1 text-[10px] text-slate-500">
        Agregá geometría al plan de vuelo para obtener datos climáticos.
      </p>
    </div>
  );
}

export function WeatherCard({
  data,
}: {
  data: WeatherData | WeatherError | null;
}) {
  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/50 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
      <div className="mb-4 border-b border-slate-800/80 pb-3">
        <h2 className="text-lg font-semibold text-white">Condiciones climáticas</h2>
        <p className="text-sm leading-6 text-slate-400">
          Pronóstico estimado para la fecha y ubicación de la operación.
        </p>
      </div>

      {!data ? (
        <p className="text-xs text-slate-500">No hay datos climáticos disponibles.</p>
      ) : "error" in data ? (
        <WeatherErrorDisplay error={data.error} />
      ) : (
        <WeatherDisplay data={data} />
      )}
    </div>
  );
}
