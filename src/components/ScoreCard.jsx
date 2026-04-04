// ScoreCard.jsx — Score Global con gauge semicircular, tema claro

import { PieChart, Pie, Cell } from 'recharts'
import { Target, Rocket, Timer, Smile, ThumbsUp } from 'lucide-react' // ← Nueva línea

const dimensionesMock = [
    { nombre: 'Cobertura',    valor: 87, icono: <Target size={14} /> },
    { nombre: 'Electividad',  valor: 92, icono: <Rocket size={14} /> },
    { nombre: 'Eficiencia',   valor: 89, icono: <Timer size={14} /> },
    { nombre: 'Experiencia',  valor: 73, icono: <Smile size={14} /> },
    { nombre: 'Proactividad', valor: 35, icono: <ThumbsUp size={14} /> },
]

export function ScoreCard({ score = 318, max = 500, dimensiones = dimensionesMock }) {
    const gaugeData = [
        { value: score },
        { value: max - score },
    ]
    const porcentaje = Math.round((score / max) * 100)
    const getColorBarra = (valor) => {
        if (valor >= 80) return '#16a34a'; // Verde para 80% o más
        if (valor >= 50) return '#f59e0b'; // Amarillo/Naranja entre 50% y 79%
        return '#ef4444';                  // Rojo para menos de 50%
    }
    return (
        <div className="rounded-2xl p-6" style={{ background: 'var(--card)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>

            {/* Título */}
            <p className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: 'var(--text-muted)' }}>
                Score Global de Calidad de Resolución
            </p>

            {/* Fila principal: número + gauge */}
            <div className="flex items-center gap-8 mb-6">

                    {/* 1. Gauge — PieChart de media luna (AQUÍ LO MOVIMOS PRIMERO) */}
                    <div className="relative shrink-0">
                        <PieChart width={170} height={95}>
                            <Pie
                                data={gaugeData}
                                startAngle={180}
                                endAngle={0}
                                cx={85}
                                cy={90}
                                innerRadius={58}
                                outerRadius={82}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                <Cell fill="#2563eb" />
                                <Cell fill="#e2e8f0" />
                            </Pie>
                        </PieChart>
                        <div className="absolute bottom-0 w-full text-center">
                            <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{porcentaje}%</span>
                        </div>
                    </div>

                    {/* 2. Número grande  */}
                    <div>
                        <p className="font-black leading-none" style={{ fontSize: '3.5rem', color: 'var(--accent)' }}>
                            {score}
                            <span className="text-2xl font-normal ml-1" style={{ color: 'var(--text-muted)' }}>/ {max}</span>
                        </p>
                        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                            Nivel: <span className="font-semibold" style={{ color: '#16a34a' }}>Avanzado</span>
                            <span className="ml-1 text-xs">(+12 pts vs período anterior)</span>
                        </p>
                    </div>

                </div>

            {/* Separador */}
            <div style={{ borderTop: '1px solid var(--border)', marginBottom: '1rem' }} />

            {/* Dimensiones con barras */}
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Dimensiones de Calidad
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
                {dimensiones.map((d) => (
                    <div key={d.nombre} className="flex-1" style={{ minWidth: '160px' }}>
                        <div className="flex justify-between mb-">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.icono} {d.nombre}</span>
                            <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{d.valor}%</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: '#e2e8f0' }}>
                            <div className="h-2 rounded-full" style={{ width: `${d.valor}%`, background: getColorBarra(d.valor)}} />
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
