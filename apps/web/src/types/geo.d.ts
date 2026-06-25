/* ── tokml (untyped CJS module) ──────────────────────────────────── */

declare module "tokml" {
  interface TokmlOptions {
    documentName?: string;
    documentDescription?: string;
    name?: string;
    description?: string;
  }

  function tokml(geojson: GeoJSON.FeatureCollection, options?: TokmlOptions): string;

  export default tokml;
}
