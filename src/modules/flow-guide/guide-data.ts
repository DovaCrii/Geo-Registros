export type GuideEntry = {
  title: string;
  icon: string;
  focus?: string[];
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
      focus: [
        "Tarjeta \"Siguiente acción\"",
        "Semáforo operativo",
        "Flujo recomendado",
        "Pendientes de hoy",
        "Actividad reciente",
      ],
      steps: [
        "Usá la tarjeta 'Siguiente acción' para abrir el siguiente paso recomendado.",
        "Leé el semáforo operativo para saber si hoy estás en verde, amarillo o rojo.",
        "Revisá el flujo recomendado para ubicar en qué etapa estás.",
        "Entrá a 'Pendientes de hoy' para resolver lo que bloquea el avance.",
        "Mirá la actividad reciente para entender qué cambió y qué se hizo.",
        "Si arrancás de cero, creá un plan de vuelo para activar el resto del tablero.",
      ],
      tip: "Tip: La tarjeta de siguiente acción prioriza el paso más útil según el estado operativo actual.",
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
        "El GeoJSON generado se guarda automáticamente al hacer clic en 'Guardar área de operación'.",
        "Si ya hay una geometría cargada, se muestra en el mapa y la podés editar.",
        "La edición manual avanzada queda detrás de 'Ver GeoJSON avanzado'.",
      ],
      tip: "Tip: Dibujá un polígono alrededor del área de operación. El centroide se usará para el pronóstico climático.",
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
        "El wizard separa el alta en pasos para evitar saturar el formulario con JSON técnico.",
      ],
      tip: "Tip: Si no ves centros de costo o clientes en los selectores, primero crealos desde sus módulos correspondientes.",
    },
  },
  {
    pattern: /^\/flight-plans\/([^/]+)$/,
    entry: {
      title: "Plan de vuelo",
      icon: "✈️",
      steps: [
        "Acá gestionás todos los aspectos del plan de vuelo: datos operacionales, permisos y documentos.",
        "El wizard te guía por datos generales, asignación, área de operación, documentación y revisión final.",
        "La geometría se trabaja desde el editor de área de operación.",
        "El flujo de permisos tiene 10 estados operativos y queda auditado por evento.",
        "Cada transición queda registrada en la auditoría con fecha y responsable.",
        "Para emitir un permiso, primero cargá la documentación requerida.",
      ],
      tip: "Tip: El clima se obtiene automáticamente desde las coordenadas de la geometría del plan de vuelo. Sin geometría, no hay pronóstico.",
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
        "Usá 'Crear plan de vuelo' para agregar uno nuevo.",
        "Hacé clic en 'Editar' para ver el detalle y gestionar permisos y documentos.",
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
    pattern: /^\/operators\/new$/,
    entry: {
      title: "Nuevo operador",
      icon: "👨‍✈️",
      steps: [
        "Registrá un nuevo operador RPA en el sistema.",
        "Nombre completo: obligatorio para identificación.",
        "Licencia y vencimiento: datos clave para la documentación DGAC.",
        "Centro de costo: asignación opcional a un grupo de trabajo.",
        "El operador se crea como activo por defecto.",
      ],
      tip: "Tip: Mantené la licencia al día — sin licencia vigente no se puede operar.",
    },
  },
  {
    pattern: /^\/operators\/([^/]+)$/,
    entry: {
      title: "Detalle del operador",
      icon: "👨‍✈️",
      steps: [
        "Acá ves la información completa del operador.",
        "Podés editar nombre, contacto, licencia y datos personales.",
        "El vencimiento de licencia se muestra como alerta si está próximo.",
        "Los cambios se persisten en base de datos con actualización inmediata.",
      ],
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
    pattern: /^\/cost-centers\/new$/,
    entry: {
      title: "Nuevo grupo de trabajo",
      icon: "📊",
      steps: [
        "Creá un nuevo centro de costo o grupo de trabajo.",
        "Código: único, formato sugerido GT-001.",
        "Nombre y descripción ayudan a identificar el grupo.",
        "Los grupos agrupan drones, operadores y planes de vuelo.",
      ],
    },
  },
  {
    pattern: /^\/cost-centers/,
    entry: {
      title: "Grupos de trabajo",
      icon: "📊",
      steps: [
        "Organizá las operaciones por grupo de trabajo.",
        "Cada grupo puede agrupar drones, operadores y planes de vuelo.",
        "Útil para reportes financieros y asignación de recursos.",
        "Código único: usá un formato como GT-001.",
      ],
    },
  },
  {
    pattern: /^\/ayuda/,
    entry: {
      title: "Centro de ayuda",
      icon: "❓",
      steps: [
        "Secciones organizadas por etapa operativa: antes, durante y después del vuelo.",
        "Cada sección agrupa temas DGAC y operativos relevantes.",
        "La checklist DGAC te guía en los requisitos por plan de vuelo.",
        "La documentación interna carga archivos de referencia del equipo.",
        "Usá el botón flotante de ayuda (?) desde cualquier página para tips contextuales.",
      ],
      tip: "Tip: Este centro es material de apoyo interno. No reemplaza normativa DGAC oficial ni asesoría legal especializada.",
    },
  },
  {
    pattern: /^\/clients\/new$/,
    entry: {
      title: "Nuevo cliente",
      icon: "🤝",
      steps: [
        "Completá los datos del cliente o mandante de la operación.",
        "Código: opcional, útil para integración con sistemas externos.",
        "Nombre: obligatorio, identifica al cliente en los listados.",
        "Contacto: nombre, email y notas complementarias.",
        "El cliente se crea como activo por defecto.",
      ],
    },
  },
  {
    pattern: /^\/clients\/([^/]+)$/,
    entry: {
      title: "Detalle del cliente",
      icon: "🤝",
      steps: [
        "Acá ves la información completa del cliente.",
        "Podés editar código, nombre, contacto y notas.",
        "Los cambios se persisten en base de datos con actualización inmediata.",
        "El estado activo/inactivo controla disponibilidad en los formularios de asignación.",
      ],
    },
  },
  {
    pattern: /^\/cost-centers\/new$/,
    entry: {
      title: "Nuevo grupo de trabajo",
      icon: "📊",
      steps: [
        "Creá un nuevo centro de costo o grupo de trabajo.",
        "Código: único, formato sugerido GT-001.",
        "Nombre y descripción ayudan a identificar el grupo.",
        "Los grupos agrupan drones, operadores y planes de vuelo.",
      ],
    },
  },
  {
    pattern: /^\/master-data/,
    entry: {
      title: "Datos maestros",
      icon: "📊",
      steps: [
        "Vista consolidada de todas las entidades base del sistema.",
        "Cada tarjeta muestra el total de registros y cuántos están activos.",
        "Hacé clic en una tarjeta para ir al listado completo de esa entidad.",
        "Usá 'Nuevo' para crear un registro directamente desde acá.",
        "Los datos se cargan en tiempo real desde la base de datos.",
      ],
      tip: "Los registros inactivos no aparecen en los selectores de creación de planes de vuelo.",
    },
  },
  {
    pattern: /^\/admin\/email-logs\/([^/]+)$/,
    entry: {
      title: "Detalle del correo",
      icon: "📧",
      steps: [
        "Acá ves el contenido completo del correo enviado.",
        "Estados: 'sent' (enviado), 'failed' (error al enviar), 'bounced' (rechazado por el servidor destino).",
        "Si el estado es 'failed', podés reenviar el correo con el botón superior derecho.",
        "El error técnico aparece en la columna izquierda para diagnosticar problemas con el proveedor de email.",
        "El cuerpo del correo se muestra en formato HTML renderizado.",
      ],
      tip: "Los errores de envío suelen deberse a credenciales SMTP inválidas o dominio destino inexistente.",
    },
  },
  {
    pattern: /^\/admin\/users\/new$/,
    entry: {
      title: "Nuevo usuario",
      icon: "👤",
      steps: [
        "Creá un usuario administrativo manualmente.",
        "Email: debe ser único en el sistema.",
        "Rol: definí si será admin, supervisor u operador.",
        "El usuario creado recibirá un email para establecer su contraseña.",
      ],
    },
  },
  {
    pattern: /^\/admin\/users\/([^/]+)$/,
    entry: {
      title: "Detalle del usuario",
      icon: "👤",
      steps: [
        "Acá ves la información completa del usuario: email, rol, nombre y datos de perfil.",
        "Podés cambiar el rol entre admin, supervisor y operador según corresponda.",
        "Los cambios de rol se reflejan inmediatamente en los permisos del sistema.",
        "Para desactivar un usuario, cambiá su estado a inactivo.",
      ],
      tip: "Los usuarios autogestionados se crean desde /auth/register. Este panel es solo para administración.",
    },
  },
  {
    pattern: /^\/admin\/users/,
    entry: {
      title: "Usuarios del sistema",
      icon: "👤",
      steps: [
        "Listado de todos los usuarios registrados en la plataforma.",
        "Cada usuario tiene: email, nombre, rol y estado (activo/inactivo).",
        "Usá la búsqueda para encontrar usuarios por nombre o email.",
        "Hacé clic en un usuario para ver su detalle y gestionar permisos.",
        "Solo administradores pueden acceder a esta sección.",
      ],
      tip: "Los cambios de rol son efectivos inmediatamente. No requieren reconexión.",
    },
  },
  {
    pattern: /^\/admin\/help-docs/,
    entry: {
      title: "Documentación DGAC",
      icon: "📄",
      steps: [
        "Panel administrativo para gestionar documentos DGAC que se muestran en /ayuda.",
        "Subí archivos (PDF, DOC, etc.) con un título y categoría.",
        "Los documentos publicados aparecen automáticamente en el centro de ayuda.",
        "Podés eliminar documentos existentes desde este mismo panel.",
      ],
      tip: "Los documentos deben estar en formato accesible. Evitá archivos escaneados de baja calidad.",
    },
  },
  {
    pattern: /^\/admin\/email-logs/,
    entry: {
      title: "Registro de correos",
      icon: "📧",
      steps: [
        "Historial de todos los correos enviados desde la plataforma: notificaciones, permisos, reportes y envíos manuales.",
        "Cada fila muestra: destinatario, asunto, tipo, estado y plan de vuelo asociado.",
        "Tipos de correo: 'Notificación' (automática del sistema), 'Permiso' (documentación DGAC), 'Reporte' (exportaciones), 'Manual' (envío hecho por un operador).",
        "Estados: 'sent' → enviado correctamente, 'failed' → error en el envío, 'bounced' → rechazado por el destino.",
        "Si un correo falló, entrá al detalle para ver el error y reenviarlo.",
      ],
      tip: "Los correos no se reenvían automáticamente. Si ves un 'failed', revisá la configuración SMTP antes de reenviar.",
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
  // Strip query strings and trailing slash for consistent matching
  const clean = pathname.split("?")[0].replace(/\/$/, "") || "/";
  for (const { pattern, entry } of guideContent) {
    if (pattern.test(clean)) return entry;
  }
  return null;
}
