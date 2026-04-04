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
import {AlertOctagon, Activity, CheckCircle2, PieChartIcon} from 'lucide-react'

// ── Helper: color de prioridad insensible a mayúsculas y tildes ──────────────
function normalizarTexto(str) {
    return (str ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

const COLORES_PRIORIDAD_NORM = {
    'critica': { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' },
    'alta':    { bg: '#FFF7ED', text: '#F97316', border: '#FED7AA' },
    'media':   { bg: '#FEFCE8', text: '#EAB308', border: '#FEF08A' },
    'baja':    { bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE' },
}

function getPrioridadColor(prioridad) {
    return COLORES_PRIORIDAD_NORM[normalizarTexto(prioridad)] ?? COLORES_PRIORIDAD_NORM['baja']
}

// ── Helper: color de dispositivo según tasa de fallos ────────────
function colorDispositivoPorFallos(pct_fallos) {
    if (pct_fallos >= 50) return '#EF4444'   // rojo
    if (pct_fallos >= 30) return '#F97316'   // naranja
    if (pct_fallos >= 15) return '#EAB308'   // amarillo
    return '#10B981'                          // verde
}

// ── Card genérica para envolver cada gráfico ──
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
            <div style={{ padding: '12px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </div>
    )
}

// ── Tabla de resolución por prioridad ────────────────────────────────────────
function TablaPrioridad({ data }) {
    if (!data || data.length === 0) {
        return <p style={{ color: 'var(--text-light)', fontSize: 13, textAlign: 'center', padding: 24 }}>Sin datos disponibles</p>
    }

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Prioridad', 'Total sesiones', 'Resueltas', 'Tasa %'].map(h => (
                    <th key={h} style={{
                        textAlign: h === 'Prioridad' ? 'left' : 'right',
                        padding: '6px 10px', fontSize: 11, fontWeight: 700,
                        color: 'var(--text-light)', letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>{h}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, i) => {
                const c = getPrioridadColor(row.prioridad)
                return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 10px' }}>
                                <span style={{
                                    display: 'inline-block', padding: '2px 10px', borderRadius: 999,
                                    fontSize: 11, fontWeight: 700, background: c.bg, color: c.text, border: `1px solid ${c.border}`,
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
                        <td style={{
                            padding: '10px', textAlign: 'right', fontWeight: 700,
                            color: row.tasa_resolucion >= 75 ? '#10B981' : row.tasa_resolucion >= 50 ? '#EAB308' : '#EF4444',
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
    const { topProblemas, porCategoria, porPrioridad, topDispositivos } = useFallosData(anio)

    const totalSesiones = topProblemas?.reduce((acc, p) => acc + Number(p.total_sesiones), 0) ?? 0
    const topProblema = topProblemas?.[0]

    const tasaGlobal = porPrioridad?.length
        ? Math.round(
            porPrioridad.reduce((acc, p) => acc + Number(p.tasa_resolucion) * Number(p.total_sesiones), 0)
            / porPrioridad.reduce((acc, p) => acc + Number(p.total_sesiones), 0)
        )
        : null

    const criticaRow = porPrioridad?.find(p => normalizarTexto(p.prioridad) === 'critica')

    const dispositivosConColor = (topDispositivos ?? []).map(d => ({
        ...d,
        color: colorDispositivoPorFallos(d.pct_fallos ?? 0),
    }))

    const problemasConColor = (topProblemas ?? []).map(p => {
        const c = getPrioridadColor(p.prioridad);
        return { ...p, color: c.text }
    });

    const colorResolucion = tasaGlobal == null
        ? 'blue' : tasaGlobal >= 75 ? 'green' : 'red'

    const pctProblema = totalSesiones > 0 && topProblema
        ? Math.round((Number(topProblema.total_sesiones) / totalSesiones) * 100)
        : 0;

    return (
        <main style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Título de página ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand)', margin: 0 }}>
                    Análisis de Fallos
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0 }}>
                    Problemas más frecuentes · Dispositivos con mayor tasa de fallo · Año {anio}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>

                <KPICard
                    icono={Activity}
                    KPINombre="Sesiones con fallo"
                    kpiLabel="Sesiones que terminaron sin resolverse"
                    metricaKPI={totalSesiones > 0 ? totalSesiones.toLocaleString() : '—'}
                    textoKPI={topProblema ? `Distribuidas en ${topProblemas.length} tipos de problema distintos` : 'Sin datos para el período'}
                    color="blue"
                    tendencia="Volumen anual"
                />

                <KPICard
                    icono={AlertOctagon}
                    KPINombre="Problema Top"
                    kpiLabel="Problema más frecuente"
                    metricaKPI={topProblema ? topProblema.problema : '—'}
                    esTextoLargo={true} /* ¡Esto adapta la tipografía! */
                    textoKPI={topProblema ? `${topProblema.total_sesiones} sesiones generadas este año` : 'Sin datos'}
                    color="violet"
                    tendencia={topProblema ? `Prioridad ${topProblema.prioridad}` : undefined}
                />

                <KPICard
                    icono={PieChartIcon}
                    KPINombre="Impacto del Problema"
                    kpiLabel="Peso sobre el total de fallos"
                    metricaKPI={topProblema ? `${pctProblema}%` : '—'}
                    textoKPI={topProblema ? `${topProblema.total_sesiones} de ${totalSesiones} sesiones totales` : 'Sin datos'}
                    color="amber"
                    tendencia="Concentración"
                />

                <KPICard
                    icono={CheckCircle2}
                    KPINombre="Tasa de resolución"
                    kpiLabel="Ponderada por volumen de sesiones"
                    metricaKPI={tasaGlobal != null ? `${tasaGlobal}%` : '—'}
                    textoKPI={criticaRow ? `Críticos: ${criticaRow.tasa_resolucion}% ${criticaRow.tasa_resolucion >= 75 ? '✓' : '⚠'} · Meta global: 75%` : 'Sin datos'}
                    color={colorResolucion}
                    tendencia={tasaGlobal != null && tasaGlobal >= 75 ? '✓ Meta alcanzada' : '⚠ Por debajo del objetivo'}
                />
            </div>

            {/* ── Fila 2: Top 10 Problemas (2/3) + Categorías (1/3) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <Card
                    titulo="Top 10 Problemas más frecuentes"
                    subtitulo="Número de sesiones generadas por cada problema · color = prioridad"
                >
                    <div style={{ height: 320, width: '100%' }}>
                        <GraficoBarrasGen
                            data={problemasConColor}
                            labelKey="problema"
                            valueKey="total_sesiones"
                            colorKey="color"
                            suffix=" ses."
                        />
                    </div>
                </Card>

                <Card
                    titulo="Distribución por Categoría"
                    subtitulo="% de sesiones según tipo de problema"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                        <GraficoPie data={porCategoria} />
                    </div>
                </Card>
            </div>

            {/* ── Fila 3: Prioridad (1/2) + Dispositivos (1/2) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card
                    titulo="Resolución por prioridad"
                    subtitulo="¿Se resuelven más los críticos?"
                >
                    <TablaPrioridad data={porPrioridad} />
                </Card>

                <Card
                    titulo="Fallos por Dispositivo"
                    subtitulo="Columna = nº de fallos · Color = gravedad"
                >
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