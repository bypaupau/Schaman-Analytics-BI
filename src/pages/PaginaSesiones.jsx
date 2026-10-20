import { MenuFiltros } from '../components/MenuFiltros.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Tabla } from '../components/Tabla.jsx'

export function PaginaSesiones({ filtros, onCambioFiltro, data, periodo }) {
    return (
        <main className="page">
            <PageHeader
                titulo="Sesiones"
                subtitulo={'Registro de atención omnicanal · ' + periodo}
            />
            <MenuFiltros filtros={filtros} onCambio={onCambioFiltro} />
            <Tabla data={data} />
        </main>
    )
}
