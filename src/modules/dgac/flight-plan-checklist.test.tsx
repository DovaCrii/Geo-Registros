import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlightPlanChecklist } from "./flight-plan-checklist";

// --- Mocks ---

const mockToast = vi.fn();

vi.mock("@/lib/toast-context", () => ({
  useToast: () => ({ toast: mockToast, dismiss: vi.fn() }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  // Default: fetch succeeds
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
  });
});

// --- Helpers ---

const defaultProps = {
  flightPlanId: "fp-1",
  initialChecklist: {},
  suggestedChecklist: {},
};

function renderChecklist(overrides = {}) {
  return render(<FlightPlanChecklist {...defaultProps} {...overrides} />);
}

// --- Tests ---

describe("FlightPlanChecklist", () => {
  it("renders all 11 DGAC items", () => {
    renderChecklist();
    expect(screen.getByText("Dron registrado")).toBeInTheDocument();
    expect(screen.getByText("Operador con credencial vigente")).toBeInTheDocument();
    expect(screen.getByText("Cliente asignado")).toBeInTheDocument();
    expect(screen.getByText("Grupo de trabajo asignado")).toBeInTheDocument();
    expect(screen.getByText("Área de operación definida")).toBeInTheDocument();
    expect(screen.getByText("Fecha y horario definidos")).toBeInTheDocument();
    expect(screen.getByText("Zona poblada / no poblada evaluada")).toBeInTheDocument();
    expect(screen.getByText("Documentos adjuntos")).toBeInTheDocument();
    expect(screen.getByText("Evaluación meteorológica")).toBeInTheDocument();
    expect(screen.getByText("Restricciones evaluadas")).toBeInTheDocument();
    expect(screen.getByText("Permiso listo para revisión")).toBeInTheDocument();
  });

  it("shows progress 0 of 11 initially", () => {
    renderChecklist();
    expect(screen.getByText("0 de 11 completados")).toBeInTheDocument();
  });

  it("shows progress based on initialChecklist", () => {
    renderChecklist({
      initialChecklist: { "drone-registered": true, "operator-valid": true },
    });
    expect(screen.getByText("2 de 11 completados")).toBeInTheDocument();
  });

  it("applies initialChecklist to check items", () => {
    render(
      <FlightPlanChecklist
        flightPlanId="fp-1"
        initialChecklist={{ "drone-registered": true, "client-assigned": true }}
      />,
    );
    const droneCb = screen.getByText("Dron registrado")
      .closest("label")?.querySelector('input[type="checkbox"]');
    const clientCb = screen.getByText("Cliente asignado")
      .closest("label")?.querySelector('input[type="checkbox"]');
    expect(droneCb).toBeChecked();
    expect(clientCb).toBeChecked();
  });

  it("toggles a checkbox on click and persists", async () => {
    const user = userEvent.setup();
    renderChecklist();
    const checkboxes = screen.getAllByRole("checkbox");
    const first = checkboxes[0];
    expect(first).not.toBeChecked();

    await user.click(first);
    expect(first).toBeChecked();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/flight-plans/fp-1/dgac-checklist",
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining('"drone-registered":true'),
      }),
    );
  });

  it("shows an error toast when save fails", async () => {
    const user = userEvent.setup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Database error" }),
    });
    renderChecklist();
    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);

    // Wait for the fetch to reject and toast to be called
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "error",
        "Error al guardar",
        "Database error",
      );
    });
  });

  it("shows geometry link when geometryLink is provided", () => {
    renderChecklist({ geometryLink: "/flight-plans/fp-1/geometry" });
    const link = screen.getByText("Ver área de operación");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/flight-plans/fp-1/geometry");
  });

  it("does not show geometry link when geometryLink is not provided", () => {
    renderChecklist();
    expect(screen.queryByText("Ver área de operación")).not.toBeInTheDocument();
  });

  it("disables checkboxes while saving", async () => {
    const user = userEvent.setup();
    let resolveFetch!: (value: unknown) => void;
    globalThis.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    renderChecklist();
    const checkbox = screen.getAllByRole("checkbox")[0];

    await user.click(checkbox);

    await waitFor(() => {
      const allCheckboxes = screen.getAllByRole("checkbox");
      allCheckboxes.forEach((cb) => {
        expect(cb).toBeDisabled();
      });
    });

    resolveFetch({
      ok: true,
      json: async () => ({}),
    });

    await waitFor(() => {
      expect(screen.getAllByRole("checkbox")[0]).not.toBeDisabled();
    });
  });
});
