const { PrismaClient, Role, RecordStatus, PermissionStatus } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

/** Simple polygon GeoJSON near Santiago, Chile. */
function santiagoPolygon() {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-70.72, -33.42],
              [-70.58, -33.43],
              [-70.57, -33.50],
              [-70.71, -33.49],
              [-70.72, -33.42],
            ],
          ],
        },
        properties: {},
      },
    ],
  };
}

/** A longer polygon in the Metropolitan Region. */
function metropolitanaPolygon() {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-70.85, -33.50],
              [-70.68, -33.52],
              [-70.65, -33.62],
              [-70.82, -33.60],
              [-70.85, -33.50],
            ],
          ],
        },
        properties: {},
      },
    ],
  };
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "true") {
    throw new Error("Seeding blocked in production. Set SEED_ALLOW_PRODUCTION=true only if you really mean it.");
  }

  // ── Admin user ──────────────────────────────────────────────

  const email = (process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "";
  const fullName = (process.env.SEED_ADMIN_FULL_NAME || "").trim();

  if (!email || !password || !fullName) {
    throw new Error("Missing SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD or SEED_ADMIN_FULL_NAME.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      hashedPassword,
      role: Role.ADMIN,
      active: true,
    },
    create: {
      email,
      fullName,
      hashedPassword,
      role: Role.ADMIN,
      active: true,
    },
  });

  console.log(`Seeded ADMIN user: ${email}`);

  // ── Demo data (opt-in) ──────────────────────────────────────
  //
  // Set SEED_DEMO=true to create sample master data and
  // flight plans for demonstrations and commercial reviews.
  // Uses CostCenter model but UI labels use "Grupos de trabajo".
  // Fully independent — can run alongside existing production data.

  if (process.env.SEED_DEMO !== "true") {
    console.log("SKIP demo data (set SEED_DEMO=true to include it).");
    return;
  }

  /* ── 1. Equipos de trabajo (CostCenter) ────────────────── */

  const team1 = await prisma.costCenter.upsert({
    where: { code: "GT-001" },
    update: {},
    create: {
      code: "GT-001",
      name: "Minería Norte",
      description: "Equipo de minería — Región de Antofagasta. Operaciones en faenas de gran altitud.",
      status: RecordStatus.ACTIVE,
    },
  });

  const team2 = await prisma.costCenter.upsert({
    where: { code: "GT-002" },
    update: {},
    create: {
      code: "GT-002",
      name: "Construcción Santiago Sur",
      description: "Equipo de obras civiles — RM sur. Inspección de puentes, edificación y movimiento de tierra.",
      status: RecordStatus.ACTIVE,
    },
  });

  const team3 = await prisma.costCenter.upsert({
    where: { code: "GT-003" },
    update: {},
    create: {
      code: "GT-003",
      name: "Topografía y Fotogrametría",
      description: "Equipo de topografía de precisión, modelos digitales y ortofotos — zona central.",
      status: RecordStatus.ACTIVE,
    },
  });

  console.log("Seeded 3 equipos de trabajo (CostCenter).");

  /* ── 2. Clientes ──────────────────────────────────────────── */

  const client1 = await prisma.client.upsert({
    where: { code: "CL-001" },
    update: {},
    create: { code: "CL-001", name: "Minera Los Pelambres", contactName: "Juan Pérez", contactEmail: "jperez@pelambres.cl", notes: "Cliente prioritario — faena Región de Coquimbo.", status: RecordStatus.ACTIVE },
  });

  const client2 = await prisma.client.upsert({
    where: { code: "CL-002" },
    update: {},
    create: { code: "CL-002", name: "Constructora Vial SA", contactName: "Ana Torres", contactEmail: "atorres@vial.cl", notes: "Proyectos de infraestructura vial.", status: RecordStatus.ACTIVE },
  });

  const client3 = await prisma.client.upsert({
    where: { code: "CL-003" },
    update: {},
    create: { code: "CL-003", name: "Municipalidad de Providencia", contactName: "Patricio Soto", contactEmail: "psoto@providencia.cl", notes: "Monitoreo ambiental y patrimonio.", status: RecordStatus.ACTIVE },
  });

  console.log("Seeded 3 clients.");

  /* ── 3. Drones ────────────────────────────────────────────── */

  const drone1 = await prisma.drone.upsert({
    where: { serialNumber: "M350-RTK-2024-001" },
    update: {},
    create: { serialNumber: "M350-RTK-2024-001", manufacturer: "DJI", model: "Matrice 350 RTK", code: "D-001", notes: "Equipo principal para minería. Cámara H20T.", status: RecordStatus.ACTIVE, insuranceExpiry: daysFromNow(180), costCenterId: team1.id },
  });

  const drone2 = await prisma.drone.upsert({
    where: { serialNumber: "M3E-2024-002" },
    update: {},
    create: { serialNumber: "M3E-2024-002", manufacturer: "DJI", model: "Mavic 3 Enterprise", code: "D-002", notes: "Portátil para inspecciones rápidas.", status: RecordStatus.ACTIVE, insuranceExpiry: daysFromNow(90), costCenterId: team2.id },
  });

  const drone3 = await prisma.drone.upsert({
    where: { serialNumber: "AE2P-2024-003" },
    update: {},
    create: { serialNumber: "AE2P-2024-003", manufacturer: "Autel Robotics", model: "EVO II Pro V3", code: "D-003", notes: "Sensor 1″ CMOS para fotogrametría.", status: RecordStatus.ACTIVE, insuranceExpiry: daysFromNow(-30), costCenterId: team3.id },
  });

  console.log("Seeded 3 drones.");

  /* ── 4. Operadores ────────────────────────────────────────── */

  const op1 = await prisma.operator.upsert({
    where: { code: "OP-001" },
    update: {},
    create: { code: "OP-001", fullName: "Carlos Muñoz", email: "cmunoz@aeroflow.io", phone: "+56 9 1234 5678", licenseNumber: "RPA-2024-001", licenseExpiry: daysFromNow(365), notes: "Operador senior — minería y gran altitud.", status: RecordStatus.ACTIVE, costCenterId: team1.id },
  });

  const op2 = await prisma.operator.upsert({
    where: { code: "OP-002" },
    update: {},
    create: { code: "OP-002", fullName: "María González", email: "mgonzalez@aeroflow.io", phone: "+56 9 2345 6789", licenseNumber: "RPA-2024-002", licenseExpiry: daysFromNow(180), notes: "Operadora — obras civiles e infraestructura.", status: RecordStatus.ACTIVE, costCenterId: team2.id },
  });

  const op3 = await prisma.operator.upsert({
    where: { code: "OP-003" },
    update: {},
    create: { code: "OP-003", fullName: "Pedro Soto", email: "psoto@aeroflow.io", phone: "+56 9 3456 7890", licenseNumber: "RPA-2024-003", licenseExpiry: daysFromNow(60), notes: "Topógrafo RPA — fotogrametría y modelos 3D.", status: RecordStatus.ACTIVE, costCenterId: team3.id },
  });

  console.log("Seeded 3 operators.");

  /* ── 5. Planes de vuelo ───────────────────────────────────── */

  const fp1 = await prisma.flightPlan.upsert({
    where: { code: "FP-2026-001" },
    update: {},
    create: {
      code: "FP-2026-001",
      title: "Levantamiento Sector Norte",
      operationDate: daysFromNow(14),
      permissionStatus: PermissionStatus.DRAFT,
      notes: "Levantamiento topográfico preliminar para diseño de rajo.",
      geometryJson: santiagoPolygon(),
      geometryType: "Polygon",
      costCenterId: team1.id,
      clientId: client1.id,
      droneId: drone1.id,
      operatorId: op1.id,
    },
  });

  const fp2 = await prisma.flightPlan.upsert({
    where: { code: "FP-2026-002" },
    update: {},
    create: {
      code: "FP-2026-002",
      title: "Inspección Puente Los Morros",
      operationDate: daysFromNow(7),
      permissionStatus: PermissionStatus.IN_REVIEW,
      notes: "Inspección visual de juntas de dilatación y fisuras en tablero.",
      geometryJson: metropolitanaPolygon(),
      geometryType: "Polygon",
      costCenterId: team2.id,
      clientId: client2.id,
      droneId: drone2.id,
      operatorId: op2.id,
    },
  });

  const fp3 = await prisma.flightPlan.upsert({
    where: { code: "FP-2026-003" },
    update: {},
    create: {
      code: "FP-2026-003",
      title: "Monitoreo Humedal Cerro Navia",
      operationDate: daysFromNow(30),
      permissionStatus: PermissionStatus.AUTHORIZED,
      notes: "Monitoreo trimestral de cobertura vegetal y espejo de agua.",
      geometryJson: metropolitanaPolygon(),
      geometryType: "Polygon",
      costCenterId: team3.id,
      clientId: client3.id,
      droneId: drone3.id,
      operatorId: op3.id,
    },
  });

  console.log("Seeded 3 flight plans.");

  /* ── 6. Permission events ─────────────────────────────────── */

  // FP-2026-002: DRAFT → CREATED event → IN_REVIEW
  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp2.id,
      eventType: "CREATED",
      description: "Plan de vuelo creado para inspección de puente.",
      createdAt: daysFromNow(-14),
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp2.id,
      eventType: "STATUS_CHANGED",
      fromStatus: PermissionStatus.DRAFT,
      toStatus: PermissionStatus.IN_REVIEW,
      description: "Enviado a revisión interna por Jefe de Operaciones.",
      createdAt: daysFromNow(-10),
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp2.id,
      eventType: "DOCUMENT_ATTACHED",
      description: "Adjuntado: certificado de seguro vigente.",
      createdAt: daysFromNow(-8),
    },
  });

  // FP-2026-003: full flow DRAFT → AUTHORIZED
  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp3.id,
      eventType: "CREATED",
      description: "Plan creado para monitoreo ambiental trimestral.",
      createdAt: daysFromNow(-60),
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp3.id,
      eventType: "STATUS_CHANGED",
      fromStatus: PermissionStatus.DRAFT,
      toStatus: PermissionStatus.IN_REVIEW,
      description: "Inicia revisión DGAC.",
      createdAt: daysFromNow(-55),
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp3.id,
      eventType: "STATUS_CHANGED",
      fromStatus: PermissionStatus.IN_REVIEW,
      toStatus: PermissionStatus.READY_FOR_SUBMISSION,
      description: "Checklist DGAC completado. Listo para envío.",
      createdAt: daysFromNow(-50),
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp3.id,
      eventType: "DOCUMENT_ATTACHED",
      description: "Adjuntado: resolución DGA y permiso municipal.",
      createdAt: daysFromNow(-48),
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp3.id,
      eventType: "STATUS_CHANGED",
      fromStatus: PermissionStatus.READY_FOR_SUBMISSION,
      toStatus: PermissionStatus.SUBMITTED,
      description: "Enviado a DGAC para autorización.",
      createdAt: daysFromNow(-45),
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp3.id,
      eventType: "STATUS_CHANGED",
      fromStatus: PermissionStatus.SUBMITTED,
      toStatus: PermissionStatus.AUTHORIZED,
      description: "Autorizado por DGAC. Permiso vigente por 30 días.",
      createdAt: daysFromNow(-40),
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId: fp3.id,
      eventType: "EMAIL_REGISTERED",
      description: "Notificación de autorización enviada al operador.",
      createdAt: daysFromNow(-40),
    },
  });

  console.log("Seeded permission events.");

  /* ── 7. Documents ─────────────────────────────────────────── */

  await prisma.document.create({
    data: {
      flightPlanId: fp2.id,
      docType: "INSURANCE",
      fileName: "certificado_seguro_2026.pdf",
      filePath: "/demo-docs/fp-002/certificado_seguro_2026.pdf",
      mimeType: "application/pdf",
      notes: "Póliza RC vigente hasta dic 2026.",
    },
  });

  await prisma.document.create({
    data: {
      flightPlanId: fp2.id,
      docType: "RPA_CHECKLIST",
      fileName: "checklist_prevuelo_fp002.pdf",
      filePath: "/demo-docs/fp-002/checklist_prevuelo_fp002.pdf",
      mimeType: "application/pdf",
    },
  });

  await prisma.document.create({
    data: {
      flightPlanId: fp3.id,
      docType: "DGAC_REGISTRY",
      fileName: "resolucion_dga_2026.pdf",
      filePath: "/demo-docs/fp-003/resolucion_dga_2026.pdf",
      mimeType: "application/pdf",
      notes: "Resolución DGA para monitoreo en humedal urbano.",
    },
  });

  await prisma.document.create({
    data: {
      flightPlanId: fp3.id,
      docType: "MAP_IMAGE",
      fileName: "plano_zonificacion_humedal.png",
      filePath: "/demo-docs/fp-003/plano_zonificacion_humedal.png",
      mimeType: "image/png",
    },
  });

  await prisma.document.create({
    data: {
      flightPlanId: fp3.id,
      docType: "KMZ_KML",
      fileName: "area_operacion_humedal.kmz",
      filePath: "/demo-docs/fp-003/area_operacion_humedal.kmz",
      mimeType: "application/vnd.google-earth.kmz",
    },
  });

  console.log("Seeded 5 documents.");
  console.log("\n✓ Demo data seeded successfully!");
  console.log("  Users:   admin (%s)", email);
  console.log("  Teams:   3 equipos de trabajo");
  console.log("  Clients: 3");
  console.log("  Drones:  3 (1 con seguro vencido)");
  console.log("  Ops:     3");
  console.log("  FPs:     3 (DRAFT / IN_REVIEW / AUTHORIZED)");
  console.log("  Events:  10");
  console.log("  Docs:    5");
  console.log("\nSet SEED_DEMO=false in .env to skip demo data on next seed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
