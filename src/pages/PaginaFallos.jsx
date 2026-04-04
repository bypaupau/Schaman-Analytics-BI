// ══════════════════════════════════════════════════════════════════════════════
// PaginaFallos.jsx — Página "Análisis de Fallos"
//
// Responde las preguntas:
//   1. ¿Qué problemas generan más contactos al call center?
//   2. ¿Qué categoría de problema domina? (Conectividad, Hardware, Facturación…)
//   3. ¿Se están resolviendo los problemas más críticos?
//   4. ¿Qué modelo de dispositivo tiene más fallos sin resolver?
//
// Dimensiones explotadas: DIM_PROBLEMA + DIM_DISPOSITIVO
// ══════════════════════════════════════════════════════════════════════════════

import { useFallosData }    from '../hooks/useFallosData'
import { GraficoBarrasGen } from '../components/GraficoBarrasGen'
import { GraficoPie }       from '../components/GraficoPie'
import { KPICard }          from '../components/KPICard'

// ── Helper: color de prioridad insensible a mayúsculas y tildes ──────────────
// Problema: si la BD devuelve 'CRÍTICA' y buscamos 'Crítica', no hay match.
// Solución: normalizamos ambos lados antes de comparar.
function normalizarTexto(str) {
    return (str ?? '')
        .toLowerCase()
        .normalize('NFD')                          // separa la letra base de su tilde
        .replace(/[\u0300-\u036f]/g, '')           // elimina los diacríticos (tildes, etc.)
}

// Mapa de colores por prioridad (normalizado para que 'Crítica', 'CRITICA',
// 'critica' y 'Crítica' todos devuelvan el mismo color)
const COLORES_PRIORIDAD_NORM = {
    'critica': { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' },
    'alta':    { bg: '#FFF7ED', text: '#F97316', border: '#FED7AA' },
    'media':   { bg: '#FEFCE8', text: '#EAB308', border: '#FEF08A' },
    'baja':    { bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE' },
}

function getPrioridadColor(prioridad) {
    return COLORES_PRIORIDAD_NORM[normalizarTexto(prioridad)] ?? COLORES_PRIORIDAD_NORM['baja']
}

// ── Helper: color de dispositivo según tasa de fallos sin resolver ────────────
//
// Semáforo de 4 niveles basado en qué porcentaje de las sesiones del dispositivo
// terminaron en estado fallido (ESCALADO, ABANDONADO o PENDIENTE):
//
//   ≥ 50% → ROJO    — más de la mitad de sus sesiones son problemáticas. Crítico.
//   ≥ 30% → NARANJA — proporción alta, requiere atención pronta
//   ≥ 15% → AMARILLO — presencia de fallos, pero por debajo del umbral de alerta
//   < 15% → VERDE   — tasa residual, el dispositivo no es un problema significativo
//
// NOTA: todos los dispositivos en esta lista YA tienen al menos un fallo.
// El color expresa qué tan GRAVE es el problema de ese dispositivo en particular.
function colorDispositivoPorFallos(pct_fallos) {
    if (pct_fallos >= 50) return '#EF4444'   // rojo    — más de la mitad son fallos
    if (pct_fallos >= 30) return '#F97316'   // naranja — proporción alta, monitorear
    if (pct_fallos >= 15) return '#EAB308'   // amarillo — presente pero controlable
    return '#10B981'                          // verde   — tasa baja, no es foco de riesgo
}

// ── Card genérica para envolver cada gráfico (mismo estilo que el Overview) ──
function Card({ titulo, subtitulo, children }) {
    return (
        <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            borderRadius: 16,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid var(--border)' }}>
                <p style={{
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--text-light)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                }}>
                    {titulo}
                </p>
                {subtitulo && (
                    <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                        {subtitulo}
                    </p>
                )}
            </div>
            <div style={{ padding: '12px 16px 16px', flex: 1 }}>
                {children}
            </div>
        </div>
    )
}

// ── Card especial para "Problema Top" ─────────────────────────────────────────
// El KPICard normal muestra un número grande como protagonista, pero aquí el
// protagonista es EL NOMBRE del problema, no cuántas sesiones tiene.
// Por eso hacemos un componente a medida donde el texto ocupa el lugar de honor.
function CardProblema({ topProblema }) {
    // Si todavía no cargaron los datos, mostramos un placeholder
    if (!topProblema) {
        return (
            <div style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                borderRadius: 16,
                borderTop: '3px solid #8B5CF6',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
            }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#659e66', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Problema Top
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-light)' }}>El que genera más sesiones de soporte</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6bb36f', lineHeight: 1.2, marginTop: 4 }}>—</p>
            </div>
        )
    }

    // Obtenemos el color del badge de prioridad para este problema
    const c = getPrioridadColor(topProblema.prioridad)

    return (
        <div
            style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                borderRadius: 16,
                borderTop: '3px solid #8B5CF6',  // violeta — color de identidad de esta card
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'default',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,52,96,0.10)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow)'
            }}
        >
            {/* Sigla del KPI */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                Problema Top
            </p>

            {/* Sub-label: aclaramos que el ranking es por volumen de sesiones */}
            <p style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 10, lineHeight: 1.3 }}>
                El que genera más sesiones de soporte (por volumen)
            </p>

            {/* NOMBRE DEL PROBLEMA — protagonista visual */}
            {/* Usamos tamaño reducido pero legible porque los nombres son largos */}
            <p style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#8B5CF6',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                marginBottom: 10,
            }}>
                {topProblema.problema}
            </p>

            {/* Badge de prioridad — hereda el color del mapa de prioridades */}
            <span style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 999,
                background: c.bg,
                color: c.text,
                border: `1px solid ${c.border}`,
                marginBottom: 10,
                width: 'fit-content',
            }}>
                Prioridad {topProblema.prioridad}
            </span>

            {/* Separador */}
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 10 }} />

            {/* Número de sesiones como dato secundario (no como protagonista) */}
            <p style={{ fontSize: 11, color: 'var(--text-light)', lineHeight: 1.55, marginTop: 'auto' }}>
                {Number(topProblema.total_sesiones).toLocaleString()} sesiones generadas este año
            </p>
        </div>
    )
}

