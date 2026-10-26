// ══════════════════════════════════════════════════════════════════════════════
// ayudas.js — Textos de los tooltips de los títulos del dashboard y de Análisis de fallos
//
// Formato (el mismo de los encabezados de la tabla de sesiones, ver <Ayuda>):
//   · cada \n es un párrafo aparte
//   · lo que va antes de ":" en una línea corta ("Qué indica:") sale en negrita
//
// Están todos aquí para que cualquier ajuste de redacción se haga en un solo lugar.
// ══════════════════════════════════════════════════════════════════════════════

export const AYUDAS = {

    // ── Dashboard: KPIs ──────────────────────────────────────────────────────
    fcr:
        'Resolución al primer contacto (First Contact Resolution).\n' +
        'Qué indica: el porcentaje de sesiones cuyo problema se resolvió en la primera interacción, sin que el cliente tuviera que volver a contactar.\n' +
        'Cómo leerlo: cuanto más alto, mejor; refleja qué tan bien se diagnostica el problema desde el inicio.\n' +
        'Solo cuenta las sesiones que tienen ese dato registrado.',

    tmo:
        'Tiempo medio de operación (AHT).\n' +
        'Qué indica: cuánto dura en promedio una sesión de atención, en segundos y en minutos.\n' +
        'Cómo leerlo: cuanto más bajo, más rápido se atiende al cliente.',

    tnps:
        'Transactional Net Promoter Score.\n' +
        'Qué indica: la satisfacción del cliente justo después de la sesión, a partir de su nota de 0 a 10.\n' +
        'Cómo se calcula: % de promotores (9–10) menos % de detractores (0–6). Los pasivos (7–8) no suman ni restan.\n' +
        'Cómo leerlo: va de −100 a +100; cuanto más alto, mejor.',

    tasaExito:
        'Tasa de éxito en sesiones.\n' +
        'Qué indica: el porcentaje de sesiones que terminaron resueltas con éxito sobre el total.\n' +
        'Las demás terminaron escaladas, pendientes o abandonadas.',

    resolucionIA:
        'Resolución por IA (deflection).\n' +
        'Qué indica: el porcentaje de sesiones que la IA resolvió por completo, sin intervención de un agente humano.\n' +
        'Por qué importa: cuanto más alto, menos carga y menos costo de atención humana.',

    // ── Dashboard: score global ──────────────────────────────────────────────
    score:
        'Score global de calidad.\n' +
        'Qué indica: la calidad de resolución del período en una sola cifra.\n' +
        'Cómo se calcula: suma de las cinco dimensiones (Precisión, Efectividad, Eficiencia, Experiencia y Resolución por IA), cada una de 0 a 100, para un máximo de 500.\n' +
        'Niveles: Básico (menos de 250), Intermedio (250–349), Avanzado (350–424) y Excelente (425 o más).',

    dimensiones:
        'Las cinco dimensiones que forman el score global; cada barra va de 0 a 100%.\n' +
        'Colores: verde 80% o más, amarillo 50–79%, rojo menos de 50%.',

    dim: {
        'Precisión':
            'Precisión.\nQué mide: el % de sesiones resueltas al primer contacto (FCR).',
        'Efectividad':
            'Efectividad.\nQué mide: el % de sesiones que terminaron resueltas con éxito (tasa de éxito).',
        'Eficiencia':
            'Eficiencia.\nQué mide: el % de sesiones que duraron 5 minutos (300 segundos) o menos.',
        'Experiencia':
            'Experiencia.\nQué mide: el % de sesiones en las que el cliente dio una nota de 9 o 10 (promotores).',
        'Resolución por IA':
            'Resolución por IA.\nQué mide: el % de sesiones que la IA resolvió por completo, sin agente humano.',
    },

    // ── Dashboard: gráficos ──────────────────────────────────────────────────
    fcrTmo: (porDia) =>
        'Evolución del FCR y del TMO a lo largo del período.\n' +
        'FCR: porcentaje de sesiones resueltas al primer contacto.\n' +
        'TMO: duración promedio de las sesiones, en segundos.\n' +
        `Cada punto es un ${porDia ? 'día' : 'mes'}; pasa el cursor por el gráfico para ver el valor exacto.`,

    canal:
        'Cómo se reparten las sesiones entre los canales de atención.\n' +
        'Qué indica: el % de sesiones que llegó por cada canal (app móvil, call center, web chat, email o WhatsApp).\n' +
        'Por qué importa: muestra por dónde contactan más los clientes.',

    zona:
        'Qué indica: el % de sesiones resueltas con éxito en cada zona (ciudad y subzona).\n' +
        'Cómo leerlo: cuanto más larga la barra, mejor resuelve esa zona. Sirve para detectar zonas con problemas de atención.',

    // ── Análisis de fallos: KPIs ─────────────────────────────────────────────
    fallosSesiones:
        'Sesiones que terminaron sin resolverse.\n' +
        'Qué indica: cuántas sesiones del período quedaron escaladas, pendientes o abandonadas.\n' +
        'Debajo se muestra qué porcentaje es del total de sesiones del período.',

    fallosPrincipal:
        'Qué indica: el problema que generó más sesiones en el período, con su número de sesiones y cuántas de ellas quedaron sin resolver.\n' +
        'Prioridad: Crítica, Alta, Media o Baja, según la urgencia del problema.',

    fallosImpacto:
        'Qué indica: cuánto pesa el problema principal dentro de todos los fallos del período.\n' +
        'Cómo se calcula: sesiones sin resolver del problema principal ÷ total de sesiones sin resolver del período.\n' +
        'Cómo leerlo: un porcentaje alto indica que un solo problema concentra gran parte de los fallos.',

    fallosResolucion:
        'Qué indica: el porcentaje de sesiones resueltas, calculado con la tasa de cada prioridad y ponderado por su número de sesiones.\n' +
        'Meta: 75%. La tarjeta se ve verde si se alcanza y roja si queda por debajo.\n' +
        'Críticos: la tasa de resolución solo de los problemas de prioridad Crítica.',

    // ── Análisis de fallos: gráficos y tabla ─────────────────────────────────
    fallosTop:
        'Los 10 problemas con más sesiones en el período.\n' +
        'Qué indica: cada barra es el número de sesiones de un problema.\n' +
        'Colores: según la prioridad del problema (Crítica, Alta, Media o Baja), como muestra la leyenda.',

    fallosCategoria:
        'Cómo se reparten las sesiones por tipo de problema (por ejemplo conectividad, hardware o facturación).\n' +
        'Qué indica: el % de sesiones de cada categoría sobre el total. Pasa el cursor por el gráfico para ver el detalle de cada una.',

    fallosPrioridad:
        'Qué indica: cuántas sesiones hay en cada nivel de prioridad y qué porcentaje se resolvió.\n' +
        'Cómo leerlo: permite ver si los problemas críticos se resuelven tanto como los demás. La meta es 75%.\n' +
        'Colores de la barra: verde 75% o más, amarillo 50–74%, rojo menos de 50%.',

    fallosDispositivos:
        'Qué indica: los modelos de dispositivo con más sesiones sin resolver (escaladas, pendientes o abandonadas).\n' +
        'Cómo leerlo: la barra es el número de esas sesiones; el color indica el % de fallos sobre todas las sesiones del modelo.\n' +
        'Colores: rojo 50% o más, naranja 30–49%, amarillo 15–29%, verde menos de 15%.',
}
