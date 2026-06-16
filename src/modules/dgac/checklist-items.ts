export type DgacChecklistItem = {
  id: string;
  label: string;
  hint: string;
};

export const DGAC_CHECKLIST_ITEMS: DgacChecklistItem[] = [
  { id: "drone-registered", label: "Dron registrado", hint: "Verificá que el equipo esté cargado en flota." },
  { id: "operator-valid", label: "Operador con credencial vigente", hint: "Confirmá licencia, identidad y vigencia." },
  { id: "client-assigned", label: "Cliente asignado", hint: "Debe existir un mandante o contrato asociado." },
  { id: "costcenter-assigned", label: "Centro de costo asignado", hint: "Usado para trazabilidad financiera y operativa." },
  { id: "operation-area", label: "Área de operación definida", hint: "Geometría cargada o pendiente de revisión." },
  { id: "date-defined", label: "Fecha y horario definidos", hint: "Evita ambigüedad en la autorización." },
  { id: "population-check", label: "Zona poblada / no poblada evaluada", hint: "Clasificá el contexto antes de enviar." },
  { id: "documents-attached", label: "Documentos adjuntos", hint: "Seguro, credencial y respaldos mínimos." },
  { id: "weather-check", label: "Evaluación meteorológica", hint: "Revisá viento, temperatura y precipitaciones." },
  { id: "restriction-check", label: "Restricciones evaluadas", hint: "Espacio aéreo, servidumbres, áreas sensibles." },
  { id: "ready-to-send", label: "Permiso listo para revisión", hint: "Checklist completo antes del envío DGAC." },
];

export function normalizeChecklist(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const result: Record<string, boolean> = {};
  for (const item of DGAC_CHECKLIST_ITEMS) {
    const current = (value as Record<string, unknown>)[item.id];
    result[item.id] = current === true;
  }
  return result;
}

type ChecklistSource = {
  record: {
    clientId: string;
    costCenterId: string;
    droneId: string;
    operatorId: string;
    geometryJson: unknown;
    operationDate: Date;
  };
  documents: Array<unknown>;
  drone?: { insuranceExpiry: Date | null } | null;
  operator?: { licenseNumber: string | null; licenseExpiry: Date | null } | null;
  weatherReady?: boolean;
};

export function deriveChecklistState(source: ChecklistSource): Record<string, boolean> {
  const today = new Date();
  const operatorValid = Boolean(
    source.operator?.licenseNumber &&
      source.operator?.licenseExpiry &&
      source.operator.licenseExpiry >= today,
  );
  const droneValid = Boolean(source.drone?.insuranceExpiry && source.drone.insuranceExpiry >= today);
  const hasWeather = Boolean(source.weatherReady);

  const state: Record<string, boolean> = {
    "drone-registered": Boolean(source.record.droneId && droneValid),
    "operator-valid": Boolean(source.record.operatorId && operatorValid),
    "client-assigned": Boolean(source.record.clientId),
    "costcenter-assigned": Boolean(source.record.costCenterId),
    "operation-area": Boolean(source.record.geometryJson),
    "date-defined": Boolean(source.record.operationDate),
    "population-check": false,
    "documents-attached": source.documents.length > 0,
    "weather-check": hasWeather,
    "restriction-check": false,
    "ready-to-send":
      Boolean(source.record.clientId) &&
      Boolean(source.record.costCenterId) &&
      Boolean(source.record.droneId) &&
      droneValid &&
      Boolean(source.record.operatorId) &&
      operatorValid &&
      Boolean(source.record.geometryJson) &&
      source.documents.length > 0 &&
      hasWeather,
  };

  return state;
}
