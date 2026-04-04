import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';

// Datos mock — cuando el ETL esté listo, vendrán de Supabase como prop "data"
const dataMock = [
    { name: 'Llamadas', value: 40 },
    { name: 'Chat',     value: 30 },
    { name: 'Email',    value: 20 },
    { name: 'App',      value: 10 },
]

// Colores distintos para cada canal — fácil de diferenciar en el gráfico
const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ec4899']

// ✅ export para que otros archivos puedan importarlo
// ✅ recibe "data" como prop en vez de tenerlos pegados adentro
export const GraficoPie = ({ data = dataMock }) => {
    return (
        // ✅ ResponsiveContainer para que se adapte al tamaño del contenedor
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}   // esto lo hace donut como en el mockup
                >
                    {/* .map para asignarle un color a cada pedazo */}
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(value) => `${value}%`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
            </PieChart>
        </ResponsiveContainer>
    )
}

