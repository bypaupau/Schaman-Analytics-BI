// KPICard.jsx — tarjeta limpia para un KPI, estilo moderno sin header oscuro

export function KPICard({ KPINombre, metricaKPI, textoKPI }) {
    return (
        <div className="flex flex-col flex-1 rounded-2xl p-5" style={{ minWidth: '170px', background: 'var(--card)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>

            {/* Título pequeño arriba */}
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                {KPINombre}
            </p>

            {/* Valor grande */}
            <p className="text-4xl font-bold leading-none mb-2" style={{ color: 'var(--accent)' }}>
                {metricaKPI}
            </p>

            {/* Descripción */}
            <p className="text-xs leading-relaxed mt-auto" style={{ color: 'var(--text-muted)' }}>
                {textoKPI}
            </p>

        </div>
    )
}
