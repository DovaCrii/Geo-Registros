export const roles = [
  "admin",
  "gerente_operaciones_aereas",
  "jefe_seguridad_aerea",
  "adc",
  "especialista_documental",
  "operador_rpa",
  "auditor",
  "viewer",
] as const;

export type AppRole = (typeof roles)[number];
