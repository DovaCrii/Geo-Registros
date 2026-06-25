/**
 * Strict field validators for AeroFlow.
 * Every validator returns null on success, or a user-facing error string on failure.
 */

const NAME_RE = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s'-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_RE = /^[A-Z0-9]+$/;
const PHONE_RE = /^[\d\s+\-()]+$/;
const SERIAL_RE = /^[A-Za-z0-9\-_/]+$/;

export function validateName(value: string, label = "Nombre"): string | null {
  if (!value.trim()) return `${label} es obligatorio.`;
  if (value.trim().length < 2) return `${label} debe tener al menos 2 caracteres.`;
  if (!NAME_RE.test(value)) return `${label} solo admite letras, espacios, apóstrofes y guiones.`;
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "El email es obligatorio.";
  if (!EMAIL_RE.test(value)) return "Ingresá un email válido (ej: usuario@dominio.com).";
  if (value.length > 254) return "El email es demasiado largo.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "La contraseña es obligatoria.";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (value.length > 128) return "La contraseña no puede superar los 128 caracteres.";
  return null;
}

export function validateCode(value: string, label = "Código"): string | null {
  if (!value.trim()) return `${label} es obligatorio.`;
  if (!CODE_RE.test(value)) return `${label} solo admite letras mayúsculas y números, sin espacios.`;
  return null;
}

export function validatePhone(value: string): string | null {
  if (!value.trim()) return null; // optional
  if (!PHONE_RE.test(value)) return "El teléfono contiene caracteres inválidos.";
  if (value.replace(/\D/g, "").length < 8) return "El teléfono debe tener al menos 8 dígitos.";
  return null;
}

export function validateSerialNumber(value: string): string | null {
  if (!value.trim()) return "El número de serie es obligatorio.";
  if (!SERIAL_RE.test(value)) return "El número de serie contiene caracteres inválidos.";
  return null;
}

export function validateOptionalText(value: string | null | undefined, label: string, maxLength = 500): string | null {
  if (!value) return null;
  if (value.length > maxLength) return `${label} no puede superar los ${maxLength} caracteres.`;
  return null;
}

export type ValidationErrors = Record<string, string>;

/**
 * Validate a full form object against a schema definition.
 * Each key maps to a validator function.
 */
export function validateForm<T extends Record<string, string>>(
  data: T,
  schema: Record<keyof T, (value: string) => string | null>,
): ValidationErrors | null {
  const errors: ValidationErrors = {};
  let hasErrors = false;

  for (const [field, validator] of Object.entries(schema)) {
    const error = validator(data[field as keyof T] ?? "");
    if (error) {
      errors[field] = error;
      hasErrors = true;
    }
  }

  return hasErrors ? errors : null;
}
