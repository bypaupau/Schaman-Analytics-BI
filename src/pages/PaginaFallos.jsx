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
import { Card }             from '../components/Card'
import { PageHeader }       from '../components/PageHeader'
import { MenuFiltros }      from '../components/MenuFiltros.jsx'
import { STATUS, normalizar, formatoNumero } from '../lib/chartTheme'
import { AlertOctagon, Activity, CheckCircle2, PieChartIcon } from 'lucide-react'

// ── Prioridad → color de ESTADO (insensible a mayúsculas y tildes) ───────────
// Es una escala ordenada: crítica > alta > media > baja
const PRIORIDADES = [
    { clave: 'critica', label: 'Crítica', ...STATUS.critical },
    { clave: 'alta',    label: 'Alta',    ...STATUS.serious  },
    { clave: 'media',   label: 'Media',   ...STATUS.warning  },
    { clave: 'baja',    label: 'Baja',    ...STATUS.neutral  },
]

function getPrioridadColor(prioridad) {
    return PRIORIDADES.find(p => p.clave === normalizar(prioridad)) ?? PRIORIDADES[3]
}

// ── Gravedad del dispositivo según su tasa de fallos ─────────────────────────
const GRAVEDAD = [
    { min: 50, label: '≥ 50% fallos',  ...STATUS.critical },
    { min: 30, label: '30–49%',        ...STATUS.serious  },
    { min: 15, label: '15–29%',        ...STATUS.warning  },
    { min: 0,  label: '< 15%',         ...STATUS.good     },
]

function colorDispositivoPorFallos(pct_fallos) {
    return GRAVEDAD.find(g => pct_fallos >= g.min).fill
}

// Leyenda compacta para explicar qué significa cada color
function LeyendaColores({ items, titulo }) {
    return (
        <div className="legend" aria-label={titulo} style={{ marginBottom: 12 }}>
            {items.map(it => (
                <span key={it.label} className="legend-item">
                    <span className="dot" style={{ background: it.fill, borderRadius: 3 }} />
                    {it.label}
                </span>
            ))}
        </div>
    )
}

// ── Tabla de resolución por prioridad ────────────────────────────────────────
function TablaPrioridad({ data }) {
    if (!data || data.length === 0) {
        return <p className="empty-state" style={{ padding: 24 }}>Sin datos disponibles</p>
    }

    return (
        <table className="data-table" style={{ fontSize: 15 }}>
            <thead>
            <tr>
                {['Prioridad', 'Total sesiones', 'Resueltas', 'Tasa de resolución'].map(h => (
                    <th key={h} scope="col" style={{ textAlign: h === 'Prioridad' ? 'left' : 'right', padding: '12px 16px' }}>{h}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, i) => {
                const c = getPrioridadColor(row.prioridad)
                const tasa = Number(row.tasa_resolucion)
                const t = tasa >= 75 ? STATUS.good : tasa >= 50 ? STATUS.warning : STATUS.critical
                return (
                    <tr key={i}>
                        <td style={{ padding: '14px 16px' }}>
                            <span className="chip" style={{ background: c.soft, color: c.ink }}>
                                <span className="dot" style={{ background: c.fill }} />
                                {row.prioridad}
                            </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text)' }}>
                            {formatoNumero.format(row.total_sesiones)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {formatoNumero.format(row.resueltas)}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {/* Mini barra + valor: el color refuerza el número */}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                                <span aria-hidden="true" style={{ width: 72, height: 6, borderRadius: 999, background: 'var(--grid)', overflow: 'hidden' }}>
                                    <span style={{ display: 'block', height: '100%', width: `${Math.min(tasa, 100)}%`, background: t.fill, borderRadius: 999 }} />
                                </span>
                                <strong style={{ color: t.ink, minWidth: 44 }}>{tasa}%</strong>
                            </span>
                        </td>
                    </tr>
                )
            })}
            </tbody>
        </table>
    )
}

