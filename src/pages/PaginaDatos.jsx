import { ArrowDown, CircleAlert, Database, GitBranch, Sigma } from 'lucide-react'
import { PageHeader } from '../components/PageHeader.jsx'

const flujo = [
    { numero: '01', titulo: 'Base de datos', detalle: 'Supabase guarda las sesiones y los catálogos de atención.' },
    { numero: '02', titulo: 'Preparación', detalle: 'Pentaho PDI extrae, limpia y organiza la información.' },
    { numero: '03', titulo: 'Almacén analítico', detalle: 'Supabase DW reúne los datos listos para analizar.' },
    { numero: '04', titulo: 'Cálculos', detalle: 'Funciones SQL aplican filtros y calculan los indicadores.' },
    { numero: '05', titulo: 'Panel', detalle: 'React y Recharts presentan indicadores y gráficos.' },
]

const metricas = [
    {
        nombre: 'Resolución en el primer contacto (FCR)',
        formula: 'Sesiones resueltas en el primer contacto ÷ sesiones con este dato registrado × 100',
        lectura: 'De las sesiones con dato conocido, muestra cuántas se resolvieron en el primer contacto. “No” no dice cuántos contactos hicieron falta después.',
    },
    {
        nombre: 'Tiempo medio de operación (TMO)',
        formula: 'Promedio de duración de las sesiones filtradas',
        lectura: 'Indica cuánto dura una sesión en promedio. El panel lo muestra en segundos y minutos.',
    },
    {
        nombre: 'T-NPS',
        formula: '% de promotores (9–10) menos % de detractores (0–6)',
        lectura: 'Las calificaciones de 7 y 8 cuentan como pasivas. El resultado va de −100 a +100.',
    },
    {
        nombre: 'Tasa de éxito',
        formula: 'Sesiones con resultado “Resuelto” ÷ sesiones filtradas × 100',
        lectura: 'Muestra qué porcentaje de sesiones terminó resuelto. No significa que se resolviera en el primer contacto.',
    },
    {
        nombre: 'Resolución por IA',
        formula: 'Sesiones marcadas como resueltas por IA ÷ sesiones filtradas × 100',
        lectura: 'Muestra qué porcentaje figura como resuelto por IA. El dato no confirma por sí solo que no haya intervenido una persona.',
    },
]

function Card({ titulo, children, className = '' }) {
    return (
        <section className={`card ${className}`}>
            <div className="card-header"><h2 className="card-title">{titulo}</h2></div>
            <div className="card-body">{children}</div>
        </section>
    )
}

export function PaginaDatos() {
    return (
        <main className="page method-page">
            <PageHeader
                titulo="Datos y metodología"
                subtitulo="Cómo se preparan los datos y qué significan los indicadores del panel."
            />

            <Card titulo="Flujo de datos">
                <div className="method-flow">
                    {flujo.map((paso, index) => (
                        <div className="method-flow-step" key={paso.numero}>
                            <span className="method-flow-number">{paso.numero}</span>
                            <div>
                                <h3>{paso.titulo}</h3>
                                <p>{paso.detalle}</p>
                            </div>
                            {index < flujo.length - 1 && <ArrowDown className="method-flow-arrow" size={18} aria-hidden="true" />}
                        </div>
                    ))}
                </div>
                <p className="method-note">El panel todavía no indica cuándo se actualizaron los datos.</p>
            </Card>

            <div className="grid-2">
                <Card titulo="Modelo analítico">
                    <div className="method-intro">
                        <Database size={20} aria-hidden="true" />
                        <p>Cada fila representa una sesión. Puedes compararlas y filtrarlas por fecha, cliente, canal, zona y otros datos.</p>
                    </div>
                    <dl className="method-dimensions">
                        <div><dt>Tabla principal</dt><dd>Sesiones omnicanal</dd></div>
                        <div><dt>Datos para filtrar</dt><dd>Fecha, cliente, canal, zona, problema, contrato, dispositivo y usuario</dd></div>
                        <div><dt>Datos que se miden</dt><dd>Duración, resolución, uso de IA y satisfacción</dd></div>
                    </dl>
                </Card>
                <Card titulo="Alcance y calidad">
                    <div className="method-alert">
                        <CircleAlert size={19} aria-hidden="true" />
                        <div>
                            <strong>Solo se identifica el primer contacto.</strong>
                            <p>Los datos indican si la sesión se resolvió al primer contacto. No registran cuántos contactos posteriores hicieron falta.</p>
                        </div>
                    </div>
                    <p className="method-copy">Las sesiones sin respuesta para el primer contacto no entran en ese cálculo. La fecha de actualización y el origen de los datos aún deben documentarse.</p>
                </Card>
            </div>

            <Card titulo="Definición de indicadores">
                <div className="method-metrics">
                    {metricas.map(metrica => (
                        <article className="method-metric" key={metrica.nombre}>
                            <h3>{metrica.nombre}</h3>
                            <p className="method-formula"><Sigma size={16} aria-hidden="true" /><span>Se calcula así: {metrica.formula}</span></p>
                            <p>{metrica.lectura}</p>
                        </article>
                    ))}
                </div>
            </Card>

            <Card titulo="Score global">
                <div className="method-intro">
                    <GitBranch size={20} aria-hidden="true" />
                    <p>Es un resumen creado para este proyecto. Suma cinco resultados, cada uno de 0 a 100; el máximo es 500.</p>
                </div>
                <div className="method-score-list">
                    <span>Resolución al primer contacto</span><span>Sesiones resueltas</span><span>Sesiones de hasta 300 s</span><span>Clientes promotores</span><span>Sesiones resueltas por IA</span>
                </div>
                <p className="method-note">Los niveles Básico, Intermedio, Avanzado y Excelente usan rangos definidos para este proyecto.</p>
            </Card>
        </main>
    )
}
