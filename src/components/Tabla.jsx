// Tabla.jsx ─ Sesiones recientes — nivel más detallado del triángulo invertido
// Usa los mismos colores que el resto del dashboard:
//   - Canal: el mismo color de identidad que en el donut (colorCanal)
//   - NPS y Estado: colores de estado + texto, nunca color solo

import { ArrowDown, ArrowUp, Bot, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronsUpDown, Globe, Headset, Mail, MessageCircle, MessagesSquare, Search, Smartphone } from 'lucide-react'
import { Fragment } from 'react'
import { Card } from './Card.jsx'
import { STATUS, colorCanal, formatoNumero, normalizar } from '../lib/chartTheme'

const dataMock = [
    { id: 'Ses-8841', cliente: 'Ana Torres',   canal: 'Chat',    zona: 'Centro', duracion: '187s', resueltoPrimerContacto: 'No', resueltaIA: 'Sí', nps: 9,  estado: 'Exitosa'   },
    { id: 'Ses-8842', cliente: 'Luis Méndez',  canal: 'Llamada', zona: 'Norte',  duracion: '412s', resueltoPrimerContacto: 'Sí', resueltaIA: 'No', nps: 6,  estado: 'Pendiente'  },
    { id: 'Ses-8843', cliente: 'María López',  canal: 'Email',   zona: 'Sur',    duracion: '95s',  resueltoPrimerContacto: 'Sí', resueltaIA: 'Sí', nps: 8,  estado: 'Exitosa'   },
    { id: 'Ses-8844', cliente: 'Carlos Ruiz',  canal: 'App',     zona: 'Centro', duracion: '320s', resueltoPrimerContacto: 'No', resueltaIA: 'No', nps: 4,  estado: 'Pendiente'  },
    { id: 'Ses-8845', cliente: 'Sofía Mora',   canal: 'Chat',    zona: 'Norte',  duracion: '210s', resueltoPrimerContacto: 'Sí', resueltaIA: 'Sí', nps: 10, estado: 'Exitosa'   },
]

// NPS: ≥9 promotor, 7-8 pasivo, ≤6 detractor
function npsInfo(n) {
    if (n >= 9) return { ...STATUS.good,     label: 'Promotor'  }
    if (n >= 7) return { ...STATUS.warning,  label: 'Pasivo'    }
    return              { ...STATUS.critical, label: 'Detractor' }
}

// Ícono de cada canal (se muestra junto al punto de color y el nombre)
const ICONOS_CANAL = {
    'app movil':   Smartphone,
    'call center': Headset,
    'web chat':    MessagesSquare,
    'email':       Mail,
    'whatsapp':    MessageCircle,
}

function iconoCanal(canal) {
    return ICONOS_CANAL[normalizar(canal)] ?? Globe
}

function estadoInfo(estado) {
    switch (normalizar(estado)) {
        case 'exitosa':    return STATUS.good
        case 'escalado':   return STATUS.warning
        case 'pendiente':  return STATUS.warning
        case 'abandonado': return STATUS.critical
        default:           return STATUS.neutral
    }
}

// Los estados llegan en mayúsculas (ESCALADO) o capitalizados (Exitosa):
// los mostramos siempre como "Escalado" para tener un solo formato.
function formatoEstado(estado) {
    const t = String(estado ?? '').toLowerCase()
    return t.charAt(0).toUpperCase() + t.slice(1)
}

