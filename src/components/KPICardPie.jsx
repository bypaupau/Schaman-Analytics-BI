// KPICardPie.jsx ─ Card wrapper para el gráfico de donut
import { GraficoPie } from "./GraficoPie.jsx"

export function KPICardPie({ titulo, data }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            borderRadius: 16,
            overflow: 'hidden',
        }}>
            <div style={{ padding: '16px 20px 8px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {titulo}
                </p>
            </div>
            <div style={{ padding: '12px 12px 16px' }}>
                <GraficoPie data={data} />
            </div>
        </div>
    )
}
