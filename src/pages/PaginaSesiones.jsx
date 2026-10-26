import { useState } from 'react'
import { MenuFiltros } from '../components/MenuFiltros.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Tabla } from '../components/Tabla.jsx'
import { useSesionesData, FILAS_POR_PAGINA_OPCIONES } from '../hooks/useSesionesData'

export function PaginaSesiones({ filtros, valoresFiltro, onCambioFiltro, periodo }) {
    const [busqueda, setBusqueda] = useState('')
    const [orden, setOrden] = useState([{ columna: 'fecha', direccion: 'desc' }])   // más recientes primero
    const { data, total, cargando, error, pagina, totalPaginas, porPagina, setPorPagina, irAPagina } =
        useSesionesData(valoresFiltro, busqueda, orden)

    return (
        <main className="page">
            <PageHeader
                titulo="Sesiones"
                subtitulo={'Registro de atención omnicanal · ' + periodo}
            />
            <MenuFiltros filtros={filtros} onCambio={onCambioFiltro} />

            {error && (
                <div role="alert" className="aviso-error">
                    <strong>No se pudieron cargar las sesiones.</strong> <span>{error}</span>{' '}
                    <span>Revisa que get_sesiones_recientes en Supabase sea la versión más reciente (sql/ordenar_sesiones.sql).</span>
                </div>
            )}

            <Tabla
                data={data}
                total={total}
                cargando={cargando}
                pagina={pagina}
                totalPaginas={totalPaginas}
                porPagina={porPagina}
                opcionesPorPagina={FILAS_POR_PAGINA_OPCIONES}
                onPaginaChange={irAPagina}
                onPorPaginaChange={setPorPagina}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
                orden={orden}
                onOrdenChange={setOrden}
            />
        </main>
    )
}
