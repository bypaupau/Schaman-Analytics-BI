// ══════════════════════════════════════════════════════════════════════════════
// useDashboardData.js
// Hook personalizado que orquesta TODOS los datos del dashboard.
//
// Qué hace:
//   - Cuando cambian los filtros (anio, mes, canal, region, subzona),
//     dispara 10 llamadas RPC a Supabase EN PARALELO con Promise.all
//   - Transforma las respuestas al formato que necesita cada componente
//   - Devuelve el estado listo para renderizar
//
// Por qué está aquí y no en App.jsx:
//   - App.jsx solo debe encargarse del layout (qué se muestra y dónde)
//   - La lógica de datos aquí es más fácil de mantener, testear y entender
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, createElement } from 'react'
import { Target, Zap, Timer, Smile, Bot }     from 'lucide-react'
import { supabase }                            from '../lib/supabase'

// ── Iconos para las 5 dimensiones del ScoreCard ─────────────────────────────
// Usamos createElement() en lugar de JSX (<Target />) porque este archivo
// tiene extensión .js y Vite no activa el parser JSX para archivos .js.
// createElement(Componente, props) es exactamente lo que hace el compilador
// JSX por dentro, así que el resultado es idéntico.
const ICONOS_DIM = {
    Precisión:    createElement(Target, { size: 13 }),
    Efectividad:  createElement(Zap,    { size: 13 }),
    Eficiencia:   createElement(Timer,  { size: 13 }),
    Experiencia:  createElement(Smile,  { size: 13 }),
    Proactividad: createElement(Bot,    { size: 13 }),
}

// ── Helper: formatea el NPS con su signo ("+42" o "-5") ─────────────────────
function formatNPS(val) {
    const n = Number(val)
    return n >= 0 ? `+${n}` : `${n}`
}

// ── Estado inicial de los KPI Cards mientras se espera la primera respuesta ──
// Muestra '—' para no confundir al usuario con valores en cero
const KPI_CARGANDO = [
    { KPINombre: 'FCR',        kpiLabel: 'Resolución al Primer Contacto', metricaKPI: '—', color: 'green',  tendencia: 'Cargando…', positivo: true },
    { KPINombre: 'TMO',        kpiLabel: 'Tiempo Medio de Operación',     metricaKPI: '—', color: 'blue',   tendencia: 'Cargando…', positivo: true },
    { KPINombre: 'T-NPS',      kpiLabel: 'Satisfacción del Cliente',      metricaKPI: '—', color: 'amber',  tendencia: 'Cargando…', positivo: true },
    { KPINombre: 'Tasa Éxito', kpiLabel: 'Sesiones Resueltas',            metricaKPI: '—', color: 'teal',   tendencia: 'Cargando…', positivo: true },
    { KPINombre: 'Deflection', kpiLabel: 'Resuelto por IA',               metricaKPI: '—', color: 'violet', tendencia: 'Cargando…', positivo: true },
]

