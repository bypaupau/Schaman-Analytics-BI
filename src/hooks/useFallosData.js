// ══════════════════════════════════════════════════════════════════════════════
// useFallosData.js
// Hook de datos para la página "Análisis de Fallos".
// Llama 5 RPCs en paralelo con los mismos filtros que el panel general.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

export function useFallosData(filtros) {
    // undefined = todavía cargando (el componente muestra su estado de loading)
    // [] = cargó pero no hay datos (el componente muestra "Sin datos")
    const [topProblemas,     setTopProblemas]     = useState(undefined)
    const [porCategoria,     setPorCategoria]     = useState(undefined)
    const [porPrioridad,     setPorPrioridad]     = useState(undefined)
    const [topDispositivos,  setTopDispositivos]  = useState(undefined)
    const [resumen,          setResumen]          = useState(undefined)   // { total_sesiones, sesiones_con_fallo }
    const [error,            setError]            = useState(null)

    useEffect(() => {
        if (!filtros?.desde) return
        let cancelled = false

        async function fetchFallos() {
            setTopProblemas(undefined)
            setPorCategoria(undefined)
            setPorPrioridad(undefined)
            setTopDispositivos(undefined)
            setResumen(undefined)
            setError(null)

            const filtrosRpc = {
                p_desde: filtros.desde,
                p_hasta: filtros.hasta,
                p_canal: filtros.canal,
                p_region: filtros.region,
                p_subzona: filtros.subzona,
            }
            // Las 5 consultas van en paralelo — mismo patrón que useDashboardData
            try {
                const [rProblemas, rCategoria, rPrioridad, rDispositivos, rResumen] = await Promise.all([
                    supabase.rpc('get_fallos_top_problemas',          { ...filtrosRpc, p_limit: 10 }),
                    supabase.rpc('get_fallos_por_categoria',          filtrosRpc),
                    supabase.rpc('get_fallos_resolucion_por_prioridad', filtrosRpc),
                    supabase.rpc('get_fallos_dispositivos',           { ...filtrosRpc, p_limit: 8 }),
                    supabase.rpc('get_fallos_resumen',                filtrosRpc),
                ])

                // Ignoramos respuestas antiguas si el usuario cambió los filtros
                // mientras estas consultas seguían en curso.
                if (cancelled) return

                const respuestas = [rProblemas, rCategoria, rPrioridad, rDispositivos, rResumen]
                const errores = respuestas.filter(r => r.error).map(r => r.error.message)
                if (errores.length) {
                    console.error('❌ Fallos RPC error:', errores)
                    setError([...new Set(errores)].join(' · '))
                }

                // Error → [], sin datos → [], con datos → datos reales.
                setTopProblemas(rProblemas.error       ? [] : (rProblemas.data     ?? []))
                setPorCategoria(rCategoria.error       ? [] : (rCategoria.data     ?? []))
                setPorPrioridad(rPrioridad.error       ? [] : (rPrioridad.data     ?? []))
                setTopDispositivos(rDispositivos.error ? [] : (rDispositivos.data  ?? []))
                setResumen(rResumen.error ? null : (rResumen.data?.[0] ?? null))
            } catch (err) {
                if (cancelled) return
                console.error('❌ Fallos RPC error:', err)
                setError(err instanceof Error ? err.message : 'No se pudieron consultar los datos de fallos.')
                setTopProblemas([])
                setPorCategoria([])
                setPorPrioridad([])
                setTopDispositivos([])
                setResumen(null)
            }
        }

        fetchFallos()
        return () => { cancelled = true }
    }, [filtros?.desde, filtros?.hasta, filtros?.canal, filtros?.region, filtros?.subzona])

    return { topProblemas, porCategoria, porPrioridad, topDispositivos, resumen, error }
}
