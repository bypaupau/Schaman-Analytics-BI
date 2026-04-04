// Tabla.jsx
// Tabla de sesiones recientes del Data Warehouse de Schaman.
//
// Props:
//   data (array) — Lista de sesiones. Cuando el ETL esté listo, vendrá de Supabase.

// Datos mock — mismos del mockup de la profesora
const dataMock = [
    { id: 'Ses-8841', cliente: 'Ana Torres',   canal: 'Chat',    zona: 'Centro', duracion: '187s', tercerContacto: 'Sí', resueltaIA: 'Sí', nps: 9,  estado: 'Exitosa'  },
    { id: 'Ses-8842', cliente: 'Luis Méndez',  canal: 'Llamada', zona: 'Norte',  duracion: '412s', tercerContacto: 'No', resueltaIA: 'No', nps: 6,  estado: 'Pendiente' },
    { id: 'Ses-8843', cliente: 'María López',  canal: 'Email',   zona: 'Sur',    duracion: '95s',  tercerContacto: 'No', resueltaIA: 'Sí', nps: 8,  estado: 'Exitosa'  },
    { id: 'Ses-8844', cliente: 'Carlos Ruiz',  canal: 'App',     zona: 'Centro', duracion: '320s', tercerContacto: 'Sí', resueltaIA: 'No', nps: 4,  estado: 'Pendiente' },
    { id: 'Ses-8845', cliente: 'Sofía Mora',   canal: 'Chat',    zona: 'Norte',  duracion: '210s', tercerContacto: 'No', resueltaIA: 'Sí', nps: 10, estado: 'Exitosa'  },
]

// ✅ recibe data como prop — si no se pasa, usa dataMock
export function Tabla({ data = dataMock }) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>

            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Sesiones Recientes
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">

                    <thead>
                        <tr>
                            {['ID Sesión','Cliente','Canal','Zona','Duración','3er Contacto','Resuelta IA','NPS','Estado'].map(col => (
                                <th key={col} className="px-5 py-3 text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((sesion, index) => (
                            <tr key={index}
                                style={{ borderTop: '1px solid var(--border)', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td className="px-5 py-3.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{sesion.id}</td>
                                <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text)' }}>{sesion.cliente}</td>
                                <td className="px-5 py-3.5" style={{ color: 'var(--text)' }}>{sesion.canal}</td>
                                <td className="px-5 py-3.5" style={{ color: 'var(--text)' }}>{sesion.zona}</td>
                                <td className="px-5 py-3.5" style={{ color: 'var(--text)' }}>{sesion.duracion}</td>
                                <td className="px-5 py-3.5" style={{ color: 'var(--text)' }}>{sesion.tercerContacto}</td>
                                <td className="px-5 py-3.5" style={{ color: 'var(--text)' }}>{sesion.resueltaIA}</td>
                                <td className="px-5 py-3.5 font-bold" style={{ color: 'var(--accent)' }}>{sesion.nps}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sesion.estado === 'Exitosa' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                        ● {sesion.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    )
}