// ── Tabla de resolución por prioridad ────────────────────────────────────────
// Mostramos esta info como tabla porque los valores exactos importan más que
// la proporción visual (un gráfico de barras agrupadas sería más difícil de leer).
function TablaPrioridad({ data }) {
    if (!data || data.length === 0) {
        return (
            <p style={{ color: 'var(--text-light)', fontSize: 13, textAlign: 'center', padding: 24 }}>
                Sin datos disponibles
            </p>
        )
    }

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Prioridad', 'Total sesiones', 'Resueltas', 'Tasa %'].map(h => (
                        <th key={h} style={{
                            textAlign: h === 'Prioridad' ? 'left' : 'right',
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--text-light)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => {
                    // Usamos la función helper con normalización para que no falle
                    // si la BD devuelve 'CRÍTICA' en vez de 'Crítica'
                    const c = getPrioridadColor(row.prioridad)
                    return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            {/* Insignia de prioridad con color */}
                            <td style={{ padding: '10px 10px' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '2px 10px',
                                    borderRadius: 999,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: c.bg,
                                    color: c.text,
                                    border: `1px solid ${c.border}`,
                                }}>
                                    {row.prioridad}
                                </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                                {Number(row.total_sesiones).toLocaleString()}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', color: '#10B981', fontWeight: 600 }}>
                                {Number(row.resueltas).toLocaleString()}
                            </td>
                            {/*
                                Tasa de resolución con semáforo de colores:
                                  ≥ 75% → verde (cumple la meta)
                                  ≥ 50% → amarillo (en zona de alerta)
                                  < 50% → rojo (por debajo del umbral mínimo)
                            */}
                            <td style={{
                                padding: '10px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: row.tasa_resolucion >= 75 ? '#10B981'
                                     : row.tasa_resolucion >= 50 ? '#EAB308'
                                     : '#EF4444',
                            }}>
                                {row.tasa_resolucion}%
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

// ── Componente principal de la página ────────────────────────────────────────
export function PaginaFallos({ anio }) {
    // El hook llama los 4 RPCs en paralelo cuando recibe el año
    const { topProblemas, porCategoria, porPrioridad, topDispositivos } = useFallosData(anio)

    // ── KPIs de resumen para las 3 cards superiores ─────────────────────────
    // Sumamos todas las sesiones de los top problemas para el total del año
    const totalSesiones = topProblemas?.reduce((acc, p) => acc + Number(p.total_sesiones), 0) ?? 0

    // El primer problema del ranking (viene ordenado DESC por total_sesiones desde el SQL)
    const topProblema = topProblemas?.[0]

    // Tasa global ponderada: promedio de tasas de resolución ponderado por volumen de sesiones.
    // No es lo mismo que el promedio simple — un problema con 100 sesiones pesa más que uno con 5.
    const tasaGlobal = porPrioridad?.length
        ? Math.round(
            porPrioridad.reduce((acc, p) => acc + Number(p.tasa_resolucion) * Number(p.total_sesiones), 0)
            / porPrioridad.reduce((acc, p) => acc + Number(p.total_sesiones), 0)
          )
        : null

    // Fila de los problemas críticos para el texto de detalle del 3er KPI
    const criticaRow = porPrioridad?.find(p => normalizarTexto(p.prioridad) === 'critica')

    // ── Enriquecemos los dispositivos con color antes de pasarlo al gráfico ─
    // GraficoBarrasGen lee la propiedad `color` de cada dato para colorear la barra.
    // Si no existe, usa azul por defecto. Con esto cada barra refleja la gravedad del dispositivo.
    const dispositivosConColor = (topDispositivos ?? []).map(d => ({
        ...d,
        color: colorDispositivoPorFallos(d.pct_fallos ?? 0),
    }))

    // ── Color del KPI de Resolución ──────────────────────────────────────────
    // 69% de resolución NO debería verse "neutral" (amber). Tiene que verse
    // como alerta: si estamos por debajo de la meta del 75%, es rojo.
    const colorResolucion = tasaGlobal == null
        ? 'blue'                         // todavía cargando — azul neutro
        : tasaGlobal >= 75 ? 'green'     // ≥ 75% → cumple la meta
        : 'red'                          // < 75% → por debajo del objetivo — llamar la atención

    return (
        <main style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Título de página ── */}
            <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand)', margin: 0 }}>
                    Análisis de Fallos
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>
                    Problemas más frecuentes · Dispositivos con mayor tasa de fallo · Año {anio}
                </p>
            </div>

            {/* ── 3 KPI Cards — cada una un color distinto, ninguna repetida ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>

                {/*
                    Card 1 (azul): Cuántas sesiones en total tuvieron algún tipo de problema.
                    Muestra el tamaño del universo que se analiza en esta página.
                */}
                <KPICard
                    KPINombre="Sesiones con fallo"
                    kpiLabel="Sesiones que terminaron sin resolverse"
                    metricaKPI={totalSesiones > 0 ? totalSesiones.toLocaleString() : '—'}
                    textoKPI={
                        topProblema
                            ? `Distribuidas en ${topProblemas.length} tipos de problema distintos`
                            : 'Sin datos para el período'
                    }
                    color="blue"
                    tendencia="Volumen anual"
                    positivo={true}
                />

                {/*
                    Card 2 (violeta): Problema con más sesiones generadas.
                    Usamos CardProblema (no KPICard) porque el protagonista es el NOMBRE
                    del problema, no un número. La etiqueta "Por volumen de sesiones" deja
                    claro que esto es un ranking por cantidad de contactos, no por prioridad.
                    Un problema MEDIA puede ser el Top si genera muchas llamadas.
                */}
                <CardProblema topProblema={topProblema} />

                {/*
                    Card 3: Tasa global ponderada de resolución.

                    Interpretación correcta:
                    - La tasa se pondera por volumen: los problemas con más sesiones pesan más.
                    - El umbral de meta es 75%. Por debajo → rojo; por encima → verde.
                    - El texto secundario muestra la tasa de los CRÍTICOS por separado.
                      Si los críticos están bien (ej: 80% ✓) pero el global es bajo (69%),
                      el culpable es el volumen de problemas de prioridad MEDIA.

                    ⚠️ Un 69% en ROJO es correcto: el objetivo no se cumple a nivel global
                    aunque los casos críticos individuales sí se estén resolviendo bien.
                */}
                <KPICard
                    KPINombre="Tasa de resolución"
                    kpiLabel="Ponderada por volumen de sesiones"
                    metricaKPI={tasaGlobal != null ? `${tasaGlobal}%` : '—'}
                    textoKPI={
                        criticaRow
                            ? `Críticos: ${criticaRow.tasa_resolucion}% ${criticaRow.tasa_resolucion >= 75 ? '✓' : '⚠'} · Meta global: 75%`
                            : 'Sin datos de prioridad disponibles'
                    }
                    color={colorResolucion}
                    tendencia={tasaGlobal != null && tasaGlobal >= 75 ? '✓ Meta alcanzada' : '⚠ Por debajo del objetivo'}
                    positivo={tasaGlobal != null && tasaGlobal >= 75}
                />
            </div>

            {/* ── Fila 1: Top 10 problemas (2/3) + Categorías pie (1/3) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <Card
                    titulo="Top 10 Problemas más frecuentes"
                    subtitulo="Número de sesiones generadas por cada problema · color = prioridad"
                >
                    <GraficoBarrasGen
                        data={topProblemas}
                        labelKey="problema"
                        valueKey="total_sesiones"
                        colorKey="color"
                        suffix=" ses."
                    />
                </Card>

                <Card
                    titulo="Distribución por Categoría"
                    subtitulo="% de sesiones según tipo de problema"
                >
                    {/* GraficoPie ya maneja el estado vacío internamente */}
                    <GraficoPie data={porCategoria} />
                </Card>
            </div>

            {/* ── Fila 2: Resolución por prioridad (1/2) + Top dispositivos (1/2) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card
                    titulo="Resolución por nivel de prioridad"
                    subtitulo="¿Se resuelven más los problemas críticos que los de baja prioridad?"
                >
                    <TablaPrioridad data={porPrioridad} />
                </Card>

                <Card
                    titulo="Dispositivos con más sesiones sin resolver"
                    subtitulo="Columna = nº de fallos · Color = % de fallos sobre el total del dispositivo"
                >
                    {/*
                        orientation="vertical" → columnas hacia arriba (en vez de barras horizontales).
                        Así los dos gráficos de barras del dashboard no se ven iguales.
                        Pasamos `dispositivosConColor` porque le añadimos el `color` calculado
                        por `colorDispositivoPorFallos` según su porcentaje real de fallos.
                    */}
                    <GraficoBarrasGen
                        data={dispositivosConColor}
                        labelKey="modelo"
                        valueKey="sesiones_con_fallo"
                        colorKey="color"
                        suffix=" ses."
                        orientation="vertical"
                    />
                </Card>
            </div>

        </main>
    )
}
