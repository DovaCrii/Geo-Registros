export interface GeospatialService {
  normalizeGeometry(input: unknown): Promise<unknown>;
}

export class GeospatialServiceNotImplemented implements GeospatialService {
  async normalizeGeometry(input: unknown): Promise<unknown> {
    return input;
  }
}
