// MenuLateral.jsx ─ Sidebar colapsable
// La altura del header del sidebar (64px) coincide EXACTAMENTE con la del header principal

import { Home, BarChart2, Users, Settings, Menu } from "lucide-react"

const NAV_ITEMS = [
    { icon: Home,      label: 'Dashboard',   active: true  },
    { icon: BarChart2, label: 'Analítica',   active: false },
    { icon: Users,     label: 'Agentes IA',  active: false },
    { icon: Settings,  label: 'Configuración',active: false },
]

export function MenuLateral({ abierto, setAbierto }) {
    return (
        <aside
            style={{
                width: abierto ? 220 : 64,
                minHeight: '100vh',
                flexShrink: 0,
                background: 'var(--card)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.25s ease',
                overflow: 'hidden',
            }}
        >
            {/* Header del sidebar — 64px de alto, igual que el header principal */}
            <button
                onClick={() => setAbierto(!abierto)}
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: abierto ? 'flex-start' : 'center',
                    padding: abierto ? '0 20px' : '0',
                    borderBottom: '1px solid var(--border)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <Menu size={20} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                {abierto && (
                    <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        Navegación
                    </span>
                )}
            </button>

            {/* Links de navegación */}
            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
                    <a
                        key={label}
                        href="#"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 12px',
                            borderRadius: 10,
                            textDecoration: 'none',
                            background: active ? 'var(--brand-light)' : 'transparent',
                            color: active ? 'var(--brand)' : 'var(--text-muted)',
                            fontWeight: active ? 700 : 500,
                            fontSize: 13,
                            transition: 'background 0.15s',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F1F5F9' }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                    >
                        <Icon size={18} style={{ flexShrink: 0 }} />
                        {abierto && label}
                    </a>
                ))}
            </nav>
        </aside>
    )
}