// ── Componente principal de la página ────────────────────────────────────────
export function PaginaFallos({ filtros, valoresFiltro, onCambioFiltro }) {
    const { topProblemas, porCategoria, porPrioridad, topDispositivos, error } = useFallosData(valoresFiltro)
    const periodo = valoresFiltro.mes !== 'Todos' ? `${valoresFiltro.mes} ${valoresFiltro.anio}` : `Año ${valoresFiltro.anio}`

    const totalSesiones = topProblemas?.reduce((acc, p) => acc + Number(p.total_sesiones), 0) ?? 0
    const topProblema = topProblemas?.[0]

    const tasaGlobal = porPrioridad?.length
        ? Math.round(
            porPrioridad.reduce((acc, p) => acc + Number(p.tasa_resolucion) * Number(p.total_sesiones), 0)
            / porPrioridad.reduce((acc, p) => acc + Number(p.total_sesiones), 0)
        )
        : null

    const criticaRow = porPrioridad?.find(p => normalizar(p.prioridad) === 'critica')

    const dispositivosConColor = (topDispositivos ?? []).map(d => ({
        ...d,
        color: colorDispositivoPorFallos(d.pct_fallos ?? 0),
    }))

    const problemasConColor = (topProblemas ?? []).map(p => ({
        ...p, color: getPrioridadColor(p.prioridad).fill,
    }))

    const colorResolucion = tasaGlobal == null
        ? 'brand' : tasaGlobal >= 75 ? 'good' : 'critical'

    const pctProblema = totalSesiones > 0 && topProblema
        ? Math.round((Number(topProblema.total_sesiones) / totalSesiones) * 100)
        : 0;

    return (
        <main className="page">

            {/* ── Título de página ── */}
            <PageHeader
                titulo="Análisis de fallos"
                subtitulo={`Problemas y dispositivos · ${periodo}`}
            />

            <MenuFiltros filtros={filtros} onCambio={onCambioFiltro} />

            {error && (
                <div role="alert" style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: 'var(--warning-soft, #fff4d6)', color: 'var(--text)', border: '1px solid var(--warning, #f0b429)' }}>
                    <strong>No se pudieron cargar los análisis de fallos.</strong>{' '}
                    <span>{error}</span>{' '}
                    <span>Revisa que las cuatro funciones RPC de fallos en Supabase tengan los parámetros de filtro actualizados.</span>
                </div>
            )}

            <div className="grid-kpis">

                <KPICard
                    icono={Activity}
                    KPINombre="Sesiones con fallo"
                    kpiLabel="Terminaron sin resolverse"
                    metricaKPI={totalSesiones > 0 ? formatoNumero.format(totalSesiones) : '—'}
                    textoKPI={topProblema ? `Distribuidas en ${topProblemas.length} tipos de problema distintos` : 'Sin datos para el período'}
                    tendencia="Volumen del período"
                />

                <KPICard
                    icono={AlertOctagon}
                    KPINombre="Problema principal"
                    kpiLabel="El más frecuente del período"
                    metricaKPI={topProblema ? topProblema.problema : '—'}
                    esTextoLargo={true} /* ¡Esto adapta la tipografía! */
                    textoKPI={topProblema ? `${formatoNumero.format(topProblema.total_sesiones)} sesiones en este período` : 'Sin datos'}
                    tendencia={topProblema ? `Prioridad ${topProblema.prioridad}` : undefined}
                />

                <KPICard
                    icono={PieChartIcon}
                    KPINombre="Impacto del problema"
                    kpiLabel="Peso sobre el total de fallos"
                    metricaKPI={topProblema ? `${pctProblema}%` : '—'}
                    textoKPI={topProblema ? `${formatoNumero.format(topProblema.total_sesiones)} de ${formatoNumero.format(totalSesiones)} sesiones totales` : 'Sin datos'}
                    tendencia="Concentración"
                />

                <KPICard
                    icono={CheckCircle2}
                    KPINombre="Tasa de resolución"
                    kpiLabel="Ponderada por volumen"
                    metricaKPI={tasaGlobal != null ? `${tasaGlobal}%` : '—'}
                    textoKPI={criticaRow ? `Críticos: ${criticaRow.tasa_resolucion}% · Meta global: 75%` : 'Sin datos'}
                    color={colorResolucion}
                    tendencia={tasaGlobal == null ? undefined : tasaGlobal >= 75 ? 'Meta alcanzada' : 'Por debajo del objetivo'}
                />
            </div>

            {/* ── Fila 2: Top 10 Problemas (2/3) + Categorías (1/3) ── */}
            <div className="grid-2-1">
                <Card
                    titulo="Top 10 problemas más frecuentes"
                    subtitulo="Sesiones generadas por cada problema, coloreadas por prioridad"
                >
                    <LeyendaColores titulo="Prioridad" items={PRIORIDADES} />
                    <GraficoBarrasGen
                        data={problemasConColor}
                        labelKey="problema"
                        valueKey="total_sesiones"
                        colorKey="color"
                        suffix=" ses."
                    />
                </Card>

                <Card
                    titulo="Distribución por categoría"
                    subtitulo="% de sesiones según tipo de problema"
                >
                    <GraficoPie data={porCategoria} />
                </Card>
            </div>

            {/* ── Fila 3: Prioridad (1/2) + Dispositivos (1/2) ── */}
            <div className="grid-2">
                <Card
                    titulo="Resolución por prioridad"
                    subtitulo="¿Se resuelven más los problemas críticos? Meta: 75%"
                    bodyStyle={{ padding: '12px 0 8px' }}
                >
                    <div style={{ overflowX: 'auto' }}>
                        <TablaPrioridad data={porPrioridad} />
                    </div>
                </Card>

                <Card
                    titulo="Fallos por dispositivo"
                    subtitulo="Sesiones con fallo por modelo, coloreadas por tasa de fallo"
                >
                    <LeyendaColores titulo="Tasa de fallo" items={GRAVEDAD} />
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
