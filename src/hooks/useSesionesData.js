// ══════════════════════════════════════════════════════════════════════════════
// useSesionesData.js
// Trae de Supabase las sesiones de la tabla "Sesiones recientes": búsqueda, orden
// y paginación se resuelven en la base de datos (get_sesiones_recientes).
//
//   · búsqueda   → por ID de sesión, nombre del cliente o fecha, sobre TODAS las sesiones del filtro
//   · orden      → una o varias columnas (p_orden = 'cliente:asc,fecha:desc')
//   · paginación → solo se piden las filas de la página actual (p_limit / p_offset), así la
//                  tabla puede recorrer miles de sesiones sin cargarlas todas en el navegador
//
// Mientras llega una respuesta nueva se conservan las filas anteriores, para
// que la tabla no parpadee al escribir, ordenar o cambiar de página.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

export const FILAS_POR_PAGINA_OPCIONES = [10, 25, 50, 100]
const RETARDO_BUSQUEDA = 300  // ms que se espera tras la última tecla antes de consultar

export function useSesionesData(filtros, busqueda, orden) {
    // Lista de criterios → 'cliente:asc,fecha:desc' (vacío = orden por defecto del servidor: más recientes primero)
    const ordenTexto = orden.map(o => `${o.columna}:${o.direccion}`).join(',')

    const [data,       setData]       = useState([])
    const [total,      setTotal]      = useState(0)       // coincidencias totales, de todas las páginas
    const [cargando,   setCargando]   = useState(true)
    const [error,      setError]      = useState(null)
    const [consulta,   setConsulta]   = useState('')      // la búsqueda ya "asentada"
    const [porPagina,  setPorPagina]  = useState(FILAS_POR_PAGINA_OPCIONES[0])

    // Debounce: solo consultamos cuando la persona deja de escribir
    useEffect(() => {
        const t = setTimeout(() => setConsulta(busqueda.trim()), RETARDO_BUSQUEDA)
        return () => clearTimeout(t)
    }, [busqueda])

    // ── Página actual ────────────────────────────────────────────────────────
    // Se guarda junto con "para qué consulta era". Si cambia cualquier filtro, la búsqueda, el
    // orden o las filas por página, esa consulta ya no coincide y la página vuelve a 1 sola,
    // sin necesidad de un efecto que la reinicie.
    const claveConsulta = [filtros?.desde, filtros?.hasta, filtros?.canal, filtros?.region, filtros?.subzona, consulta, ordenTexto, porPagina].join('|')
    const [paginaGuardada, setPaginaGuardada] = useState({ clave: '', numero: 1 })
    const pagina = paginaGuardada.clave === claveConsulta ? paginaGuardada.numero : 1

    const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
    function irAPagina(numero) {
        const n = Math.min(Math.max(1, Math.floor(Number(numero)) || 1), totalPaginas)
        setPaginaGuardada({ clave: claveConsulta, numero: n })
    }

    useEffect(() => {
        if (!filtros?.desde) return
        let cancelled = false

        async function fetchSesiones() {
            setCargando(true)
            setError(null)

            const { data: filas, error } = await supabase.rpc('get_sesiones_recientes', {
                p_desde:    filtros.desde,
                p_hasta:    filtros.hasta,
                p_canal:    filtros.canal,
                p_region:   filtros.region,
                p_subzona:  filtros.subzona,
                p_limit:    porPagina,
                p_offset:   (pagina - 1) * porPagina,
                p_busqueda: consulta || null,
                p_orden:    ordenTexto,
            })

            // Ignoramos respuestas antiguas si cambió el filtro, la búsqueda, el orden o la página
            if (cancelled) return

            if (error) {
                console.error('❌ get_sesiones_recientes:', error.message)
                setError(error.message)
                setData([])
                setTotal(0)
            } else {
                // El RPC conserva el nombre heredado `tercerContacto`; en la UI exponemos el significado correcto.
                setData((filas ?? []).map(s => ({ ...s, resueltoPrimerContacto: s.tercerContacto })))
                setTotal(Number(filas?.[0]?.total_coincidencias ?? 0))
            }
            setCargando(false)
        }

        fetchSesiones()
        return () => { cancelled = true }
    }, [filtros?.desde, filtros?.hasta, filtros?.canal, filtros?.region, filtros?.subzona, consulta, ordenTexto, porPagina, pagina])

    return { data, total, cargando, error, pagina, totalPaginas, porPagina, setPorPagina, irAPagina }
}
