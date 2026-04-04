// GraficoBarras.jsx ─ Barras HORIZONTALES: Tasa de Éxito por Zona
// Barras horizontales caben perfecto en 1/3 de ancho, son fáciles de leer
// y muestran un KPI real (KPI #3 del proyecto)

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Cell, ResponsiveContainer, LabelList
} from 'recharts'

const dataMock = [
    { zona: 'Norte',  exito: 94, color: '#3B82F6' },
    { zona: 'Centro', exito: 90, color: '#0EA5E9' },
    { zona: 'Sur',    exito: 85, color: '#8B5CF6' },
]

// Tooltip limpio coherente con el dashboard
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
            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{d.payload.zona}</p>
            <p style={{ color: d.fill, fontWeight: 600 }}>Tasa de Éxito: {d.value}%</p>
        </div>
    )
}

export function GraficoBarras({ data = dataMock }) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 40, bottom: 4, left: 0 }}
                barSize={26}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF4" horizontal={false} />
                <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                />
                <YAxis
                    type="category"
                    dataKey="zona"
                    tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15,52,96,0.04)' }} />
                <Bar dataKey="exito" radius={[0, 6, 6, 0]}>
                    {data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                    ))}
                    {/* Etiqueta con el % dentro/fuera de la barra */}
                    <LabelList
                        dataKey="exito"
                        position="right"
                        formatter={v => `${v}%`}
                        style={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
