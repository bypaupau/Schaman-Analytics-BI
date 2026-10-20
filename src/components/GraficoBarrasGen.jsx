// ══════════════════════════════════════════════════════════════════════════════
// GraficoBarrasGen.jsx — Gráfico de barras GENÉRICO (horizontal o vertical)
//
// Por qué existe este componente además de GraficoBarras.jsx:
//   GraficoBarras.jsx está hardcodeado para la Tasa de Éxito (usa dataKey="exito"
//   y dataKey="zona"). Este componente acepta cualquier dataKey como prop, así
//   podemos reutilizarlo para Top Problemas, Top Dispositivos, etc.
//
// Props:
//   data        → array de objetos con los datos
//   labelKey    → nombre de la propiedad que va como etiqueta de cada barra
//   valueKey    → nombre de la propiedad numérica (longitud/altura de la barra)
//   colorKey    → nombre de la propiedad con el color hex (opcional, default azul)
//   maxValue    → límite del eje numérico (si no se pasa, Recharts lo calcula)
//   suffix      → texto que se pone al final del valor (ej: '%', ' ses.')
//   orientation → 'horizontal' (default) | 'vertical'
//                 horizontal → barras que crecen hacia la derecha (bueno para listas largas)
//                 vertical   → columnas que crecen hacia arriba   (bueno para pocas categorías)
// ══════════════════════════════════════════════════════════════════════════════

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Cell, ResponsiveContainer, LabelList
} from 'recharts'
import { ChartTooltip } from './ChartTooltip.jsx'
import { EstadoVacio } from './Card.jsx'
import {
    SERIES, STATUS, INK, AXIS_TICK, AXIS_TICK_LABEL, GRID_PROPS, CURSOR_BAR,
    anchoEtiquetas, formatoNumero,
} from '../lib/chartTheme'

const ESTILO_ETIQUETA = { fontSize: 13, fontWeight: 700, fill: INK.text, fontFamily: 'Figtree, sans-serif' }

// Filas del tooltip: valor principal + datos extra si el objeto los trae
function filasTooltip(payload, suffix) {
    const d = payload[0]
    const filas = [{ color: d.payload.fill ?? d.color, nombre: 'Sesiones', valor: `${formatoNumero.format(d.value)}${suffix}` }]
    // Si el objeto tiene tasa_resolucion, la mostramos también
    if (d.payload.tasa_resolucion != null) {
        filas.push({ nombre: 'Resuelta', valor: `${d.payload.tasa_resolucion}%` })
    }
    // Si el objeto tiene pct_fallos, la mostramos — % de sesiones fallidas
    if (d.payload.pct_fallos != null) {
        filas.push({ color: STATUS.critical.fill, nombre: '% sesiones con fallo', valor: `${d.payload.pct_fallos}%` })
    }
    return filas
}

export function GraficoBarrasGen({
    data        = [],
    labelKey    = 'label',
    valueKey    = 'value',
    colorKey    = 'color',
    maxValue,
    suffix      = '',
    orientation = 'horizontal',   // 'horizontal' | 'vertical'
}) {
    // Sin datos → mensaje de estado vacío en lugar de una gráfica en blanco
    if (!data || data.length === 0) return <EstadoVacio alto={200}>Sin datos disponibles</EstadoVacio>

    // El color de cada barra puede venir del dato (colorKey) o usar el teal de marca
    const getColor = (entry) => entry[colorKey] ?? SERIES[0]
    const tooltip = <ChartTooltip titulo={p => p[0].payload[labelKey]} filas={p => filasTooltip(p, suffix)} />

    // ── MODO HORIZONTAL (layout="vertical" en Recharts) ──────────────────────
    // Confuso pero así funciona Recharts: "vertical" significa que las barras
    // crecen en el eje horizontal (de izquierda a derecha). Es la vista clásica
    // de "ranking" donde los nombres van en el eje Y.
    if (orientation === 'horizontal') {
        const altura = Math.max(220, data.length * 40)
        return (
            <ResponsiveContainer width="100%" height={altura}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 4, right: 72, bottom: 4, left: 0 }}
                    barCategoryGap={8}
                    maxBarSize={22}
                >
                    <CartesianGrid {...GRID_PROPS} horizontal={false} />
                    <XAxis
                        type="number"
                        domain={maxValue ? [0, maxValue] : [0, 'auto']}
                        tick={AXIS_TICK}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => formatoNumero.format(v)}
                    />
                    <YAxis
                        type="category"
                        dataKey={labelKey}
                        tick={AXIS_TICK_LABEL}
                        axisLine={false}
                        tickLine={false}
                        width={anchoEtiquetas(data, labelKey, 200)}
                    />
                    <Tooltip content={tooltip} cursor={CURSOR_BAR} />
                    <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={getColor(entry)} />
                        ))}
                        <LabelList
                            dataKey={valueKey}
                            position="right"
                            formatter={v => `${formatoNumero.format(v)}${suffix}`}
                            style={ESTILO_ETIQUETA}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        )
    }

    // ── MODO VERTICAL (columnas que crecen hacia arriba) ─────────────────────
    // Recharts llama a esto "layout horizontal" (confuso). Ideal para pocas
    // categorías (≤10) donde los nombres son lo suficientemente cortos para
    // mostrarse en el eje X. Las etiquetas se inclinan 35° para que no se
    // solapen aunque los nombres sean algo largos.
    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart
                data={data}
                // Sin layout="vertical" → Recharts usa columnas (el default)
                margin={{ top: 28, right: 8, bottom: 8, left: 0 }}
                barCategoryGap="22%"
                maxBarSize={40}
            >
                <CartesianGrid {...GRID_PROPS} vertical={false} />
                <XAxis
                    type="category"
                    dataKey={labelKey}
                    axisLine={false}
                    tickLine={false}
                    // Inclinamos las etiquetas para que quepan sin solaparse
                    tick={AXIS_TICK_LABEL}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    // height extra para dejar espacio a las etiquetas inclinadas
                    height={84}
                />
                <YAxis
                    type="number"
                    domain={maxValue ? [0, maxValue] : [0, 'auto']}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tickFormatter={v => formatoNumero.format(v)}
                />
                <Tooltip content={tooltip} cursor={CURSOR_BAR} />
                <Bar dataKey={valueKey} radius={[4, 4, 0, 0]}>
                    {data.map((entry, i) => (
                        <Cell key={i} fill={getColor(entry)} />
                    ))}
                    {/* Valor encima de cada columna */}
                    <LabelList
                        dataKey={valueKey}
                        position="top"
                        formatter={v => formatoNumero.format(v)}
                        style={ESTILO_ETIQUETA}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
