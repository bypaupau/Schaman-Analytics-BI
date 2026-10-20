// GraficoPie.jsx ─ Donut de distribución (por canal o por categoría)
//
// Reglas de color (ver lib/chartTheme.js):
//   - El color sigue a la ENTIDAD: "Chat" es siempre del mismo color, aunque
//     un filtro cambie su posición en el ranking.
//   - Máximo 8 colores: si hay más categorías, las menores se agrupan en "Otros".
//   - La leyenda siempre muestra nombre + valor, así el color nunca va solo.
//
// Props:
//   data     → [{ name, value }]  (value en %)
//   colorear → 'canal' (mapa fijo de canales) | 'nombre' (orden alfabético estable)

import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { ChartTooltip } from './ChartTooltip.jsx'
import { EstadoVacio } from './Card.jsx'
import { SERIES, COLOR_OTROS, colorCanal, colorPorNombre } from '../lib/chartTheme'

const MAX_PORCIONES = SERIES.length

// Ordena de mayor a menor y agrupa la cola en "Otros"
function agrupar(data) {
    const ordenada = [...data].sort((a, b) => Number(b.value) - Number(a.value))
    if (ordenada.length <= MAX_PORCIONES) return ordenada
    const top   = ordenada.slice(0, MAX_PORCIONES - 1)
    const resto = ordenada.slice(MAX_PORCIONES - 1)
    const otros = resto.reduce((acc, d) => acc + Number(d.value), 0)
    return [...top, { name: 'Otros', value: Math.round(otros * 10) / 10, esOtros: true }]
}

// Leyenda en lista: punto de color · nombre · valor
function Leyenda({ data }) {
    return (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: '1 1 140px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.map(d => (
                <li key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, minWidth: 0 }}>
                    <span className="dot" style={{ width: 10, height: 10, borderRadius: 3, background: d.fill }} />
                    <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }} title={d.name}>
                        {d.name}
                    </span>
                    <span className="tabular" style={{ fontWeight: 700, color: 'var(--text)' }}>{d.value}%</span>
                </li>
            ))}
        </ul>
    )
}

export function GraficoPie({ data, colorear = 'nombre' }) {
    if (!data) return <EstadoVacio alto={220}>Cargando gráfico…</EstadoVacio>
    if (Array.isArray(data) && data.length === 0) return <EstadoVacio alto={220} />

    const colorDe = colorear === 'canal'
        ? colorCanal
        : colorPorNombre(data.map(d => d.name))

    // Asignamos fill al dato para que el tooltip y la leyenda lo puedan leer
    const enriched = agrupar(data).map((d, i) => ({ ...d, fill: d.esOtros ? COLOR_OTROS : colorDe(d.name, i) }))
    const principal = enriched[0]

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 20, flex: 1 }}>
            <div style={{ position: 'relative', width: 176, height: 176, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={enriched}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={86}
                            innerRadius={60}
                            cornerRadius={4}
                            // 2px del color de la superficie entre porciones
                            stroke="#FFFFFF"
                            strokeWidth={2}
                        >
                            {enriched.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip titulo={() => null} formato={v => `${v}%`} />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Centro del donut: la porción principal */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', textAlign: 'center', padding: '0 40px' }}>
                    <span className="tabular" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                        {principal.value}%
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4, lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {principal.name}
                    </span>
                </div>
            </div>
            <Leyenda data={enriched} />
        </div>
    )
}
