import { describe, expect, it } from "vitest";
import { findGuide } from "./guide-data";

describe("findGuide", () => {
  it("returns entry for /dashboard", () => {
    const entry = findGuide("/dashboard");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Centro de comando");
  });

  it("returns entry for /flight-plans/new", () => {
    const entry = findGuide("/flight-plans/new");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Nuevo plan de vuelo");
  });

  it("returns entry for /flight-plans with detail ID", () => {
    const entry = findGuide("/flight-plans/abc-123");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Plan de vuelo");
  });

  it("returns entry for /flight-plans/abc-123/geometry", () => {
    const entry = findGuide("/flight-plans/abc-123/geometry");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Editor de geometría");
  });

  it("returns entry for /drones", () => {
    const entry = findGuide("/drones");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Flota de drones");
  });

  it("returns entry for /drones/new", () => {
    const entry = findGuide("/drones/new");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Nuevo dron");
  });

  it("returns entry for /drones/abc-123", () => {
    const entry = findGuide("/drones/abc-123");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Flota de drones");
  });

  it("returns entry for /operators", () => {
    const entry = findGuide("/operators");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Operadores RPA");
  });

  it("returns entry for /operators/new", () => {
    const entry = findGuide("/operators/new");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Nuevo operador");
  });

  it("returns entry for /operators/abc-123", () => {
    const entry = findGuide("/operators/abc-123");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Detalle del operador");
  });

  it("returns entry for /cost-centers", () => {
    const entry = findGuide("/cost-centers");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Grupos de trabajo");
  });

  it("returns entry for /cost-centers/new", () => {
    const entry = findGuide("/cost-centers/new");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Nuevo grupo de trabajo");
  });

  it("returns entry for /clients", () => {
    const entry = findGuide("/clients");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Clientes");
  });

  it("returns entry for /clients/new", () => {
    const entry = findGuide("/clients/new");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Nuevo cliente");
  });

  it("returns entry for /clients/abc-123", () => {
    const entry = findGuide("/clients/abc-123");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Detalle del cliente");
  });

  it("returns entry for /ayuda", () => {
    const entry = findGuide("/ayuda");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Centro de ayuda");
  });

  it("returns entry for /admin/email-logs", () => {
    const entry = findGuide("/admin/email-logs");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Registro de correos");
  });

  it("returns entry for /admin/email-logs/abc-123", () => {
    const entry = findGuide("/admin/email-logs/abc-123");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Detalle del correo");
  });

  it("returns entry for /admin/users", () => {
    const entry = findGuide("/admin/users");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Usuarios del sistema");
  });

  it("returns entry for /admin/users/new", () => {
    const entry = findGuide("/admin/users/new");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Nuevo usuario");
  });

  it("returns entry for /admin/users/abc-123", () => {
    const entry = findGuide("/admin/users/abc-123");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Detalle del usuario");
  });

  it("returns entry for /admin/help-docs", () => {
    const entry = findGuide("/admin/help-docs");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Documentación DGAC");
  });

  it("returns entry for /master-data", () => {
    const entry = findGuide("/master-data");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Datos maestros");
  });

  it("returns null for unmatched path", () => {
    const entry = findGuide("/this-path-does-not-exist");
    expect(entry).toBeNull();
  });

  it("returns null for root path (/)", () => {
    // Root has no FlowGuide entry unless explicitly added
    const entry = findGuide("/");
    expect(entry).toBeNull();
  });

  it("most specific pattern wins over generic", () => {
    // /flight-plans/new should match "Nuevo plan de vuelo" not "Planes de vuelo"
    const entry = findGuide("/flight-plans/new");
    expect(entry?.title).toBe("Nuevo plan de vuelo");

    // /flight-plans/abc-123 should match "Plan de vuelo" (detail)
    const detailEntry = findGuide("/flight-plans/abc-123");
    expect(detailEntry?.title).toBe("Plan de vuelo");
  });

  it("handles paths with query strings", () => {
    const entry = findGuide("/dashboard?tab=overview");
    expect(entry).not.toBeNull();
    expect(entry?.title).toBe("Centro de comando");
  });

  it("returns the same entry for pathname regardless of trailing slash", () => {
    const withoutSlash = findGuide("/drones");
    const withSlash = findGuide("/drones/");
    expect(withoutSlash).not.toBeNull();
    expect(withSlash).not.toBeNull();
    expect(withoutSlash?.title).toBe(withSlash?.title);
  });
});
