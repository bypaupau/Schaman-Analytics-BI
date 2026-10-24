// Tabla.jsx ─ Sesiones recientes — nivel más detallado del triángulo invertido
// Usa los mismos colores que el resto del dashboard:
//   - Canal: el mismo color de identidad que en el donut (colorCanal)
//   - NPS y Estado: colores de estado + texto, nunca color solo

import { Bot, ChevronLeft, ChevronRight, Globe, Headset, Mail, MessageCircle, MessagesSquare, Smartphone } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { Card } from './Card.jsx'
import { STATUS, colorCanal, normalizar } from '../lib/chartTheme'

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

const COLS = [
    { label: 'ID sesión' },
    { label: 'Cliente' },
    { label: 'Canal' },
    { label: 'Zona' },
    { label: 'Duración', align: 'right' },
    { label: '¿Resuelto al\n1er contacto?' },
    { label: 'Resuelta IA' },
    { label: 'NPS' },
    { label: 'Estado' },
]

const FILAS_POR_PAGINA = 10

export function Tabla({ data = dataMock }) {
    const [pagina, setPagina] = useState(1)
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
        >
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {COLS.map(col => (
                                <th key={col.label} scope="col" style={{ textAlign: col.align ?? 'left' }}>
                                    {col.label.split('\n').map((linea, i) => i === 0 ? linea : <Fragment key={i}><br />{linea}</Fragment>)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={COLS.length} className="empty-state" style={{ height: 120 }}>Sin sesiones para este filtro</td>
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
                    <span aria-live="polite">Mostrando {inicio + 1}–{Math.min(inicio + FILAS_POR_PAGINA, data.length)} de {data.length} sesiones</span>
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
