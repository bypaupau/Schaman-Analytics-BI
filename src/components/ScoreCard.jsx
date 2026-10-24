// ScoreCard.jsx ─ Score Global de Calidad de Resolución
// Tarjeta "héroe" del dashboard, partida en dos:
//   izquierda → panel teal con el gauge, el número grande y el nivel
//   derecha   → las 5 dimensiones con barras de progreso + leyenda de umbrales
//
// Las barras usan colores de ESTADO (bueno / atención / crítico) y siempre
// muestran el % en texto, así el color nunca es la única pista.

import { PieChart, Pie, Cell } from 'recharts'
import { Target, Zap, Timer, Smile, Bot } from 'lucide-react'
import { STATUS, statusPorPorcentaje } from '../lib/chartTheme'

const dimensionesMock = [
    { nombre: 'Precisión',    valor: 87, icono: <Target   size={16} /> },
    { nombre: 'Efectividad',  valor: 92, icono: <Zap      size={16} /> },
    { nombre: 'Eficiencia',   valor: 89, icono: <Timer    size={16} /> },
    { nombre: 'Experiencia',  valor: 73, icono: <Smile    size={16} /> },
    { nombre: 'Resolución por IA', valor: 35, icono: <Bot      size={16} /> },
]

// Nivel de texto según puntuación
function nivel(score, max) {
    const pct = score / max
    if (pct >= 0.85) return { label: 'Excelente',  status: 'good'     }
    if (pct >= 0.70) return { label: 'Avanzado',   status: 'good'     }
    if (pct >= 0.50) return { label: 'Intermedio', status: 'warning'  }
    return                  { label: 'Básico',     status: 'critical' }
}

export function ScoreCard({ score = 318, max = 500, dimensiones = dimensionesMock }) {
    const pct = Math.round((score / max) * 100)
    const { label: nivelLabel, status: nivelStatus } = nivel(score, max)

    const gaugeData = [{ value: score }, { value: Math.max(max - score, 0) }]

    return (
        <section className="card reveal" style={{ flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' }} aria-labelledby="score-titulo">

            {/* ── 1. Panel héroe ─────────────────────────────────────────── */}
            <div style={{
                flex: '1 1 min(400px, 100%)',
                padding: '24px 28px',
                color: '#FFFFFF',
                background: 'radial-gradient(420px 220px at 100% 0%, rgba(247,217,58,0.30), transparent 70%), linear-gradient(135deg, var(--brand-ink) 0%, var(--brand) 55%, #6FB1F5 100%)',
                display: 'flex',
                flexWrap: 'wrap',          // en móvil el gauge y el número se apilan
                alignItems: 'center',
                gap: 24,
            }}>
                {/* Gauge semicircular */}
                <div style={{ position: 'relative', flexShrink: 0 }} aria-hidden="true">
                    <PieChart width={156} height={88}>
                        <Pie
                            data={gaugeData}
                            startAngle={180} endAngle={0}
                            cx={78} cy={82}
                            innerRadius={56} outerRadius={76}
                            cornerRadius={6}
                            dataKey="value" strokeWidth={0}
                            isAnimationActive={false}
                        >
                            <Cell fill="#FFFFFF" />
                            <Cell fill="rgba(255,255,255,0.18)" />
                        </Pie>
                    </PieChart>
                    <span className="tabular" style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center', fontSize: 17, fontWeight: 700 }}>
                        {pct}%
                    </span>
                </div>

                <div style={{ minWidth: 0 }}>
                    <h2 id="score-titulo" style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                        Score global de calidad
                    </h2>
                    <p className="tabular" style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4, whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
                            {score}
                        </span>
                        <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>/ {max}</span>
                    </p>
                    <span className="chip" style={{ marginTop: 10, background: 'rgba(255,255,255,0.14)', color: '#FFFFFF', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}>
                        <span className="dot" style={{ background: STATUS[nivelStatus].fill, boxShadow: '0 0 0 2px rgba(255,255,255,0.9)' }} />
                        Nivel {nivelLabel}
                    </span>
                </div>
            </div>

            {/* ── 2. Dimensiones ─────────────────────────────────────────── */}
            <div style={{ flex: '999 1 min(420px, 100%)', padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px 16px' }}>
                    <div>
                        <h3 className="card-title">Dimensiones del score</h3>
                        <p className="card-subtitle">Rendimiento del período seleccionado</p>
                    </div>
                </div>

                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px 28px' }}>
                    {dimensiones.map((d) => {
                        const s = STATUS[statusPorPorcentaje(d.valor)]
                        return (
                            <li key={d.nombre}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, color: 'var(--text-muted)' }}>
                                        <span aria-hidden="true" style={{ display: 'grid', color: 'var(--text-light)' }}>{d.icono}</span>
                                        {d.nombre}
                                    </span>
                                    <span className="tabular" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                                        {d.valor}%
                                    </span>
                                </div>
                                {/* Barra de progreso */}
                                <div
                                    role="progressbar"
                                    aria-label={d.nombre}
                                    aria-valuenow={d.valor} aria-valuemin={0} aria-valuemax={100}
                                    style={{ height: 8, borderRadius: 999, background: 'var(--grid)', overflow: 'hidden' }}
                                >
                                    <div style={{
                                        height: '100%', borderRadius: 999,
                                        width: `${Math.min(d.valor, 100)}%`,
                                        background: s.fill,
                                        transition: 'width 0.8s ease',
                                    }} />
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}
