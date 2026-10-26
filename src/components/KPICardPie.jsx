// KPICardPie.jsx ─ Card wrapper para el gráfico de donut
import { GraficoPie } from "./GraficoPie.jsx"
import { Card } from "./Card.jsx"

export function KPICardPie({ titulo, ayuda, data }) {
    return (
        <Card titulo={titulo} ayuda={ayuda} subtitulo="% de sesiones atendidas en cada canal">
            <GraficoPie data={data} colorear="canal" />
        </Card>
    )
}
