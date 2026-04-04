// src/components/KPICard.jsx
export function KPICard({
                            KPINombre,
                            kpiLabel,
                            metricaKPI,
                            textoKPI,
                            color = 'blue',
                            tendencia,
                            positivo = true,
                            icono: Icono,
                            esTextoLargo = false, // ← ¡Nueva prop para domar textos largos!
                        }) {
    const PALETTE = {
        green:  { accent: '#10B981', bg: '#F0FDF4', text: '#065F46' },
        blue:   { accent: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF' },
        amber:  { accent: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
        teal:   { accent: '#0EA5E9', bg: '#F0F9FF', text: '#0C4A6E' },
        violet: { accent: '#8B5CF6', bg: '#F5F3FF', text: '#4C1D95' },
        red:    { accent: '#EF4444', bg: '#FEF2F2', text: '#991B1B' },
    }
    const c = PALETTE[color] ?? PALETTE.blue

    return (
        <div
            className="kpi-card flex flex-col rounded-2xl p-5"
            style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)', borderTop: `3px solid ${c.accent}`,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'default',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,52,96,0.10)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                {Icono && <Icono size={14} color={c.accent} />}
                <p style={{ fontSize: 11, fontWeight: 700, color: c.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {KPINombre}
                </p>
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 10, lineHeight: 1.3 }}>
                {kpiLabel}
            </p>

            {/* ── Métrica Dinámica (Ajusta su tamaño si es texto) ── */}
            <p style={{
                fontSize: esTextoLargo ? '1.3rem' : '2.4rem',
                fontWeight: esTextoLargo ? 700 : 800,
                color: c.accent,
                lineHeight: esTextoLargo ? 1.2 : 1,
                letterSpacing: esTextoLargo ? '-0.01em' : '-0.03em',
                marginBottom: 8,
                textTransform: esTextoLargo ? 'capitalize' : 'none',
                // Truncar a 2 líneas si es muy largo para no romper la tarjeta
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
                {esTextoLargo && typeof metricaKPI === 'string' ? metricaKPI.toLowerCase() : metricaKPI}
            </p>

            {tendencia && (
                <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: c.bg, color: c.text, marginBottom: 10, width: 'fit-content' }}>
                    {tendencia}
                </span>
            )}

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 10, marginTop: 'auto' }} />

            <p style={{ fontSize: 11, color: 'var(--text-light)', lineHeight: 1.55 }}>
                {textoKPI}
            </p>
        </div>
    )
}