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
