// KPICard.jsx ─ card analítica limpia
// Fondo BLANCO siempre. El color solo aparece en:
//   - la línea superior (borderTop 3px)
//   - el número grande
//   - el badge de tendencia
// Así no hay "ruido visual" ni clash con el fondo del dashboard.

const PALETTE = {
    green:  { accent: '#10B981', bg: '#F0FDF4', text: '#065F46' },
    blue:   { accent: '#3B82F6', bg: '#EFF6FF', text: '#1E40AF' },
    amber:  { accent: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
    teal:   { accent: '#0EA5E9', bg: '#F0F9FF', text: '#0C4A6E' },
    violet: { accent: '#8B5CF6', bg: '#F5F3FF', text: '#4C1D95' },
}

export function KPICard({
    KPINombre,     // sigla: "FCR", "TMO", etc.
    kpiLabel,      // descripción corta
    metricaKPI,    // el número grande
    textoKPI,      // descripción larga
    color = 'blue',
    tendencia,
    positivo = true,
}) {
    const c = PALETTE[color] ?? PALETTE.blue

    return (
        <div
            className="kpi-card flex flex-col rounded-2xl p-5"
            style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                borderTop: `3px solid ${c.accent}`,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'default',
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
            {/* Sigla del KPI */}
            <p style={{ fontSize: 11, fontWeight: 700, color: c.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                {KPINombre}
            </p>

            {/* Label descriptivo */}
            <p style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 10, lineHeight: 1.3 }}>
                {kpiLabel}
            </p>

            {/* NÚMERO GRANDE — protagonista */}
            <p style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                color: c.accent,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                marginBottom: 8,
            }}>
                {metricaKPI}
            </p>

            {/* Badge de tendencia */}
            {tendencia && (
                <span style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: c.bg,
                    color: c.text,
                    marginBottom: 10,
                    width: 'fit-content',
                }}>
                    {tendencia}
                </span>
            )}

            {/* Separador */}
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 10 }} />

            {/* Descripción */}
            <p style={{ fontSize: 11, color: 'var(--text-light)', lineHeight: 1.55, marginTop: 'auto' }}>
                {textoKPI}
            </p>
        </div>
    )
}
