// ══════════════════════════════════════════════════════════════════════════════
// useMapaData.js
// Trae de Supabase las sesiones agrupadas por zona para el mapa.
//
// Una sola consulta devuelve las tres métricas (total, resueltas por IA y
// resueltas en el primer contacto), así que cambiar de métrica en la página
// no vuelve a consultar: solo cambia qué columna se pinta.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

export function useMapaData(filtros) {
    const [data,  setData]  = useState(undefined)   // undefined = cargando
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!filtros?.desde) return
        let cancelled = false

        async function fetchMapa() {
            setData(undefined)
            setError(null)

            const { data: filas, error } = await supabase.rpc('get_mapa_sesiones', {
                p_desde:   filtros.desde,
                p_hasta:   filtros.hasta,
                p_canal:   filtros.canal,
                p_region:  filtros.region,
                p_subzona: filtros.subzona,
            })

            // Ignoramos respuestas antiguas si el usuario cambió los filtros
            if (cancelled) return

            if (error) {
                console.error('❌ get_mapa_sesiones:', error.message)
                setError(error.message)
                setData([])
                return
            }
            setData(filas ?? [])
        }

        fetchMapa()
        return () => { cancelled = true }
    }, [filtros?.desde, filtros?.hasta, filtros?.canal, filtros?.region, filtros?.subzona])

    return { data, error }
}
