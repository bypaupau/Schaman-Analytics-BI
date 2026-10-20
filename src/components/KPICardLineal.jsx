// KPICardLineal.jsx ─ Card wrapper para el gráfico lineal
import { GraficoLineal } from "./GraficoLineal.jsx"
import { Card } from "./Card.jsx"

export function KPICardLineal({ titulo, data }) {
    return (
        <Card titulo={titulo} subtitulo="Evolución mensual del año seleccionado">
            <GraficoLineal data={data} />
        </Card>
    )
}
