// Tabla.jsx ─ Sesiones recientes — nivel más detallado del triángulo invertido
// Rediseñada para coincidir visualmente con el resto del dashboard

const dataMock = [
    { id: 'Ses-8841', cliente: 'Ana Torres',   canal: 'Chat',    zona: 'Centro', duracion: '187s', tercerContacto: 'Sí', resueltaIA: 'Sí', nps: 9,  estado: 'Exitosa'   },
    { id: 'Ses-8842', cliente: 'Luis Méndez',  canal: 'Llamada', zona: 'Norte',  duracion: '412s', tercerContacto: 'No', resueltaIA: 'No', nps: 6,  estado: 'Pendiente'  },
    { id: 'Ses-8843', cliente: 'María López',  canal: 'Email',   zona: 'Sur',    duracion: '95s',  tercerContacto: 'No', resueltaIA: 'Sí', nps: 8,  estado: 'Exitosa'   },
    { id: 'Ses-8844', cliente: 'Carlos Ruiz',  canal: 'App',     zona: 'Centro', duracion: '320s', tercerContacto: 'Sí', resueltaIA: 'No', nps: 4,  estado: 'Pendiente'  },
    { id: 'Ses-8845', cliente: 'Sofía Mora',   canal: 'Chat',    zona: 'Norte',  duracion: '210s', tercerContacto: 'No', resueltaIA: 'Sí', nps: 10, estado: 'Exitosa'   },
]

// Color del badge de canal
const CANAL_COLOR = {
    Chat:    { bg: '#EFF6FF', text: '#1D4ED8' },
    Llamada: { bg: '#FFF7ED', text: '#C2410C' },
    Email:   { bg: '#FFFBEB', text: '#B45309' },
    App:     { bg: '#F5F3FF', text: '#6D28D9' },
}

// NPS: color condicional (≥9 verde, 7-8 ámbar, ≤6 rojo)
function npsColor(n) {
    if (n >= 9) return '#10B981'
    if (n >= 7) return '#F59E0B'
    return '#EF4444'
}

const COLS = ['ID Sesión', 'Cliente', 'Canal', 'Zona', 'Duración', '3er Contacto', 'Resuelta IA', 'NPS', 'Estado']

export function Tabla({ data = dataMock }) {
    return (
        <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            borderRadius: 16,
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Sesiones Recientes
                </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {COLS.map(col => (
                                <th key={col} style={{
                                    padding: '10px 20px',
                                    textAlign: 'left',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    color: 'var(--text-light)',
                                    borderBottom: '1px solid var(--border)',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((s, i) => {
                            const canalStyle = CANAL_COLOR[s.canal] ?? { bg: '#F1F5F9', text: '#475569' }
                            return (
                                <tr
                                    key={i}
                                    style={{ borderTop: '1px solid var(--border)', transition: 'background 0.12s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFD'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '12px 20px', fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-light)' }}>
                                        {s.id}
                                    </td>
                                    <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text)' }}>
                                        {s.cliente}
                                    </td>
                                    {/* Canal con badge de color */}
                                    <td style={{ padding: '12px 20px' }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 600,
                                            padding: '3px 9px', borderRadius: 999,
                                            background: canalStyle.bg,
                                            color: canalStyle.text,
                                        }}>
                                            {s.canal}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{s.zona}</td>
                                    <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{s.duracion}</td>
                                    <td style={{ padding: '12px 20px', color: s.tercerContacto === 'Sí' ? '#10B981' : 'var(--text-light)', fontWeight: s.tercerContacto === 'Sí' ? 600 : 400 }}>{s.tercerContacto}</td>
                                    <td style={{ padding: '12px 20px', color: s.resueltaIA === 'Sí' ? '#8B5CF6' : 'var(--text-light)', fontWeight: s.resueltaIA === 'Sí' ? 600 : 400 }}>{s.resueltaIA}</td>
                                    {/* NPS con color condicional */}
                                    <td style={{ padding: '12px 20px' }}>
                                        <span style={{
                                            fontSize: 13, fontWeight: 800,
                                            color: npsColor(s.nps),
                                        }}>
                                            {s.nps}
                                        </span>
                                    </td>
                                    {/* Estado con badge */}
                                    <td style={{ padding: '12px 20px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            fontSize: 11, fontWeight: 600,
                                            padding: '4px 10px', borderRadius: 999,
                                            background: s.estado === 'Exitosa' ? '#F0FDF4' : '#FFFBEB',
                                            color:      s.estado === 'Exitosa' ? '#15803D' : '#B45309',
                                        }}>
                                            <span style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: s.estado === 'Exitosa' ? '#10B981' : '#F59E0B',
                                                display: 'inline-block',
                                            }} />
                                            {s.estado}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
