// Tabla.jsx ─ Sesiones recientes — nivel más detallado del triángulo invertido
// Usa los mismos colores que el resto del dashboard:
//   - Canal: el mismo color de identidad que en el donut (colorCanal)
//   - NPS y Estado: colores de estado + texto, nunca color solo

import { Bot, ChevronLeft, ChevronRight, Globe, Headset, Mail, MessageCircle, MessagesSquare, Search, Smartphone } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
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

// `ayuda` es el texto del tooltip que aparece al pasar el cursor (o enfocar) el encabezado.
// Cada salto de línea (\n) se muestra como un párrafo aparte. Cuando la columna alimenta un
// KPI o gráfico del panel general, el texto lo dice para que se entienda para qué sirve.
const COLS = [
    {
        label: 'ID sesión',
        ayuda: 'Identificador único de la sesión en el data warehouse (por ejemplo, SES-0042). Se puede usar en el buscador para encontrar una sesión concreta.',
    },
    {
        label: 'Cliente',
        ayuda: 'Persona que contactó con el servicio de atención en esta sesión.',
    },
    {
        label: 'Fecha',
        ayuda: 'Día en que se realizó la sesión (día/mes/año). Las sesiones se ordenan de la más reciente a la más antigua.\nSe puede buscar escribiendo la fecha, por ejemplo 23/12/2025 o 2025-12-23.',
    },
    {
        label: 'Canal',
        ayuda: 'Medio por el que el cliente inició la sesión: app móvil, call center, web chat, email o WhatsApp.\nEs lo que se mide en el gráfico "Distribución por canal" del dashboard.',
    },
    {
        label: 'Zona',
        ayuda: 'Ciudad y zona donde vive el cliente (por ejemplo, Madrid Norte).\nSe usa en el gráfico "Tasa de éxito por zona" del dashboard y en la página Mapa.',
    },
    {
        label: 'Duración',
        align: 'right',
        ayuda: 'Cuánto duró la sesión, en segundos.\nEl promedio de todas las sesiones es el TMO (tiempo medio de operación) del dashboard: cuanto más bajo, más rápido se atiende al cliente.',
    },
    {
        label: '¿Resuelto al\n1er contacto?',
        ayuda: 'Sí: el problema quedó resuelto en la primera interacción, sin que el cliente tuviera que volver a contactar.\nNo: el cliente tuvo que contactar otra vez.\nSin dato: no se registró.\nEl porcentaje de «Sí» es el FCR (resolución al primer contacto) del dashboard: muestra qué tan bien se diagnostica el problema desde el inicio.',
    },
    {
        label: 'Resuelta IA',
        ayuda: 'Sí: la IA resolvió la sesión por completo, sin intervención de un agente humano.\nNo: participó un agente.\nEl porcentaje de «Sí» es la "Resolución por IA" del dashboard: muestra cuántos contactos se resuelven de forma automática, lo que reduce la carga y el costo de los agentes.',
    },
    {
        label: 'NPS',
        ayuda: 'Nota de satisfacción que el cliente da al terminar la sesión, de 0 a 10.\nPromotor (9–10): cliente muy satisfecho, que recomendaría el servicio.\nPasivo (7–8): satisfecho, pero sin entusiasmo; es poco probable que lo recomiende.\nDetractor (0–6): insatisfecho; puede hablar mal del servicio.\nEl T-NPS del dashboard es el % de promotores menos el % de detractores (va de −100 a +100).',
    },
    {
        label: 'Estado',
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

const FILAS_POR_PAGINA = 10

// Props:
//   data             → filas a mostrar (la tabla las pagina de 10 en 10)
//   busqueda         → texto del buscador (controlado por la página)
//   onBusquedaChange → si se pasa, se muestra el buscador; la búsqueda la hace la base de datos
//   total            → coincidencias totales en la base (si es mayor que data.length se avisa)
//   cargando         → true mientras llega la respuesta
export function Tabla({ data = dataMock, busqueda = '', onBusquedaChange, total, cargando = false }) {
    const [pagina, setPagina] = useState(1)
    const consulta = busqueda.trim()

    const totalPaginas = Math.max(1, Math.ceil(data.length / FILAS_POR_PAGINA))
    const paginaSegura = Math.min(pagina, totalPaginas)
    const inicio = (paginaSegura - 1) * FILAS_POR_PAGINA
    const filas = data.slice(inicio, inicio + FILAS_POR_PAGINA)
    const clavesFilas = data.map(s => s.id).join('|')

    useEffect(() => setPagina(1), [clavesFilas])

    return (
        <Card
            titulo="Sesiones recientes"
            subtitulo="Últimas sesiones registradas con los filtros aplicados"
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
            <div style={{ overflowX: 'auto', minHeight: 200 }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {COLS.map((col, i) => (
                                <th key={col.label} scope="col" style={{ textAlign: col.align ?? 'left' }}>
                                    {/* Las últimas columnas anclan el tooltip a la derecha para que no se salga de la tabla */}
                                    <span className="col-tip" data-ancla={i >= COLS.length - 3 ? 'derecha' : undefined} tabIndex={0} aria-describedby={`ayuda-col-${i}`}>
                                        {col.label.split('\n').map((linea, j) => j === 0 ? linea : <Fragment key={j}><br />{linea}</Fragment>)}
                                        <span role="tooltip" id={`ayuda-col-${i}`} className="col-tip-texto"><Ayuda texto={col.ayuda} /></span>
                                    </span>
                                </th>
                            ))}
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
                        {filas.map((s, i) => {
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
                                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{s.duracion}</td>
                                    <td style={{ color: s.resueltoPrimerContacto === 'Sí' ? 'var(--status-good-ink)' : s.resueltoPrimerContacto === 'No' ? 'var(--text)' : 'var(--text-light)', fontWeight: s.resueltoPrimerContacto === 'Sí' ? 600 : 400 }}>
                                        {s.resueltoPrimerContacto}
                                    </td>
                                    <td>
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
            {data.length > 0 && (
                <nav className="table-pagination" aria-label="Paginación de sesiones">
                    <span aria-live="polite">
                        Mostrando {inicio + 1}–{Math.min(inicio + FILAS_POR_PAGINA, data.length)} de {data.length} sesiones
                        {total > data.length && ` (hay ${formatoNumero.format(total)} coincidencias; se muestran las ${data.length} más recientes)`}
                    </span>
                    <div className="table-pagination-controls">
                        <button type="button" onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaSegura === 1} aria-label="Página anterior">
                            <ChevronLeft size={16} aria-hidden="true" /> Anterior
                        </button>
                        <span>Página {paginaSegura} de {totalPaginas}</span>
                        <button type="button" onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaSegura === totalPaginas} aria-label="Página siguiente">
                            Siguiente <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </nav>
            )}
        </Card>
    )
}
