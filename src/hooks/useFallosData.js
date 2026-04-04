// ══════════════════════════════════════════════════════════════════════════════
// useFallosData.js
// Hook de datos para la página "Análisis de Fallos".
// Llama 4 RPCs en paralelo usando el año como filtro.
//
// Por qué solo filtramos por año (y no por mes/canal/zona como en el Overview):
//   - El análisis de fallos es estratégico y de largo plazo.
//   - Un gerente técnico quiere ver "¿qué modelos de router dieron problemas
//     TODO EL AÑO?" no solo en enero.
//   - Si necesitas más filtros en el futuro, se agregan fácilmente aquí.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'

export function useFallosData(anio) {
    // undefined = todavía cargando (el componente muestra su estado de loading)
    // [] = cargó pero no hay datos (el componente muestra "Sin datos")
    const [topProblemas,     setTopProblemas]     = useState(undefined)
    const [porCategoria,     setPorCategoria]     = useState(undefined)
    const [porPrioridad,     setPorPrioridad]     = useState(undefined)
    const [topDispositivos,  setTopDispositivos]  = useState(undefined)

    useEffect(() => {
        if (!anio) return  // si aún no tenemos el año, no hacemos nada

        async function fetchFallos() {
            // Las 4 consultas van en paralelo — mismo patrón que useDashboardData
            const [rProblemas, rCategoria, rPrioridad, rDispositivos] = await Promise.all([
                supabase.rpc('get_fallos_top_problemas',          { p_anio: anio, p_limit: 10 }),
                supabase.rpc('get_fallos_por_categoria',          { p_anio: anio }),
                supabase.rpc('get_fallos_resolucion_por_prioridad', { p_anio: anio }),
                supabase.rpc('get_fallos_dispositivos',           { p_anio: anio, p_limit: 8 }),
            ])

            // Log de errores para debug en consola del navegador
            ;[rProblemas, rCategoria, rPrioridad, rDispositivos]
                .forEach(r => { if (r.error) console.error('❌ Fallos RPC error:', r.error.message) })

            // Actualizamos el estado SIEMPRE, incluso si hay error o viene vacío.
            // Si usamos `if (!error)` y hay fallo, el estado se queda en `undefined`
            // → GraficoPie y GraficoBarrasGen muestran "Cargando..." para siempre.
            // Con este patrón: error → [], sin datos → [], con datos → datos reales.
            setTopProblemas(rProblemas.error       ? [] : (rProblemas.data     ?? []))
            setPorCategoria(rCategoria.error       ? [] : (rCategoria.data     ?? []))
            setPorPrioridad(rPrioridad.error       ? [] : (rPrioridad.data     ?? []))
            setTopDispositivos(rDispositivos.error ? [] : (rDispositivos.data  ?? []))
        }

        fetchFallos()
    }, [anio])  // se re-ejecuta cuando cambia el año

    return { topProblemas, porCategoria, porPrioridad, topDispositivos }
}
