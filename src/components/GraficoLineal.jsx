// GraficoLineal.jsx ─ Evolución mensual FCR & TMO
// Verde (#10B981) para FCR (buen resultado), azul (#3B82F6) para TMO (tiempo).
// Colores de la misma paleta que el resto del dashboard.

import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

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

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 10, padding: '8px 12px', fontSize: 12,
            boxShadow: 'var(--shadow)',
        }}>
            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{label}</p>
            {payload.map(p => (
                <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{p.value}</span>
                </div>
            ))}
        </div>
    )
}

export function GraficoLineal({ data = dataMock }) {
    return (
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: -4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF4" vertical={false} />
                <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false} tickLine={false}
                    interval={2}
                />
                <YAxis
                    yAxisId="fcr" domain={[75, 100]}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false} tickLine={false}
                    width={28}
                />
                <YAxis
                    yAxisId="tmo" orientation="right" domain={[220, 260]}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false} tickLine={false}
                    width={28}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ fontSize: 11, color: '#94A3B8', paddingTop: 8 }}
                    iconType="circle" iconSize={8}
                />
                <Line
                    yAxisId="fcr" type="monotone" dataKey="fcr"
                    name="FCR (%)" stroke="#10B981"
                    dot={false} strokeWidth={2.5} strokeLinecap="round"
                />
                <Line
                    yAxisId="tmo" type="monotone" dataKey="tmo"
                    name="TMO (s)" stroke="#3B82F6"
                    dot={false} strokeWidth={2.5} strokeLinecap="round"
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
