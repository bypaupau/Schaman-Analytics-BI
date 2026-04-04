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
            maxWidth: 240,
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
            {/* Si el objeto tiene pct_fallos, la mostramos — % de sesiones fallidas */}
            {d.payload.pct_fallos != null && (
                <p style={{ color: '#EF4444', marginTop: 2 }}>
                    % sesiones con fallo: {d.payload.pct_fallos}%
                </p>
            )}
        </div>
    )
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

    // El color de cada barra puede venir del dato (colorKey) o usar azul por defecto
    const getColor = (entry) => entry[colorKey] ?? '#3B82F6'

    // ── MODO HORIZONTAL (layout="vertical" en Recharts) ──────────────────────
    // Confuso pero así funciona Recharts: "vertical" significa que las barras
    // crecen en el eje horizontal (de izquierda a derecha). Es la vista clásica
    // de "ranking" donde los nombres van en el eje Y.
    if (orientation === 'horizontal') {
        const altura = Math.max(200, data.length * 36)
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
                        width={160}
                    />
                    <Tooltip
                        content={<CustomTooltip labelKey={labelKey} suffix={suffix} />}
                        cursor={{ fill: 'rgba(15,52,96,0.04)' }}
                    />
                    <Bar dataKey={valueKey} radius={[0, 6, 6, 0]}>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={getColor(entry)} />
                        ))}
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

    // ── MODO VERTICAL (columnas que crecen hacia arriba) ─────────────────────
    // Recharts llama a esto "layout horizontal" (confuso). Ideal para pocas
    // categorías (≤10) donde los nombres son lo suficientemente cortos para
    // mostrarse en el eje X. Las etiquetas se inclinan 35° para que no se
    // solapen aunque los nombres sean algo largos.
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                data={data}
                // Sin layout="vertical" → Recharts usa columnas (el default)
                margin={{ top: 36, right: 16, bottom: 70, left: 0 }}
                barSize={28}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4EAF4" vertical={false} />
                <XAxis
                    type="category"
                    dataKey={labelKey}
                    axisLine={false}
                    tickLine={false}
                    // Inclinamos las etiquetas para que quepan sin solaparse
                    tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    // height extra para dejar espacio a las etiquetas inclinadas
                    height={70}
                />
                <YAxis
                    type="number"
                    domain={maxValue ? [0, maxValue] : ['auto', 'auto']}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v.toLocaleString()}${suffix}`}
                />
                <Tooltip
                    content={<CustomTooltip labelKey={labelKey} suffix={suffix} />}
                    cursor={{ fill: 'rgba(15,52,96,0.04)' }}
                />
                <Bar dataKey={valueKey} radius={[6, 6, 0, 0]}>
                    {data.map((entry, i) => (
                        <Cell key={i} fill={getColor(entry)} />
                    ))}
                    {/* Valor encima de cada columna */}
                    <LabelList
                        dataKey={valueKey}
                        position="top"
                        formatter={v => `${v.toLocaleString()}${suffix}`}
                        style={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
