// ══════════════════════════════════════════════════════════════════════════════
// PaginaMapa.jsx — Página "Mapa"
//
// Pinta cada provincia de España en azul, más intenso cuanto más sesiones tiene
// (los mismos filtros del panel general aplican aquí). El selector de arriba
// cambia qué se cuenta: todas las sesiones, resueltas por IA o resueltas en el
// primer contacto.
//
// El mapa se puede acercar (botones o Ctrl/⌘ + rueda) y arrastrar. El ranking
// lista cada ciudad con sus zonas en una tabla; los checkboxes permiten dejar
// fuera zonas concretas y el mapa y los totales se recalculan.
//
// Por ahora solo hay datos de 7 ciudades; las demás provincias salen en gris.
// ══════════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from 'react'
import { ChevronRight, Maximize, Minus, Plus } from 'lucide-react'
import { MenuFiltros }  from '../components/MenuFiltros.jsx'
import { PageHeader }   from '../components/PageHeader.jsx'
import { Card, EstadoVacio } from '../components/Card.jsx'
import { useMapaData }  from '../hooks/useMapaData'
import { useZoomMapa }  from '../hooks/useZoomMapa'
import { formatoNumero } from '../lib/chartTheme'
import { PROVINCIAS, MAPA_VIEWBOX, MAPA_CANARIAS } from '../lib/spainProvincias'
import {
    METRICAS_MAPA, agruparPorCiudad, colorEscala, centroDePath,
    COLOR_ESCALA_MIN, COLOR_ESCALA_MAX, COLOR_SIN_DATOS,
} from '../lib/mapaEspana'

// Los centros no cambian, así que se calculan una sola vez
const CENTROS = Object.fromEntries(PROVINCIAS.map(p => [p.cod, centroDePath(p.d)]))

const pct = (parte, total) => total > 0 ? `${Math.round((parte / total) * 100)}%` : '—'

// Checkbox con su texto (se usa en las zonas de cada ciudad)
function Check({ checked, onChange, children }) {
    return (
        <label className="mapa-check">
            <input type="checkbox" checked={checked} onChange={onChange} />
            {children}
        </label>
    )
}

