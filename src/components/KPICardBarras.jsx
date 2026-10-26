// KPICardBarras.jsx ─ Card wrapper para el gráfico de barras horizontales
import { GraficoBarras } from './GraficoBarras.jsx'
import { Card } from './Card.jsx'

export function KPICardBarras({ titulo = 'Tasa de éxito por zona', ayuda, data }) {
    return (
        <Card titulo={titulo} ayuda={ayuda} subtitulo="% de sesiones resueltas con éxito por región">
            <GraficoBarras data={data} />
        </Card>
    )
}
