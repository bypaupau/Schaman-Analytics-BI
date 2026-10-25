// ══════════════════════════════════════════════════════════════════════════════
// useFiltros.js
// Hook personalizado que maneja todo lo relacionado con los filtros del dashboard.
//
// Qué hace:
//   1. Carga las opciones disponibles desde Supabase (años, meses, canales, zonas)
//      UNA SOLA VEZ al montar el componente
//   2. Mantiene el estado de los filtros activos (qué tiene seleccionado el usuario)
//   3. Devuelve el array 'filtrosParaMenu' listo para pasarle a <MenuFiltros>
//   4. Filtra las subzonas DINÁMICAMENTE según la región seleccionada:
//      - Si Región = 'Global' → muestra todas las subzonas
//      - Si Región = 'BARCELONA' → muestra solo GRÀCIA, EIXAMPLE (no NORTE, SUR, etc.)
//      Esto evita que aparezcan opciones sin sentido en el selector de Zona.
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { supabase }            from '../lib/supabase'
import { rangoDeAnio }         from '../lib/fechas'

// Valores "centinela": el SQL los interpreta como "sin filtro aplicado"
const FILTROS_INIT = {
    ...rangoDeAnio(2024),   // desde / hasta: el período activo (un año, un mes, un rango o un día)
    canal:   'Todos',
    region:  'Global',   // 'Global' = mostrar todas las regiones
    subzona: 'Global',   // 'Global' = mostrar todas las subzonas
}

export function useFiltros() {
    const [filtros,  setFiltros]  = useState(FILTROS_INIT)
    const [opciones, setOpciones] = useState(null)  // null mientras carga

    // ── Carga inicial de opciones ────────────────────────────────────────────
    // Solo se ejecuta una vez (array de dependencias vacío []).
    // Cargamos anios, meses, canales, regiones, subzonas y zonas_completas.
    useEffect(() => {
        async function cargarOpciones() {
            const { data, error } = await supabase.rpc('get_filtros_disponibles')
            if (error) {
                console.error('❌ get_filtros_disponibles:', error.message)
                return
            }
            const row = data?.[0]
            if (!row) return

            setOpciones(row)

            // Arrancar con el año más reciente disponible en el DW
            if (row.anios?.length) {
                const anioMax = Math.max(...row.anios)
                setFiltros(prev => ({ ...prev, ...rangoDeAnio(anioMax) }))
            }
        }
        cargarOpciones()
    }, [])

    // ── Handler: el usuario cambia un filtro en el menú ─────────────────────
    function handleFiltroChange(label, value) {
        // El filtro de Período entrega las dos fechas juntas: { desde, hasta }
        if (label === 'Período') {
            setFiltros(prev => ({ ...prev, desde: value.desde, hasta: value.hasta }))
            return
        }

        // Mapeamos el label que muestra el <select> a la clave del estado
        const mapa = {
            Canal:  'canal',
            Región: 'region',
            Zona:   'subzona',
        }
        const clave = mapa[label]
        if (!clave) return

        setFiltros(prev => {
            const nuevo = {
                ...prev,
                // El año es numérico, el resto son strings
                [clave]: value,
            }
            // Cuando el usuario cambia la Región, reseteamos la Zona a 'Global'.
            // Si no lo hacemos, podría quedar seleccionada una subzona que no existe
            // en la nueva región (ej: tenías GRÀCIA con BARCELONA, cambias a MADRID
            // y GRÀCIA no existe en MADRID → el filtro devuelve 0 resultados).
            if (clave === 'region') nuevo.subzona = 'Global'
            return nuevo
        })
    }

    // ── Filtrado dinámico de subzonas ────────────────────────────────────────
    // El SQL nos devuelve zonas_completas = ['MADRID CENTRO', 'BARCELONA GRÀCIA', ...]
    // Cuando el usuario elige Región='BARCELONA', filtramos esa lista para quedarnos
    // solo con las que empiezan por 'BARCELONA ' y luego extraemos la segunda parte.
    // Resultado: ['GRÀCIA', 'EIXAMPLE'] en vez de todas las subzonas mezcladas.
    function getSubzonasFiltradas() {
        if (!opciones) return []

        // Sin región específica → mostrar todas las subzonas disponibles
        if (filtros.region === 'Global') {
            return opciones.subzonas ?? []
        }

        // Con región específica → calcular subzonas que pertenecen a esa región
        const prefijo = filtros.region + ' '  // ej: 'BARCELONA '
        return (opciones.zonas_completas ?? [])
            .filter(z => z.startsWith(prefijo))        // solo las de esta región
            .map(z => z.slice(prefijo.length))          // quitar el prefijo de ciudad
            .filter((v, i, arr) => arr.indexOf(v) === i) // eliminar duplicados
            .sort()                                     // ordenar A-Z
    }

    // ── Construcción del array para <MenuFiltros> ────────────────────────────
    // Si las opciones aún no cargaron, pasamos null y MenuFiltros usa su mock interno.
    const subzonasFiltradas = getSubzonasFiltradas()

    const filtrosParaMenu = opciones
        ? [
            {
                // Un solo filtro de fecha: año, mes, rango o día. Los límites son
                // el primer y último año que existen en el data warehouse.
                label:       'Período',
                tipo:        'periodo',
                valorActual: { desde: filtros.desde, hasta: filtros.hasta },
                limites:     { min: `${Math.min(...opciones.anios)}-01-01`, max: `${Math.max(...opciones.anios)}-12-31` },
            },
            {
                label:       'Canal',
                opciones:    ['Todos', ...opciones.canales],
                valorActual: filtros.canal,
            },
            {
                label:       'Región',
                opciones:    ['Global', ...opciones.regiones],  // Global = sin filtro
                valorActual: filtros.region,
            },
            {
                // Las opciones de Zona cambian según la Región seleccionada.
                // Si no hay región → todas las subzonas. Si hay región → solo las suyas.
                label:       'Zona',
                opciones:    ['Global', ...subzonasFiltradas],
                valorActual: filtros.subzona,
            },
          ]
        : null

    return { filtros, handleFiltroChange, filtrosParaMenu }
}