// `orden` es la clave con la que se ordena esa columna en la base de datos y `ordenInicial` la dirección
// del primer clic (fechas, números y Sí/No arrancan de mayor a menor; los textos, de A a Z).
// `ayuda` es el texto del tooltip que aparece al pasar el cursor (o enfocar) el encabezado.
// Cada salto de línea (\n) se muestra como un párrafo aparte. Cuando la columna alimenta un
// KPI o gráfico del panel general, el texto lo dice para que se entienda para qué sirve.
const COLS = [
    {
        label: 'ID sesión',
        orden: 'id', ordenInicial: 'desc',
        ayuda: 'Identificador único de la sesión en el data warehouse (por ejemplo, SES-0042). Se puede usar en el buscador para encontrar una sesión concreta.',
    },
    {
        label: 'Cliente',
        orden: 'cliente', ordenInicial: 'asc',
        ayuda: 'Persona que contactó con el servicio de atención en esta sesión.',
    },
    {
        label: 'Fecha',
        orden: 'fecha', ordenInicial: 'desc',
        ayuda: 'Día en que se realizó la sesión (día/mes/año). Las sesiones se ordenan de la más reciente a la más antigua.\nSe puede buscar escribiendo la fecha, por ejemplo 23/12/2025 o 2025-12-23.',
    },
    {
        label: 'Canal',
        orden: 'canal', ordenInicial: 'asc',
        ayuda: 'Medio por el que el cliente inició la sesión: app móvil, call center, web chat, email o WhatsApp.\nEs lo que se mide en el gráfico "Distribución por canal" del dashboard.',
    },
    {
        label: 'Zona',
        orden: 'zona', ordenInicial: 'asc',
        ayuda: 'Ciudad y zona donde vive el cliente (por ejemplo, Madrid Norte).\nSe usa en el gráfico "Tasa de éxito por zona" del dashboard y en la página Mapa.',
    },
    {
        label: 'Duración',
        orden: 'duracion', ordenInicial: 'desc', estrecha: true,
        ayuda: 'Cuánto duró la sesión, en segundos.\nEl promedio de todas las sesiones es el TMO (tiempo medio de operación) del dashboard: cuanto más bajo, más rápido se atiende al cliente.',
    },
    {
        label: '¿Resuelto\nal 1er\ncontacto?',
        orden: 'primer', ordenInicial: 'desc', estrecha: true,
        ayuda: 'Sí: el problema quedó resuelto en la primera interacción, sin que el cliente tuviera que volver a contactar.\nNo: el cliente tuvo que contactar otra vez.\nSin dato: no se registró.\nEl porcentaje de «Sí» es el FCR (resolución al primer contacto) del dashboard: muestra qué tan bien se diagnostica el problema desde el inicio.',
    },
    {
        label: 'Resuelta\nIA',
        orden: 'ia', ordenInicial: 'desc', estrecha: true,
        ayuda: 'Sí: la IA resolvió la sesión por completo, sin intervención de un agente humano.\nNo: participó un agente.\nEl porcentaje de «Sí» es la "Resolución por IA" del dashboard: muestra cuántos contactos se resuelven de forma automática, lo que reduce la carga y el costo de los agentes.',
    },
    {
        label: 'NPS',
        orden: 'nps', ordenInicial: 'desc',
        ayuda: 'Nota de satisfacción que el cliente da al terminar la sesión, de 0 a 10.\nPromotor (9–10): cliente muy satisfecho, que recomendaría el servicio.\nPasivo (7–8): satisfecho, pero sin entusiasmo; es poco probable que lo recomiende.\nDetractor (0–6): insatisfecho; puede hablar mal del servicio.\nEl T-NPS del dashboard es el % de promotores menos el % de detractores (va de −100 a +100).',
    },
    {
        label: 'Estado',
        orden: 'estado', ordenInicial: 'asc',
        ayuda: 'Cómo terminó la sesión.\nExitosa: el problema se resolvió.\nEscalado: se derivó a otro nivel de atención, como un supervisor o un técnico.\nPendiente: quedó a la espera de una respuesta del cliente.\nAbandonado: el cliente dejó la sesión sin resolverse.\nEl % de sesiones exitosas es la "Tasa de éxito" del dashboard.',
    },
]

