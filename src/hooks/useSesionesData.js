// ══════════════════════════════════════════════════════════════════════════════
// useSesionesData.js
// Trae de Supabase las sesiones de la tabla "Sesiones recientes", con búsqueda.
//
// La búsqueda se hace en la base de datos (parámetro p_busqueda de
// get_sesiones_recientes): busca por ID de sesión, nombre del cliente o fecha sobre
// TODAS las sesiones del filtro, no solo sobre las que ya están en pantalla.
//
// Mientras llega una respuesta nueva se conservan las filas anteriores, para
// que la tabla no parpadee cada vez que se escribe una letra.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

const LIMITE_SESIONES = 100   // máximo de filas que se traen por consulta
const RETARDO_BUSQUEDA = 300  // ms que se espera tras la última tecla antes de consultar

export function useSesionesData(filtros, busqueda) {
    const [data,     setData]     = useState([])
    const [total,    setTotal]    = useState(0)       // coincidencias totales (puede ser > data.length)
    const [cargando, setCargando] = useState(true)
    const [error,    setError]    = useState(null)
    const [consulta, setConsulta] = useState('')      // la búsqueda ya "asentada"

    // Debounce: solo consultamos cuando la persona deja de escribir
    useEffect(() => {
        const t = setTimeout(() => setConsulta(busqueda.trim()), RETARDO_BUSQUEDA)
        return () => clearTimeout(t)
    }, [busqueda])

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
                p_limit:    LIMITE_SESIONES,
                p_busqueda: consulta || null,
            })

            // Ignoramos respuestas antiguas si cambió el filtro o la búsqueda
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
    }, [filtros?.desde, filtros?.hasta, filtros?.canal, filtros?.region, filtros?.subzona, consulta])

    return { data, total, cargando, error }
}