export function PaginaMapa({ filtros, valoresFiltro, onCambioFiltro, periodo }) {
    const { data, error } = useMapaData(valoresFiltro)
    const [metricaId, setMetricaId] = useState('todas')
    const [activa, setActiva] = useState(null)             // código de provincia bajo el cursor
    const [excluidas, setExcluidas] = useState(() => new Set())   // zonas desmarcadas
    const [abiertas, setAbiertas] = useState(() => new Set())      // ciudades con la tabla de zonas desplegada

    const {
        svgRef, eventosArrastre, viewBox, zoom,
        acercar, alejar, reiniciar, puedeAcercar, puedeAlejar,
    } = useZoomMapa({ ancho: MAPA_VIEWBOX.ancho, alto: MAPA_VIEWBOX.alto })
    const metrica = METRICAS_MAPA.find(m => m.id === metricaId)
    const campo = metrica.campo

    const ciudades = useMemo(() => agruparPorCiudad(data, excluidas), [data, excluidas])
    const porProvincia = useMemo(
        () => Object.fromEntries(ciudades.filter(c => c.cod).map(c => [c.cod, c])),
        [ciudades],
    )
    // Orden fijo según TODAS las zonas, para que las filas no salten al marcar/desmarcar
    const ranking = useMemo(
        () => [...ciudades].sort((a, b) => b.base[campo] - a.base[campo]),
        [ciudades, campo],
    )

    const maximo = Math.max(0, ...ciudades.map(c => c[campo]))
    const totalMetrica = ciudades.reduce((acc, c) => acc + c[campo], 0)
    const cargando = data === undefined
    const detalle = activa ? porProvincia[activa] : null

    // Provincias con sesiones: las demás quedan en gris
    const conDatos = PROVINCIAS.filter(p => porProvincia[p.cod]?.[campo] > 0)
    const sinDatos = PROVINCIAS.filter(p => !(porProvincia[p.cod]?.[campo] > 0))

    const ratioDe = ciudad => maximo > 0 ? ciudad[campo] / maximo : 0

    function alternarZona(clave) {
        setExcluidas(prev => {
            const sig = new Set(prev)
            if (sig.has(clave)) sig.delete(clave); else sig.add(clave)
            return sig
        })
    }

    function alternarDespliegue(clave) {
        setAbiertas(prev => {
            const sig = new Set(prev)
            if (sig.has(clave)) sig.delete(clave); else sig.add(clave)
            return sig
        })
    }

    // Tamaño de las etiquetas constante en pantalla aunque se haga zoom
    const tamanoEtiqueta = 13 / zoom

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
                        <>
                        <div className="mapa-contenedor">
                            <svg
                                ref={svgRef}
                                viewBox={viewBox}
                                role="group"
                                aria-label={`Mapa de España: ${metrica.descripcion} por provincia`}
                                className="mapa-svg"
                                {...eventosArrastre}
                            >
                                {/* Provincias sin datos primero, para que las coloreadas queden encima */}
                                {sinDatos.map(p => (
                                    <path key={p.cod} d={p.d} className="mapa-prov" fill={COLOR_SIN_DATOS}>
                                        <title>{p.nombre} · sin sesiones</title>
                                    </path>
                                ))}

                                {conDatos.map(p => {
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
                                            aria-label={`${ciudad.nombre}: ${formatoNumero.format(ciudad[campo])} ${metrica.descripcion}`}
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
                                {conDatos.map(p => {
                                    const ciudad = porProvincia[p.cod]
                                    const { textoClaro } = colorEscala(ratioDe(ciudad))
                                    const c = CENTROS[p.cod]
                                    return (
                                        <text
                                            key={p.cod}
                                            x={c.x} y={c.y}
                                            textAnchor="middle"
                                            className={`mapa-etiqueta ${textoClaro ? 'mapa-etiqueta-clara' : ''}`}
                                            style={{ fontSize: tamanoEtiqueta, strokeWidth: 3 / zoom }}
                                            aria-hidden="true"
                                        >
                                            {ciudad.nombre}
                                        </text>
                                    )
                                })}
                            </svg>

                            {/* Controles de zoom */}
                            <div className="mapa-zoom" role="group" aria-label="Zoom del mapa">
                                <button type="button" onClick={acercar} disabled={!puedeAcercar} aria-label="Acercar"><Plus size={18} aria-hidden="true" /></button>
                                <button type="button" onClick={alejar} disabled={!puedeAlejar} aria-label="Alejar"><Minus size={18} aria-hidden="true" /></button>
                                <button type="button" onClick={reiniciar} disabled={!puedeAlejar} aria-label="Ver todo el mapa"><Maximize size={16} aria-hidden="true" /></button>
                            </div>

                            {/* Detalle de la provincia bajo el cursor */}
                            <div className="mapa-detalle" aria-live="polite">
                                {detalle ? (
                                    <>
                                        <strong>{detalle.nombre}</strong>
                                        <span className="mapa-detalle-valor tabular">{formatoNumero.format(detalle[campo])}</span>
                                        <span>{metrica.descripcion}</span>
                                        {metrica.id !== 'todas' && (
                                            <span>{pct(detalle[campo], detalle.total)} de sus {formatoNumero.format(detalle.total)} sesiones</span>
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
                        <p className="mapa-ayuda">Ctrl/⌘ + rueda para acercar · arrastra para mover</p>
                        </>
                    )}
                </Card>

                {/* ── Ranking por ciudad, con sus zonas en tabla ─────────────── */}
                <Card
                    titulo="Ranking por ciudad"
                    subtitulo="Marca o desmarca zonas para filtrar el mapa"
                    accion={excluidas.size > 0 && (
                        <button type="button" className="boton-texto" onClick={() => setExcluidas(new Set())}>
                            Marcar todas
                        </button>
                    )}
                >
                    {cargando ? (
                        <EstadoVacio alto={300}>Cargando…</EstadoVacio>
                    ) : ranking.length === 0 ? (
                        <EstadoVacio alto={300} />
                    ) : (
                        <div className="mapa-ciudades">
                            {ranking.map(c => {
                                const marcadas = c.zonas.filter(z => z.incluida).length
                                const abierta = abiertas.has(c.clave)
                                return (
                                    <section
                                        key={c.clave}
                                        className="mapa-ciudad"
                                        data-activa={activa === c.cod || undefined}
                                        onMouseEnter={() => setActiva(c.cod ?? null)}
                                        onMouseLeave={() => setActiva(null)}
                                    >
                                        <button
                                            type="button"
                                            className="mapa-ciudad-cabecera"
                                            aria-expanded={abierta}
                                            aria-controls={`zonas-${c.clave}`}
                                            onClick={() => alternarDespliegue(c.clave)}
                                        >
                                            <ChevronRight size={18} aria-hidden="true" className="mapa-ciudad-flecha" />
                                            <span className="mapa-ciudad-nombre">{c.nombre}</span>
                                            {marcadas < c.zonas.length && (
                                                <span className="mapa-ciudad-parcial">{marcadas} de {c.zonas.length} zonas</span>
                                            )}
                                            <span className="mapa-ciudad-valor tabular">{formatoNumero.format(c[campo])}</span>
                                        </button>

                                        <div className="mapa-ranking-barra" aria-hidden="true">
                                            <span style={{ width: `${Math.round(ratioDe(c) * 100)}%`, background: colorEscala(Math.max(ratioDe(c), 0.35)).fill }} />
                                        </div>

                                        {abierta && (
                                        <table id={`zonas-${c.clave}`} className="data-table mapa-tabla">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Zona</th>
                                                    <th scope="col" style={{ textAlign: 'right' }}>{metrica.columna}</th>
                                                    {metrica.id !== 'todas' && <th scope="col" style={{ textAlign: 'right' }}>% de la zona</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...c.zonas].sort((a, b) => b[campo] - a[campo]).map(z => (
                                                    <tr key={z.clave} data-excluida={!z.incluida || undefined}>
                                                        <td>
                                                            <Check checked={z.incluida} onChange={() => alternarZona(z.clave)}>
                                                                {z.nombre}
                                                            </Check>
                                                        </td>
                                                        <td className="tabular" style={{ textAlign: 'right' }}>{formatoNumero.format(z[campo])}</td>
                                                        {metrica.id !== 'todas' && (
                                                            <td className="tabular" style={{ textAlign: 'right' }}>{pct(z[campo], z.total)}</td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        )}
                                    </section>
                                )
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </main>
    )
}
