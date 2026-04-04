import { GraficoPie } from "./GraficoPie.jsx"

export function KPICardPie({ titulo, data }) {
    return (
        <div className="flex flex-col rounded-2xl overflow-hidden flex-1" style={{ background: 'var(--card)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <div className="px-5 pt-5 pb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {titulo}
                </h2>
            </div>
            <div className="px-2 pb-4">
                <GraficoPie data={data} />
            </div>
        </div>
    )
}