// '2025-12-23' → '23/12/2025' (sin pasar por Date, para evitar desfases de zona horaria)
function formatoFecha(iso) {
    const m = String(iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
    return m ? `${m[3]}/${m[2]}/${m[1]}` : '—'
}

// Convierte el texto de ayuda en párrafos; lo que va antes de ":" (el subtítulo) sale en negrita.
// Solo cuenta como subtítulo un texto corto sin puntos, para no poner en negrita frases largas.
function Ayuda({ texto }) {
    return texto.split('\n').map((linea, i) => {
        const m = linea.match(/^([^:.]{1,28}:)\s*(.*)$/)
        return (
            <span key={i} className="col-tip-linea">
                {m ? <><strong>{m[1]}</strong> {m[2]}</> : linea}
            </span>
        )
    })
}

// Props:
//   data             → filas de la página actual (la paginación la hace la base de datos)
//   busqueda         → texto del buscador (controlado por la página)
//   onBusquedaChange → si se pasa, se muestra el buscador; la búsqueda la hace la base de datos
//   orden            → lista [{ columna, direccion }] con que vienen ordenadas las filas (hasta 3 criterios)
//   onOrdenChange    → si se pasa, los encabezados se vuelven botones para ordenar (lo hace la base de datos)
//   total            → coincidencias totales en la base, de todas las páginas
//   pagina, totalPaginas, porPagina → posición actual y tamaño de página
//   opcionesPorPagina → opciones del selector de filas por página
//   onPaginaChange(n), onPorPaginaChange(n) → si se pasa onPaginaChange se muestran los controles de paginación
//   cargando         → true mientras llega la respuesta
export function Tabla({
    data = dataMock, busqueda = '', onBusquedaChange, orden, onOrdenChange,
    total = data.length, pagina = 1, totalPaginas = 1, porPagina = data.length || 10, opcionesPorPagina = [],
    onPaginaChange, onPorPaginaChange, cargando = false,
}) {
    const consulta = busqueda.trim()

    // Cada clic avanza la columna un paso: dirección natural → dirección contraria → sin orden.
    //   · clic             → ordena solo por esa columna (reemplaza cualquier otro orden)
    //   · Mayús + clic     → la suma (o avanza/quita) en una lista de hasta 3 criterios
    const criterios = orden ?? []
    function siguienteDireccion(col, actual) {
        const primera = col.ordenInicial
        if (!actual) return primera
        return actual === primera ? (primera === 'asc' ? 'desc' : 'asc') : null
    }
    function ordenarPor(col, e) {
        const actual = criterios.find(o => o.columna === col.orden)?.direccion
        const siguiente = siguienteDireccion(col, actual)

        if (!e.shiftKey) {
            onOrdenChange(siguiente ? [{ columna: col.orden, direccion: siguiente }] : [])
        } else if (actual) {
            onOrdenChange(criterios
                .map(o => (o.columna === col.orden ? { ...o, direccion: siguiente } : o))
                .filter(o => o.direccion))
        } else if (criterios.length < 3) {
            onOrdenChange([...criterios, { columna: col.orden, direccion: siguiente }])
        }
    }

    const inicio = (pagina - 1) * porPagina

    // Lo escrito en el campo de página se aplica al pulsar Enter o al salir del campo
    function aplicarPaginaEscrita(e) {
        const n = parseInt(e.target.value, 10)
        if (Number.isNaN(n)) { e.target.value = pagina; return }
        const valida = Math.min(Math.max(1, n), totalPaginas)
        e.target.value = valida
        if (valida !== pagina) onPaginaChange(valida)
    }

    return (
        <Card
            titulo="Sesiones recientes"
            subtitulo={onOrdenChange
                ? 'Últimas sesiones registradas con los filtros aplicados · Mayús + clic en un encabezado para ordenar por varias columnas'
                : 'Últimas sesiones registradas con los filtros aplicados'}
            bodyStyle={{ padding: '12px 0 0' }}
            accion={onBusquedaChange && (
                <label className="buscador">
                    <Search size={16} aria-hidden="true" />
                    <input
                        type="search"
                        value={busqueda}
                        onChange={e => onBusquedaChange(e.target.value)}
                        placeholder="Buscar por ID, cliente o fecha"
                        aria-label="Buscar sesión por ID, nombre del cliente o fecha"
                        autoComplete="off"
                    />
                </label>
            )}
        >
            <div style={{ overflowX: 'auto', minHeight: 200, opacity: cargando && data.length > 0 ? 0.55 : 1, transition: 'opacity 0.15s ease' }} aria-busy={cargando}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {COLS.map((col, i) => {
                                const posicion = onOrdenChange ? criterios.findIndex(o => o.columna === col.orden) : -1
                                const activa = posicion >= 0
                                const direccion = activa ? criterios[posicion].direccion : null
                                const etiqueta = col.label.split('\n').map((linea, j) => j === 0 ? linea : <Fragment key={j}><br />{linea}</Fragment>)
                                return (
                                    <th
                                        key={col.label}
                                        scope="col"
                                        className={col.estrecha ? 'col-estrecha' : undefined}
                                        style={{ textAlign: col.align ?? 'left' }}
                                        aria-sort={posicion === 0 ? (direccion === 'asc' ? 'ascending' : 'descending') : undefined}
                                    >
                                        {/* Las últimas columnas anclan el tooltip a la derecha para que no se salga de la tabla */}
                                        <span className="col-tip" data-ancla={i >= COLS.length - 3 ? 'derecha' : undefined}>
                                            {onOrdenChange ? (
                                                <button
                                                    type="button"
                                                    className="col-orden"
                                                    data-activa={activa || undefined}
                                                    aria-describedby={`ayuda-col-${i}`}
                                                    aria-label={`Ordenar por ${col.label.replace(/\n/g, ' ')}`}
                                                    onClick={e => ordenarPor(col, e)}
                                                >
                                                    <span>{etiqueta}</span>
                                                    {activa
                                                        ? (direccion === 'asc' ? <ArrowUp size={14} aria-hidden="true" /> : <ArrowDown size={14} aria-hidden="true" />)
                                                        : <ChevronsUpDown size={14} aria-hidden="true" className="col-orden-inactivo" />}
                                                    {activa && criterios.length > 1 && <span className="col-orden-n" aria-hidden="true">{posicion + 1}</span>}
                                                </button>
                                            ) : (
                                                <span tabIndex={0} aria-describedby={`ayuda-col-${i}`}>{etiqueta}</span>
                                            )}
                                            <span role="tooltip" id={`ayuda-col-${i}`} className="col-tip-texto"><Ayuda texto={col.ayuda} /></span>
                                        </span>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={COLS.length} className="empty-state" style={{ height: 120 }}>
                                    {cargando ? 'Cargando sesiones…' : consulta ? `Ninguna sesión coincide con «${consulta}»` : 'Sin sesiones para este filtro'}
                                </td>
                            </tr>
                        )}
                        {data.map((s, i) => {
                            const nps    = npsInfo(s.nps)
                            const estado = estadoInfo(s.estado)
                            const IconoCanal = iconoCanal(s.canal)
                            return (
                                <tr key={i}>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-light)' }}>
                                        {s.id}
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                                        {s.cliente}
                                    </td>
                                    <td className="tabular">{formatoFecha(s.fecha)}</td>
                                    {/* Canal: punto con el mismo color que en el donut */}
                                    <td>
                                        <span className="chip" style={{ background: `color-mix(in srgb, ${colorCanal(s.canal)} 14%, white)`, color: 'var(--text-muted)', boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${colorCanal(s.canal)} 28%, white)` }}>
                                            <IconoCanal size={14} strokeWidth={2.2} aria-hidden="true" />
                                            {s.canal}
                                        </span>
                                    </td>
                                    <td>{s.zona}</td>
                                    <td className="col-estrecha" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{s.duracion}</td>
                                    <td className="col-estrecha" style={{ color: s.resueltoPrimerContacto === 'Sí' ? 'var(--status-good-ink)' : s.resueltoPrimerContacto === 'No' ? 'var(--text)' : 'var(--text-light)', fontWeight: s.resueltoPrimerContacto === 'Sí' ? 600 : 400 }}>
                                        {s.resueltoPrimerContacto}
                                    </td>
                                    <td className="col-estrecha">
                                        {s.resueltaIA === 'Sí'
                                            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--status-good-ink)', fontWeight: 600 }}><Bot size={16} aria-hidden="true" />Sí</span>
                                            : <span style={{ color: 'var(--text-light)' }}>No</span>}
                                    </td>
                                    {/* NPS: número + categoría (el color refuerza, no reemplaza) */}
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
                                            <strong style={{ fontSize: 15, color: nps.ink }}>{s.nps}</strong>
                                            <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{nps.label}</span>
                                        </span>
                                    </td>
                                    {/* Estado con badge */}
                                    <td>
                                        <span className="chip" style={{ background: estado.soft, color: estado.ink }}>
                                            <span className="dot" style={{ background: estado.fill }} />
                                            {formatoEstado(s.estado)}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            {onPaginaChange && total > 0 && (
                <nav className="table-pagination" aria-label="Paginación de sesiones">
                    <div className="table-pagination-info">
                        <span aria-live="polite">
                            Mostrando {formatoNumero.format(inicio + 1)}–{formatoNumero.format(Math.min(inicio + porPagina, total))} de {formatoNumero.format(total)} sesiones
                        </span>
                        {onPorPaginaChange && (
                            <label className="table-pagination-filas">
                                <span>Filas por página</span>
                                <select value={porPagina} onChange={e => onPorPaginaChange(Number(e.target.value))}>
                                    {opcionesPorPagina.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </label>
                        )}
                    </div>

                    <div className="table-pagination-controls">
                        <button type="button" onClick={() => onPaginaChange(1)} disabled={pagina === 1} aria-label="Primera página" title="Primera página">
                            <ChevronsLeft size={16} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => onPaginaChange(pagina - 1)} disabled={pagina === 1} aria-label="Página anterior">
                            <ChevronLeft size={16} aria-hidden="true" /> Anterior
                        </button>

                        <label className="table-pagination-ir">
                            <span>Página</span>
                            {/* key: al cambiar de página el campo se vuelve a crear con el número nuevo */}
                            <input
                                key={pagina}
                                type="number"
                                min={1}
                                max={totalPaginas}
                                defaultValue={pagina}
                                aria-label={`Ir a la página (de 1 a ${totalPaginas})`}
                                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
                                onBlur={aplicarPaginaEscrita}
                            />
                            <span>de {formatoNumero.format(totalPaginas)}</span>
                        </label>

                        <button type="button" onClick={() => onPaginaChange(pagina + 1)} disabled={pagina === totalPaginas} aria-label="Página siguiente">
                            Siguiente <ChevronRight size={16} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => onPaginaChange(totalPaginas)} disabled={pagina === totalPaginas} aria-label="Última página" title="Última página">
                            <ChevronsRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </nav>
            )}
        </Card>
    )
}
