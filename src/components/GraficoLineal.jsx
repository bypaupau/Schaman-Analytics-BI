import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Datos mock — cuando el ETL esté listo, estos vendrán de Supabase como prop "data"
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

export function GraficoLineal({ data = dataMock }) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                {/* Dos ejes Y: FCR en % a la izquierda, TMO en segundos a la derecha */}
                <YAxis yAxisId="fcr" domain={[75, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="tmo" orientation="right" domain={[220, 260]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ color: '#64748b', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                {/* Verde para FCR (resolución = buen resultado), azul para TMO (tiempo) */}
                <Line yAxisId="fcr" type="monotone" dataKey="fcr" name="FCR (%)" stroke="#22c55e" dot={false} strokeWidth={2.5} />
                <Line yAxisId="tmo" type="monotone" dataKey="tmo" name="TMO (s)" stroke="#2563eb" dot={false} strokeWidth={2.5} />
            </LineChart>
        </ResponsiveContainer>
    )
}