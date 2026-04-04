// KPICardBarras.jsx ─ Card wrapper para el gráfico de barras horizontales
import { GraficoBarras } from './GraficoBarras.jsx'

export function KPICardBarras({ titulo = 'Tasa de Éxito por Zona', data }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            borderRadius: 16,
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {titulo}
                </p>
            </div>

            {/* Subtítulo explicativo */}
            <div style={{ paddingLeft: 20, paddingTop: 8 }}>
                <p style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    % sesiones resueltas con éxito por región geográfica
                </p>
            </div>

            {/* Gráfico */}
            <div style={{ padding: '8px 12px 16px' }}>
                <GraficoBarras data={data} />
            </div>
        </div>
    )
}
