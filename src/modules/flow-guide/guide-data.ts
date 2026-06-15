export type GuideEntry = {
  title: string;
  icon: string;
  steps: string[];
  tip?: string;
};

/**
 * Help content keyed by pathname patterns.
 * The first matching pattern wins (most specific first).
 */
export const guideContent: Array<{ pattern: RegExp; entry: GuideEntry }> = [
  {
    pattern: /^\/dashboard$/,
    entry: {
      title: "Centro de comando",
      icon: "◉",
      steps: [
        "Este es tu panel principal — acá ves el resumen de todas las operaciones.",
        "Los indicadores te muestran: planes de vuelo, drones activos, operadores y clientes.",
        "La línea de tiempo muestra la actividad reciente de permisos y documentos.",
        "Usá los accesos rápidos a la derecha para crear un plan de vuelo o revisar flota.",
        "¿Primera vez? Creá un plan de vuelo para empezar a operar.",
      ],
      tip: "Tip: Los badges de distribución de permisos te ayudan a detectar rápidamente si hay autorizaciones vencidas o pendientes.",
    },
  },
  {
    pattern: /^\/flight-plans\/[^/]+\/geometry$/,
    entry: {
      title: "Editor de geometría",
      icon: "🗺️",
      steps: [
        "En esta página podés dibujar la zona de operación directamente sobre el mapa.",
        "Usá las herramientas: punto, línea o polígono para marcar el área de vuelo.",
        "El GeoJSON generado se guarda automáticamente al hacer clic en 'Save geometry'.",
        "Si ya hay una geometría cargada, se muestra en el mapa y la podés editar.",
        "Los cambios se sincronizan con el textarea de GeoJSON para edición manual avanzada.",
      ],
      tip: "Tip: Dibujá un polígono alrededor del área de operación. El centroide se usará para el pronóstico climático.",
    },
  },
  {
    pattern: /^\/flight-plans\/([^/]+)$/,
    entry: {
      title: "Plan de vuelo",
      icon: "✈️",
      steps: [
        "Acá gestionás todos los aspectos del plan de vuelo: datos operacionales, permisos y documentos.",
        "Columna izquierda: formulario con datos del plan de vuelo, flujo de permisos y documentos.",
        "Columna derecha: línea de tiempo de eventos y condiciones climáticas estimadas.",
        "El flujo de permisos tiene 10 estados: DRAFT → IN_REVIEW → SUBMITTED → AUTHORIZED → CLOSED.",
        "Cada transición queda registrada en la auditoría con fecha y responsable.",
        "Para emitir un permiso, primero cargá la documentación requerida.",
      ],
      tip: "Tip: El clima se obtiene automáticamente desde las coordenadas de la geometría del plan de vuelo. Sin geometría, no hay pronóstico.",
    },
  },
  {
    pattern: /^\/flight-plans\/new$/,
    entry: {
      title: "Nuevo plan de vuelo",
      icon: "✈️",
      steps: [
        "Completá el formulario para crear un nuevo plan de vuelo.",
        "Código interno: usá un formato como FP-2026-001.",
        "Seleccioná: centro de costo, cliente, dron y operador.",
        "La fecha de operación define cuándo se realizará el vuelo.",
        "La geometría (GeoJSON) es opcional en la creación. Podés agregarla después.",
      ],
      tip: "Tip: Si no ves centros de costo o clientes en los selectores, primero crealos desde sus módulos correspondientes.",
    },
  },
  {
    pattern: /^\/flight-plans$/,
    entry: {
      title: "Planes de vuelo",
      icon: "✈️",
      steps: [
        "Lista completa de todos los planes de vuelo registrados.",
        "Cada fila muestra: código, título, asignación (centro de costo/cliente), geometría y estado.",
        "Usá 'Create flight plan' para agregar uno nuevo.",
        "Hacé clic en 'Edit' para ver el detalle y gestionar permisos y documentos.",
        "Los filtros de búsqueda te ayudan a encontrar planes rápidamente.",
      ],
      tip: "Tip: Los planes sin geometría no mostrarán pronóstico climático ni se podrán visualizar en el mapa.",
    },
  },
  {
    pattern: /^\/drones\/new$/,
    entry: {
      title: "Nuevo dron",
      icon: "🛸",
      steps: [
        "Registrá un nuevo dron en la flota.",
        "Número de serie: obligatorio y único.",
        "Modelo y fabricante ayudan a identificar el equipo.",
        "Centro de costo: asigná el dron a un centro de costo.",
        "El dron se crea como activo por defecto.",
      ],
    },
  },
  {
    pattern: /^\/drones/,
    entry: {
      title: "Flota de drones",
      icon: "🛸",
      steps: [
        "Gestioná todos los drones registrados en la plataforma.",
        "Cada dron tiene: modelo, número de serie, fabricante y centro de costo.",
        "Estado: activo o inactivo para control de disponibilidad.",
        "Los drones se asignan a planes de vuelo al crear una misión.",
      ],
      tip: "Tip: Mantené los números de serie actualizados para la documentación DGAC.",
    },
  },
  {
    pattern: /^\/operators/,
    entry: {
      title: "Operadores RPA",
      icon: "👨‍✈️",
      steps: [
        "Registrá los operadores RPA que realizan los vuelos.",
        "Cada operador necesita: nombre, licencia y datos de contacto.",
        "Los operadores se asignan a planes de vuelo como responsables.",
        "Estado activo/inactivo para control de disponibilidad.",
      ],
      tip: "Tip: Vinculá la licencia del operador como documento en los planes de vuelo para mantener la trazabilidad.",
    },
  },
  {
    pattern: /^\/cost-centers/,
    entry: {
      title: "Centros de costo",
      icon: "📊",
      steps: [
        "Organizá las operaciones por centro de costo.",
        "Cada centro agrupa: drones, operadores y planes de vuelo.",
        "Útil para reportes financieros y asignación de recursos.",
        "Código único: usá un formato como CC-001.",
      ],
    },
  },
  {
    pattern: /^\/clients/,
    entry: {
      title: "Clientes",
      icon: "🤝",
      steps: [
        "Registrá los clientes o mandantes de las operaciones.",
        "Cada cliente puede tener múltiples planes de vuelo asociados.",
        "Datos de contacto: nombre, email y notas opcionales.",
        "Código opcional para integración con sistemas externos.",
      ],
    },
  },
];

export function findGuide(pathname: string): GuideEntry | null {
  for (const { pattern, entry } of guideContent) {
    if (pattern.test(pathname)) return entry;
  }
  return null;
}
