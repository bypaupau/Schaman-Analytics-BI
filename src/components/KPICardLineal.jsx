// KPICardLineal.jsx ─ Card wrapper para el gráfico lineal
import { GraficoLineal } from "./GraficoLineal.jsx"
import { Card } from "./Card.jsx"

export function KPICardLineal({ titulo, subtitulo = 'Evolución mensual del período seleccionado', data }) {
    return (
        <Card titulo={titulo} subtitulo={subtitulo}>
            <GraficoLineal data={data} />
        </Card>
    )
}
