// ScoreCard.jsx ─ Score Global de Calidad de Resolución
// Diseño limpio: gauge a la izquierda, número + nivel en el centro,
// dimensiones con barras de progreso a la derecha.

import { PieChart, Pie, Cell } from 'recharts'
import { Target, Zap, Timer, Smile, Bot } from 'lucide-react'

const dimensionesMock = [
    { nombre: 'Precisión',    valor: 87, icono: <Target   size={13} /> },
    { nombre: 'Efectividad',  valor: 92, icono: <Zap      size={13} /> },
    { nombre: 'Eficiencia',   valor: 89, icono: <Timer    size={13} /> },
    { nombre: 'Experiencia',  valor: 73, icono: <Smile    size={13} /> },
    { nombre: 'Proactividad', valor: 35, icono: <Bot      size={13} /> },
]

// Color condicional de barra (mismo criterio en toda la app)
function barColor(v) {
    if (v >= 80) return '#10B981'
    if (v >= 50) return '#F59E0B'
    return '#EF4444'
}

// Nivel de texto según puntuación
function nivel(score, max) {
    const pct = score / max
    if (pct >= 0.85) return { label: 'Excelente', color: '#10B981' }
    if (pct >= 0.70) return { label: 'Avanzado',  color: '#3B82F6' }
    if (pct >= 0.50) return { label: 'Intermedio',color: '#F59E0B' }
    return { label: 'Básico', color: '#EF4444' }
}

export function ScoreCard({ score = 318, max = 500, dimensiones = dimensionesMock }) {
    const pct     = Math.round((score / max) * 100)

    // Aquí ya calculas el color dinámicamente, lo usaremos para pintar todo
    const { label: nivelLabel, color: nivelColor } = nivel(score, max)

    const gaugeData = [{ value: score }, { value: max - score }]

    return (
        <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            borderRadius: 16,
            padding: '20px 28px',
        }}>

            {/* Título sección */}
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                Score Global de Calidad de Resolución
            </p>

            {/* Layout: [Gauge] [Número + nivel] [░░░░ Dimensiones ░░░░] */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>

                {/* 1. Gauge semicircular */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <PieChart width={150} height={82}>
                        <Pie
                            data={gaugeData}
                            startAngle={180} endAngle={0}
                            cx={75} cy={78}
                            innerRadius={52} outerRadius={72}
                            dataKey="value" strokeWidth={0}
                        >
                            {/* CAMBIO 1: El arco del gauge ahora usa nivelColor */}
                            <Cell fill={nivelColor} />
                            <Cell fill="#E4EAF4" />
                        </Pie>
                    </PieChart>
                    <div style={{ position: 'absolute', bottom: 2, width: '100%', textAlign: 'center' }}>
                        {/* CAMBIO 2: El porcentaje central del gauge usa nivelColor */}
                        <span style={{ fontSize: 13, fontWeight: 700, color: nivelColor }}>{pct}%</span>
                    </div>
                </div>

                {/* 2. Número grande + nivel */}
                <div style={{ flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        {/* CAMBIO 3: El número grande del Score usa nivelColor */}
                        <span style={{ fontSize: '3rem', fontWeight: 800, color: nivelColor, letterSpacing: '-0.04em', lineHeight: 1 }}>
                            {score}
                        </span>
                        <span style={{ fontSize: '1.1rem', color: 'var(--text-light)', fontWeight: 400 }}>
                            / {max}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={{
                            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                            background: nivelColor + '18', color: nivelColor,
                        }}>
                            {nivelLabel}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
                            Rendimiento del período seleccionado
                        </span>
                    </div>
                </div>

                {/* 3. Divisor vertical */}
                <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', flexShrink: 0 }} />

                {/* 4. Dimensiones ─ flex wrap, ocupan el espacio restante */}
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px 24px' }}>
                    {dimensiones.map((d) => (
                        <div key={d.nombre} style={{ flex: '1 1 140px', minWidth: 130 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                                    {d.icono} {d.nombre}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: barColor(d.valor) }}>
                                    {d.valor}%
                                </span>
                            </div>
                            {/* Barra de progreso */}
                            <div style={{ height: 5, borderRadius: 999, background: '#E4EAF4' }}>
                                <div style={{
                                    height: 5, borderRadius: 999,
                                    width: `${d.valor}%`,
                                    background: barColor(d.valor),
                                    transition: 'width 0.8s ease',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}