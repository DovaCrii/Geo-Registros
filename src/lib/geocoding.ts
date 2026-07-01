export type GeocodeResult = {
  displayName: string;
  lat: number;
  lng: number;
  type: string;
  source: string;
};

export function isValidCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
