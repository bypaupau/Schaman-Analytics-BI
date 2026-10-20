// GraficoBarras.jsx ─ Barras HORIZONTALES: Tasa de Éxito por Zona
// Barras horizontales caben perfecto en 1/3 de ancho, son fáciles de leer
// y muestran un KPI real (KPI #3 del proyecto).
//
// Todas las barras miden lo mismo (% de éxito) → un solo color (teal de marca).
// Colorear cada zona distinto agregaría ruido sin aportar información.

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, LabelList
} from 'recharts'
import { ChartTooltip } from './ChartTooltip.jsx'
import { EstadoVacio } from './Card.jsx'
import { SERIES, AXIS_TICK, AXIS_TICK_LABEL, GRID_PROPS, CURSOR_BAR, INK, anchoEtiquetas } from '../lib/chartTheme'

const COLOR_BARRA = SERIES[0]

// Sin valor por defecto: `undefined` significa "cargando" (ver useDashboardData)
export function GraficoBarras({ data }) {
    if (!data) return <EstadoVacio alto={220}>Cargando gráfico…</EstadoVacio>

    // Si llega array vacío (filtro sin resultados) → mensaje "sin datos"
    if (data.length === 0) return <EstadoVacio alto={220} />

    // Altura dinámica: mínimo 220px, 40px por zona para que no se apilen
    const altura = Math.max(220, data.length * 40)

    return (
        <ResponsiveContainer width="100%" height={altura}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 4, left: 0 }}
                barCategoryGap={8}
                maxBarSize={22}
            >
                <CartesianGrid {...GRID_PROPS} horizontal={false} />
                <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                />
                <YAxis
                    type="category"
                    dataKey="zona"
                    tick={AXIS_TICK_LABEL}
                    axisLine={false}
                    tickLine={false}
                    width={anchoEtiquetas(data, 'zona', 175)}
                />
                <Tooltip
                    cursor={CURSOR_BAR}
                    content={<ChartTooltip filas={p => [{ color: COLOR_BARRA, nombre: 'Tasa de éxito', valor: `${p[0].value}%` }]} />}
                />
                <Bar dataKey="exito" fill={COLOR_BARRA} radius={[0, 4, 4, 0]}>
                    {/* Etiqueta con el % al final de la barra */}
                    <LabelList
                        dataKey="exito"
                        position="right"
                        formatter={v => `${v}%`}
                        style={{ fontSize: 13, fontWeight: 700, fill: INK.text, fontFamily: 'Figtree, sans-serif' }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
