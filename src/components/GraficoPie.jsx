// GraficoPie.jsx ─ Donut de distribución por canal
// Colores = misma paleta que el resto del dashboard (chart-1 a chart-4)

import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts'

const dataMock = [
    { name: 'Llamadas', value: 40 },
    { name: 'Chat',     value: 30 },
    { name: 'Email',    value: 20 },
    { name: 'App',      value: 10 },
]

// Paleta coherente con GraficoBarras y GraficoLineal
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']

// Tooltip limpio
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
        <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 12,
            boxShadow: 'var(--shadow)',
        }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: d.payload.fill, marginRight: 6 }} />
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.name}:</span>
            <span style={{ marginLeft: 4, color: 'var(--text-muted)' }}>{d.value}%</span>
        </div>
    )
}

// Leyenda personalizada debajo del gráfico
function Leyenda({ data, colors }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'center', marginTop: 8 }}>
            {data.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i % colors.length], display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{d.value}%</span>
                </div>
            ))}
        </div>
    )
}

export function GraficoPie({ data = dataMock }) {
    // Asignamos fill al dato para que el tooltip lo pueda leer
    const enriched = data.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }))

    return (
        <div>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={enriched}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={48}
                        paddingAngle={3}
                        strokeWidth={0}
                    >
                        {enriched.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <Leyenda data={data} colors={COLORS} />
        </div>
    )
}
