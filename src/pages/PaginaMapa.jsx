// ══════════════════════════════════════════════════════════════════════════════
// PaginaMapa.jsx — Página "Mapa"
//
// Pinta cada provincia de España en azul, más intenso cuanto más sesiones tiene
// (los mismos filtros del panel general aplican aquí). El selector de arriba
// cambia qué se cuenta: todas las sesiones, resueltas por IA o resueltas en el
// primer contacto.
//
// Por ahora solo hay datos de 7 ciudades; las demás provincias salen en gris.
// ══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react'
import { MenuFiltros }  from '../components/MenuFiltros.jsx'
import { PageHeader }   from '../components/PageHeader.jsx'
import { Card, EstadoVacio } from '../components/Card.jsx'
import { useMapaData }  from '../hooks/useMapaData'
import { formatoNumero } from '../lib/chartTheme'
import { PROVINCIAS, MAPA_VIEWBOX, MAPA_CANARIAS } from '../lib/spainProvincias'
import {
    METRICAS_MAPA, agruparPorCiudad, colorEscala, centroDePath,
    COLOR_ESCALA_MIN, COLOR_ESCALA_MAX, COLOR_SIN_DATOS,
} from '../lib/mapaEspana'

// Los centros no cambian, así que se calculan una sola vez
const CENTROS = Object.fromEntries(PROVINCIAS.map(p => [p.cod, centroDePath(p.d)]))

const pct = (parte, total) => total > 0 ? `${Math.round((parte / total) * 100)}%` : '—'