// ════════════════════════════════════════════════════════════════════════════
export function useDashboardData(filtros) {
    // Cada variable de estado corresponde a una sección del dashboard.
    // undefined = "todavía no llegó data" → el componente usa su mock interno
    // []        = "llegó data pero estaba vacía" → el componente muestra "Sin datos"
    const [kpisData,     setKpisData]     = useState(KPI_CARGANDO)
    const [scoreData,    setScoreData]    = useState(undefined)
    const [dataLineal,   setDataLineal]   = useState(undefined)
    const [dataPie,      setDataPie]      = useState(undefined)
    const [dataBarras,   setDataBarras]   = useState(undefined)
    const [dataSesiones, setDataSesiones] = useState(undefined)

    // ── Re-fetch cada vez que cambia cualquier filtro ────────────────────────
    useEffect(() => {
        const { anio, mes, canal, region, subzona } = filtros

        async function fetchTodo() {

            // Llamamos los 10 RPCs al mismo tiempo (no uno por uno) para que
            // el dashboard cargue lo más rápido posible.
            // Promise.all espera a que TODOS terminen antes de continuar.
            const [
                rFcr, rTmo, rNps, rExito, rDefl,   // KPI Cards
                rScore,                              // Score Global
                rLineal, rPie, rBarras,             // Gráficos
                rSesiones,                          // Tabla inferior
            ] = await Promise.all([
                supabase.rpc('get_kpi_fcr',                  { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona }),
                supabase.rpc('get_kpi_tmo',                  { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona }),
                supabase.rpc('get_kpi_tnps',                 { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona }),
                supabase.rpc('get_kpi_tasa_exito',           { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona }),
                supabase.rpc('get_kpi_deflection',           { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona }),
                supabase.rpc('get_score_global',             { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona }),
                supabase.rpc('get_chart_fcr_tmo_mensual',    { p_anio: anio,             p_canal: canal, p_region: region, p_subzona: subzona }), supabase.rpc('get_chart_distribucion_canal', { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona }),                supabase.rpc('get_chart_exito_zona',         { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona }),
                supabase.rpc('get_sesiones_recientes',       { p_anio: anio, p_mes: mes, p_canal: canal, p_region: region, p_subzona: subzona, p_limit: 20 }),
            ])

            // Imprime en consola cualquier error de RPC para facilitar el debug
            ;[rFcr, rTmo, rNps, rExito, rDefl, rScore, rLineal, rPie, rBarras, rSesiones]
                .forEach(r => { if (r.error) console.error('❌ RPC error:', r.error.message) })

            // ── KPI Cards: tomamos la primera (y única) fila de cada respuesta ──
            const fcr   = rFcr.data?.[0]
            const tmo   = rTmo.data?.[0]
            const nps   = rNps.data?.[0]
            const exito = rExito.data?.[0]
            const defl  = rDefl.data?.[0]

            // Guardamos los 5 KPIs ya transformados al formato que espera KPICard.
            // Comprobamos el VALOR (no solo si el objeto existe) porque el DW puede
            // devolver una fila con valores null cuando no hay sesiones en ese período.
            setKpisData([
                {
                    KPINombre:  'FCR',
                    kpiLabel:   'Resolución al Primer Contacto',
                    metricaKPI: fcr?.fcr_pct != null ? `${fcr.fcr_pct}%` : '—',
                    textoKPI:   fcr?.total_sesiones > 0
                        ? `${Number(fcr.total_sesiones).toLocaleString()} sesiones analizadas`
                        : 'Sin datos para el período',
                    color: 'green', tendencia: 'Primer contacto', positivo: true,
                },
                {
                    KPINombre:  'TMO',
                    kpiLabel:   'Tiempo Medio de Operación',
                    metricaKPI: tmo?.tmo_segundos != null ? `${tmo.tmo_segundos}s` : '—',
                    textoKPI:   tmo?.tmo_minutos != null
                        ? `${tmo.tmo_minutos} min promedio por sesión`
                        : 'Sin datos para el período',
                    color: 'blue', tendencia: 'Duración promedio', positivo: true,
                },
                {
                    KPINombre:  'T-NPS',
                    kpiLabel:   'Satisfacción del Cliente',
                    metricaKPI: nps?.tnps_score != null ? formatNPS(nps.tnps_score) : '—',
                    textoKPI:   nps?.promotores_pct != null
                        ? `Promotores ${nps.promotores_pct}% · Detractores ${nps.detractores_pct}%`
                        : 'Sin datos para el período',
                    color: 'amber', tendencia: 'Net Promoter Score',
                    positivo: nps?.tnps_score != null ? Number(nps.tnps_score) >= 0 : true,
                },
                {
                    KPINombre:  'Tasa Éxito',
                    kpiLabel:   'Sesiones Resueltas',
                    metricaKPI: exito?.tasa_exito_pct != null ? `${exito.tasa_exito_pct}%` : '—',
                    textoKPI:   exito?.sesiones_resueltas > 0
                        ? `${Number(exito.sesiones_resueltas).toLocaleString()} sesiones resueltas`
                        : 'Sin datos para el período',
                    color: 'teal', tendencia: 'Resolución efectiva', positivo: true,
                },
                {
                    KPINombre:  'Deflection',
                    kpiLabel:   'Resuelto por IA',
                    metricaKPI: defl?.deflection_pct != null ? `${defl.deflection_pct}%` : '—',
                    textoKPI:   defl?.resueltas_por_ia > 0
                        ? `${Number(defl.resueltas_por_ia).toLocaleString()} sesiones por IA`
                        : 'Sin datos para el período',
                    color: 'violet', tendencia: '↑ Meta: 70%', positivo: true,
                },
            ])

            // ── Score Global: transformamos columnas planas → array dimensiones[] ──
            // El SQL devuelve { score_total, precision, efectividad, eficiencia, experiencia, proactividad }
            // ScoreCard necesita: score (número) + dimensiones [{ nombre, valor, icono }]
            const s = rScore.data?.[0]
            if (s) {
                setScoreData({
                    score: Math.round(s.score_total),
                    dimensiones: [
                        { nombre: 'Precisión',    valor: Math.round(s.cobertura),    icono: ICONOS_DIM.Precisión    },
                        { nombre: 'Efectividad',  valor: Math.round(s.efectividad),  icono: ICONOS_DIM.Efectividad  },
                        { nombre: 'Eficiencia',   valor: Math.round(s.eficiencia),   icono: ICONOS_DIM.Eficiencia   },
                        { nombre: 'Experiencia',  valor: Math.round(s.experiencia),  icono: ICONOS_DIM.Experiencia  },
                        { nombre: 'Proactividad', valor: Math.round(s.proactividad), icono: ICONOS_DIM.Proactividad },
                    ],
                })
            }

            // ── Gráficos ─────────────────────────────────────────────────────
            const hayDatosEnElFiltro = Number(fcr?.total_sesiones) > 0;

            // 2. Si NO hay datos, forzamos el gráfico lineal a vacío ([]).
            if (!hayDatosEnElFiltro) {
                setDataLineal([]);
            } else {
                setDataLineal(!rLineal.error ? (rLineal.data ?? []) : []);
            }

            // Los demás se quedan igual
            if (!rPie.error)      setDataPie(rPie.data           ?? [])
            if (!rBarras.error)   setDataBarras(rBarras.data     ?? [])
            if (!rSesiones.error) setDataSesiones(rSesiones.data ?? [])
        }

        fetchTodo()
    }, [filtros])  // dependencia: cualquier cambio en filtros dispara el fetch

    return { kpisData, scoreData, dataLineal, dataPie, dataBarras, dataSesiones }
}
