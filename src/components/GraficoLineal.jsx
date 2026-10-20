// GraficoLineal.jsx ─ Evolución mensual FCR & TMO
//
// FCR (%) y TMO (segundos) tienen escalas distintas. En vez de un gráfico con
// DOS ejes Y (que inventa correlaciones según cómo se alineen las escalas),
// usamos dos mini-gráficos apilados ("small multiples") que comparten el eje X.
// `syncId` sincroniza el cursor: al pasar el mouse por un mes, ambos lo marcan.

import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ChartTooltip } from './ChartTooltip.jsx'
import { EstadoVacio } from './Card.jsx'
import { SERIES, AXIS_TICK, GRID_PROPS, CURSOR_LINE } from '../lib/chartTheme'

const dataMock = [
    { mes: "Nov '22", fcr: 88, tmo: 240 },
    { mes: "Dic '22", fcr: 82, tmo: 230 },
    { mes: "Ene '23", fcr: 87, tmo: 235 },
    { mes: "Feb '23", fcr: 97, tmo: 240 },
    { mes: "Mar '23", fcr: 88, tmo: 240 },
    { mes: "Abr '23", fcr: 82, tmo: 245 },
    { mes: "May '23", fcr: 87, tmo: 245 },
    { mes: "Jun '23", fcr: 97, tmo: 245 },
    { mes: "Jul '23", fcr: 92, tmo: 245 },
    { mes: "Ago '23", fcr: 92, tmo: 245 },
    { mes: "Sep '23", fcr: 92, tmo: 245 },
    { mes: "Oct '23", fcr: 92, tmo: 245 },
]

const SERIES_LINEAL = [
    { key: 'fcr', nombre: 'FCR', unidad: '%', color: SERIES[0], descripcion: 'Resolución al primer contacto' },
    { key: 'tmo', nombre: 'TMO', unidad: 's', color: SERIES[2], descripcion: 'Tiempo medio de operación' },
]

function MiniSerie({ data, serie, mostrarEjeX }) {
    const { key, nombre, unidad, color, descripcion } = serie
    const ultimo = data[data.length - 1]?.[key]
    const gradId = `grad-${key}`

    return (
        <div>
            {/* Encabezado con etiqueta directa: nombre + último valor */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                    <span className="dot" style={{ background: color }} />
                    <strong style={{ color: 'var(--text)' }}>{nombre}</strong>
                    <span style={{ color: 'var(--text-light)' }}>{descripcion}</span>
                </span>
                {ultimo != null && (
                    <span className="tabular" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                        {ultimo}{unidad}
                    </span>
                )}
            </div>

            <ResponsiveContainer width="100%" height={mostrarEjeX ? 132 : 108}>
                <AreaChart data={data} syncId="fcr-tmo" margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={color} stopOpacity={0.22} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid {...GRID_PROPS} vertical={false} />
                    <XAxis
                        dataKey="mes"
                        hide={!mostrarEjeX}
                        tick={AXIS_TICK}
                        axisLine={false} tickLine={false}
                        interval="preserveStartEnd" minTickGap={18}
                    />
                    <YAxis
                        domain={['dataMin - 3', 'dataMax + 3']}
                        allowDecimals={false}
                        tickCount={3}
                        tick={AXIS_TICK}
                        tickFormatter={v => `${Math.round(v)}${unidad}`}
                        axisLine={false} tickLine={false}
                        width={44}
                    />
                    <Tooltip
                        cursor={CURSOR_LINE}
                        content={<ChartTooltip formato={v => `${v}${unidad}`} />}
                    />
                    <Area
                        type="monotone" dataKey={key} name={nombre}
                        stroke={color} strokeWidth={2} fill={`url(#${gradId})`}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#FFFFFF', fill: color }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

// Sin valor por defecto: `undefined` significa "cargando" (ver useDashboardData)
export function GraficoLineal({ data }) {
    if (!data) return <EstadoVacio alto={280}>Cargando gráfico…</EstadoVacio>

    // Si le enviamos un arreglo vacío
    if (Array.isArray(data) && data.length === 0) return <EstadoVacio alto={280} />

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SERIES_LINEAL.map((serie, i) => (
                <MiniSerie key={serie.key} data={data} serie={serie} mostrarEjeX={i === SERIES_LINEAL.length - 1} />
            ))}
        </div>
    )
}