export function PaginaMapa({ filtros, valoresFiltro, onCambioFiltro, periodo }) {
    const { data, error } = useMapaData(valoresFiltro)
    const [metricaId, setMetricaId] = useState('todas')
    const [activa, setActiva] = useState(null)   // código de provincia bajo el cursor

    const metrica = METRICAS_MAPA.find(m => m.id === metricaId)

    const ciudades = useMemo(() => agruparPorCiudad(data), [data])
    const porProvincia = useMemo(
        () => Object.fromEntries(ciudades.filter(c => c.cod).map(c => [c.cod, c])),
        [ciudades],
    )
    const ranking = useMemo(
        () => [...ciudades].sort((a, b) => b[metrica.campo] - a[metrica.campo]),
        [ciudades, metrica],
    )

    const maximo  = Math.max(0, ...ciudades.map(c => c[metrica.campo]))
    const totalMetrica = ciudades.reduce((acc, c) => acc + c[metrica.campo], 0)
    const cargando = data === undefined
    const detalle = activa ? porProvincia[activa] : null

    function ratioDe(ciudad) {
        return maximo > 0 ? ciudad[metrica.campo] / maximo : 0
    }

    return (
        <main className="page">
            <PageHeader
                titulo="Mapa"
                subtitulo={`Sesiones por zona · España · ${periodo}`}
            />

            <MenuFiltros filtros={filtros} onCambio={onCambioFiltro} />

            {error && (
                <div role="alert" className="aviso-error">
                    <strong>No se pudo cargar el mapa.</strong> <span>{error}</span>{' '}
                    <span>Revisa que la función get_mapa_sesiones exista en Supabase.</span>
                </div>
            )}

            <div className="mapa-layout">
                {/* ── Mapa ──────────────────────────────────────────────────── */}
                <Card
                    titulo="Sesiones por provincia"
                    subtitulo="Más intenso = más sesiones"
                    accion={
                        <div className="segmented" role="radiogroup" aria-label="Qué sesiones mostrar">
                            {METRICAS_MAPA.map(m => (
                                <button
                                    key={m.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={m.id === metricaId}
                                    onClick={() => setMetricaId(m.id)}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    }
                >
                    {cargando ? (
                        <EstadoVacio alto={460}>Cargando mapa…</EstadoVacio>
                    ) : ciudades.length === 0 ? (
                        <EstadoVacio alto={460} />
                    ) : (
                        <div className="mapa-contenedor">
                            <svg
                                viewBox={`0 0 ${MAPA_VIEWBOX.ancho} ${MAPA_VIEWBOX.alto}`}
                                role="group"
                                aria-label={`Mapa de España: ${metrica.descripcion} por provincia`}
                                className="mapa-svg"
                            >
                                {/* Provincias sin datos primero, para que las coloreadas queden encima */}
                                {PROVINCIAS.filter(p => !porProvincia[p.cod]).map(p => (
                                    <path key={p.cod} d={p.d} className="mapa-prov" fill={COLOR_SIN_DATOS}>
                                        <title>{p.nombre} · sin sesiones registradas</title>
                                    </path>
                                ))}

                                {PROVINCIAS.filter(p => porProvincia[p.cod]).map(p => {
                                    const ciudad = porProvincia[p.cod]
                                    const { fill } = colorEscala(ratioDe(ciudad))
                                    return (
                                        <path
                                            key={p.cod}
                                            d={p.d}
                                            className="mapa-prov mapa-prov-datos"
                                            data-activa={activa === p.cod || undefined}
                                            fill={fill}
                                            tabIndex={0}
                                            role="img"
                                            aria-label={`${ciudad.nombre}: ${formatoNumero.format(ciudad[metrica.campo])} ${metrica.descripcion}`}
                                            onMouseEnter={() => setActiva(p.cod)}
                                            onMouseLeave={() => setActiva(null)}
                                            onFocus={() => setActiva(p.cod)}
                                            onBlur={() => setActiva(null)}
                                        />
                                    )
                                })}

                                {/* Recuadro de Canarias (están reubicadas abajo a la izquierda) */}
                                <rect
                                    x={MAPA_CANARIAS.x} y={MAPA_CANARIAS.y}
                                    width={MAPA_CANARIAS.ancho} height={MAPA_CANARIAS.alto}
                                    className="mapa-recuadro" rx="8"
                                />

                                {/* Etiquetas de las ciudades con datos */}
                                {PROVINCIAS.filter(p => porProvincia[p.cod]).map(p => {
                                    const ciudad = porProvincia[p.cod]
                                    const { textoClaro } = colorEscala(ratioDe(ciudad))
                                    const c = CENTROS[p.cod]
                                    return (
                                        <text
                                            key={p.cod}
                                            x={c.x} y={c.y}
                                            textAnchor="middle"
                                            className={`mapa-etiqueta ${textoClaro ? 'mapa-etiqueta-clara' : ''}`}
                                            aria-hidden="true"
                                        >
                                            {ciudad.nombre}
                                        </text>
                                    )
                                })}
                            </svg>

                            {/* Detalle de la provincia bajo el cursor */}
                            <div className="mapa-detalle" aria-live="polite">
                                {detalle ? (
                                    <>
                                        <strong>{detalle.nombre}</strong>
                                        <span className="mapa-detalle-valor tabular">{formatoNumero.format(detalle[metrica.campo])}</span>
                                        <span>{metrica.descripcion}</span>
                                        {metrica.id !== 'todas' && (
                                            <span>{pct(detalle[metrica.campo], detalle.total)} de sus {formatoNumero.format(detalle.total)} sesiones</span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <strong>España</strong>
                                        <span className="mapa-detalle-valor tabular">{formatoNumero.format(totalMetrica)}</span>
                                        <span>{metrica.descripcion}</span>
                                        <span>Pasa el cursor por una provincia</span>
                                    </>
                                )}
                            </div>

                            {/* Leyenda de la escala */}
                            <div className="mapa-leyenda">
                                <span className="mapa-leyenda-item">
                                    <span className="mapa-leyenda-muestra" style={{ background: COLOR_SIN_DATOS }} />
                                    Sin sesiones
                                </span>
                                <span className="mapa-leyenda-item">
                                    <span className="tabular">0</span>
                                    <span className="mapa-leyenda-barra" style={{ background: `linear-gradient(90deg, ${COLOR_ESCALA_MIN}, ${COLOR_ESCALA_MAX})` }} />
                                    <span className="tabular">{formatoNumero.format(maximo)}</span>
                                </span>
                            </div>
                        </div>
                    )}
                </Card>

                {/* ── Ranking por ciudad ────────────────────────────────────── */}
                <Card titulo="Ranking por ciudad" subtitulo={`Ordenado por ${metrica.descripcion}`}>
                    {cargando ? (
                        <EstadoVacio alto={300}>Cargando…</EstadoVacio>
                    ) : ranking.length === 0 ? (
                        <EstadoVacio alto={300} />
                    ) : (
                        <ol className="mapa-ranking">
                            {ranking.map(c => (
                                <li
                                    key={c.clave}
                                    className="mapa-ranking-fila"
                                    data-activa={activa === c.cod || undefined}
                                    onMouseEnter={() => setActiva(c.cod ?? null)}
                                    onMouseLeave={() => setActiva(null)}
                                >
                                    <div className="mapa-ranking-linea">
                                        <span className="mapa-ranking-nombre">{c.nombre}</span>
                                        <span className="mapa-ranking-valor tabular">{formatoNumero.format(c[metrica.campo])}</span>
                                    </div>
                                    <div className="mapa-ranking-barra" aria-hidden="true">
                                        <span style={{ width: `${Math.round(ratioDe(c) * 100)}%`, background: colorEscala(Math.max(ratioDe(c), 0.35)).fill }} />
                                    </div>
                                    <p className="mapa-ranking-zonas">
                                        {metrica.id !== 'todas' && <>{pct(c[metrica.campo], c.total)} del total de la ciudad · </>}
                                        {c.zonas.map(z => `${z.nombre} ${formatoNumero.format(z[metrica.campo])}`).join(' · ')}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>
            </div>
        </main>
    )
}
