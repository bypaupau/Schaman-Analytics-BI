// ══════════════════════════════════════════════════════════════════════════════
// GraficoBarrasGen.jsx — Gráfico de barras horizontales GENÉRICO
//
// Por qué existe este componente además de GraficoBarras.jsx:
//   GraficoBarras.jsx está hardcodeado para la Tasa de Éxito (usa dataKey="exito"
//   y dataKey="zona"). Este componente acepta cualquier dataKey como prop, así
//   podemos reutilizarlo para Top Problemas, Top Dispositivos, etc.
//
// Props:
//   data        → array de objetos con los datos
//   labelKey    → nombre de la propiedad que va en el eje Y (etiqueta de cada barra)
//   valueKey    → nombre de la propiedad numérica (longitud de la barra)
//   colorKey    → nombre de la propiedad con el color hex (opcional, default azul)
//   maxValue    → límite del eje X (si no se pasa, Recharts lo calcula automático)
//   suffix      → texto que se pone al final del valor en la etiqueta (ej: '%', ' ses.')
// ══════════════════════════════════════════════════════════════════════════════

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Cell, ResponsiveContainer, LabelList
} from 'recharts'

// Tooltip personalizado — mismo estilo visual que el resto del dashboard
const CustomTooltip = ({ active, payload, labelKey, suffix }) => {
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
            maxWidth: 220,
        }}>
            {/* Nombre del elemento (problema, modelo, etc.) */}
            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4, wordBreak: 'break-word' }}>
                {d.payload[labelKey]}
            </p>
            {/* Valor principal con su sufijo */}
            <p style={{ color: d.fill, fontWeight: 600 }}>
                {d.value.toLocaleString()}{suffix}
            </p>
            {/* Si el objeto tiene tasa_resolucion, la mostramos también */}
            {d.payload.tasa_resolucion != null && (
                <p style={{ color: 'var(--text-light)', marginTop: 2 }}>
                    Resuelta: {d.payload.tasa_resolucion}%
                </p>
            )}
            {/* Si el objeto tiene pct_fallos, la mostramos */}
            {d.payload.pct_fallos != null && (
                <p style={{ color: '#EF4444', marginTop: 2 }}>
                    Tasa de fallo: {d.payload.pct_fallos}%
                </p>
            )}
        </div>
    )
}

export function GraficoBarrasGen({
    data     = [],
    labelKey = 'label',
    valueKey = 'value',
    colorKey = 'color',
    maxValue,            // si no se pasa, Recharts calcula el máximo automáticamente
    suffix   = '',       // texto después del número en las etiquetas de las barras
}) {
    // Sin datos → mensaje de estado vacío en lugar de una gráfica en blanco
    if (!data || data.length === 0) {
        return (
            <div style={{
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-light)',
                fontSize: 13,
            }}>
                Sin datos disponibles
            </div>
        )
    }

    // Altura dinámica: el mínimo es 200px, pero crece con el número de barras
    // para que los nombres no se solapen ni se corten
    const altura = Math.max(200, data.length * 36)

    // El color de cada barra puede venir del dato (colorKey) o usar un azul por defecto
    const getColor = (entry) => entry[colorKey] ?? '#3B82F6'

    return (
        <ResponsiveContainer width="100%" height={altura}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 60, bottom: 4, left: 0 }}
                barSize={16}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF4" horizontal={false} />
                <XAxis
                    type="number"
                    domain={maxValue ? [0, maxValue] : ['auto', 'auto']}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v.toLocaleString()}${suffix}`}
                />
                <YAxis
                    type="category"
                    dataKey={labelKey}
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={160}   // más ancho que GraficoBarras para nombres largos de problemas
                />
                <Tooltip
                    content={<CustomTooltip labelKey={labelKey} suffix={suffix} />}
                    cursor={{ fill: 'rgba(15,52,96,0.04)' }}
                />
                <Bar dataKey={valueKey} radius={[0, 6, 6, 0]}>
                    {data.map((entry, i) => (
                        <Cell key={i} fill={getColor(entry)} />
                    ))}
                    {/* Etiqueta con el valor al final de cada barra */}
                    <LabelList
                        dataKey={valueKey}
                        position="right"
                        formatter={v => `${v.toLocaleString()}${suffix}`}
                        style={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
