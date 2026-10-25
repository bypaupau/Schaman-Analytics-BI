import { useState } from 'react'
import { MenuFiltros } from '../components/MenuFiltros.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { Tabla } from '../components/Tabla.jsx'
import { useSesionesData } from '../hooks/useSesionesData'

export function PaginaSesiones({ filtros, valoresFiltro, onCambioFiltro, periodo }) {
    const [busqueda, setBusqueda] = useState('')
    const { data, total, cargando, error } = useSesionesData(valoresFiltro, busqueda)

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
                    <span>Revisa que get_sesiones_recientes en Supabase tenga el parámetro p_busqueda.</span>
                </div>
            )}

            <Tabla
                data={data}
                total={total}
                cargando={cargando}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
            />
        </main>
    )
}
