export type StatusTone = "success" | "warning" | "danger" | "info";

export type MasterDataRow = {
  code: string;
  name: string;
  owner: string;
  status: string;
  tone: StatusTone;
  note: string;
};

export type MasterDataModuleConfig = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  filterLabel: string;
  ownerLabel: string;
  rows: MasterDataRow[];
  panelTitle: string;
  panelDescription: string;
};

export const masterDataCatalog: Record<string, MasterDataModuleConfig> = {
  "cost-centers": {
    slug: "cost-centers",
    eyebrow: "Block 2 / Master data",
    title: "Cost centers",
    description:
      "Operational cost centers that anchor flight plans, documents, and downstream permit records.",
    searchPlaceholder: "Search cost center code or name",
    filterLabel: "Business unit",
    ownerLabel: "Operations lead",
    panelTitle: "Create cost center",
    panelDescription:
      "The creation panel will hold administrative and traceability fields once CRUD is connected.",
    rows: [
      {
        code: "CC-101",
        name: "Northern Corridor Survey",
        owner: "Aerial Operations",
        status: "Active",
        tone: "success",
        note: "Ready for linked flight plans.",
      },
      {
        code: "CC-208",
        name: "Substation Thermal Audit",
        owner: "Energy Projects",
        status: "Review",
        tone: "warning",
        note: "Waiting for document validation.",
      },
    ],
  },
  clients: {
    slug: "clients",
    eyebrow: "Block 2 / Master data",
    title: "Clients",
    description:
      "Mandantes and institutional counterparts associated with planned operations and formal submissions.",
    searchPlaceholder: "Search client name or tax reference",
    filterLabel: "Contract type",
    ownerLabel: "Account owner",
    panelTitle: "Create client",
    panelDescription:
      "Client records will later centralize contacts, contract metadata, and document rules.",
    rows: [
      {
        code: "CL-044",
        name: "Infraestructura Norte",
        owner: "Contracts Team",
        status: "Active",
        tone: "success",
        note: "Primary customer for Q3 campaigns.",
      },
      {
        code: "CL-061",
        name: "Minera Altiplano",
        owner: "Strategic Accounts",
        status: "Pending",
        tone: "info",
        note: "Needs final onboarding checklist.",
      },
    ],
  },
  drones: {
    slug: "drones",
    eyebrow: "Block 2 / Master data",
    title: "Drones",
    description:
      "RPA inventory prepared for assignment, maintenance tracking, and permit documentation packages.",
    searchPlaceholder: "Search platform, serial, or model",
    filterLabel: "Platform class",
    ownerLabel: "Assigned team",
    panelTitle: "Register drone",
    panelDescription:
      "The detail panel will later hold serial, certifications, payload configuration, and lifecycle status.",
    rows: [
      {
        code: "RP-009",
        name: "DJI Matrice 350 RTK",
        owner: "Survey Unit",
        status: "Available",
        tone: "success",
        note: "Mission-ready with current batteries.",
      },
      {
        code: "RP-013",
        name: "DJI Mavic 3 Enterprise",
        owner: "Inspection Team",
        status: "Maintenance",
        tone: "danger",
        note: "Blocked until propeller replacement is closed.",
      },
    ],
  },
  operators: {
    slug: "operators",
    eyebrow: "Block 2 / Master data",
    title: "Operators",
    description:
      "Pilots and supporting personnel with the certifications and roles required by operational workflows.",
    searchPlaceholder: "Search operator name or license",
    filterLabel: "Certification",
    ownerLabel: "Operational role",
    panelTitle: "Register operator",
    panelDescription:
      "Operator records will later store licenses, expirations, assigned equipment, and compliance status.",
    rows: [
      {
        code: "OP-017",
        name: "Camila Rojas",
        owner: "Chief Pilot",
        status: "Active",
        tone: "success",
        note: "Current certification valid through Q4.",
      },
      {
        code: "OP-024",
        name: "Ignacio Muñoz",
        owner: "Observer",
        status: "Renewal",
        tone: "warning",
        note: "Medical certificate update pending.",
      },
    ],
  },
};
