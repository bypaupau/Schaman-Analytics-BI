// ChartTooltip.jsx ─ Tooltip único para todos los gráficos de Recharts
//
// Recharts le pasa { active, payload, label } al componente de `content`.
// Nosotros recibimos además:
//   titulo  → (payload) => string   título del tooltip (por defecto, el `label` del eje)
//   filas   → (payload) => [{ color, nombre, valor }]   filas a mostrar
//   formato → (valor) => string   formatea el valor de cada serie (si no pasamos `filas`)

export function ChartTooltip({ active, payload, label, titulo, filas, formato = v => v }) {
    if (!active || !payload?.length) return null

    const encabezado = titulo ? titulo(payload) : label
    const items = filas
        ? filas(payload)
        : payload.map(p => ({ color: p.color ?? p.payload?.fill, nombre: p.name, valor: formato(p.value) }))

    return (
        <div style={{
            background: '#0F1F1D',
            color: '#FFFFFF',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 13,
            lineHeight: 1.45,
            boxShadow: '0 12px 28px -8px rgba(7,63,59,0.45)',
            maxWidth: 260,
            fontVariantNumeric: 'tabular-nums',
        }}>
            {encabezado != null && (
                <p style={{ fontWeight: 700, marginBottom: 6, wordBreak: 'break-word' }}>{encabezado}</p>
            )}
            {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i ? 3 : 0 }}>
                    {it.color && <span className="dot" style={{ background: it.color, boxShadow: '0 0 0 2px rgba(255,255,255,0.15)' }} />}
                    <span style={{ color: 'rgba(255,255,255,0.72)' }}>{it.nombre}</span>
                    <span style={{ fontWeight: 700, marginLeft: 'auto', paddingLeft: 12 }}>{it.valor}</span>
                </div>
            ))}
        </div>
    )
}
