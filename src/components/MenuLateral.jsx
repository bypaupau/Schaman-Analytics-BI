// ══════════════════════════════════════════════════════════════════════════════
// MenuLateral.jsx — Sidebar de navegación colapsable
//
// Cómo funciona la navegación:
//   - App.jsx tiene un estado `pagina` ('overview' | 'fallos' | ...)
//   - Al hacer clic en un ítem del menú, llamamos onNavegar(id) para cambiarlo
//   - El ítem activo se destaca visualmente usando paginaActual === id
//
// Por qué no usamos React Router:
//   - El proyecto es una SPA sencilla con pocas páginas
//   - Agregar React Router añadiría dependencia extra y complejidad de configuración
//   - Con un simple estado string en App.jsx tenemos todo lo que necesitamos
//
// La altura del header del sidebar (64px) coincide EXACTAMENTE con la del
// header principal para que las líneas queden alineadas visualmente.
// ══════════════════════════════════════════════════════════════════════════════

import { Home, AlertTriangle, Users, Settings, Menu } from 'lucide-react'

// Cada ítem tiene:
//   id     → identificador único que App.jsx usa para saber qué página mostrar
//   icon   → ícono de Lucide
//   label  → texto que aparece cuando el menú está expandido
const NAV_ITEMS = [
    { id: 'overview', icon: Home,          label: 'Dashboard'       },
    { id: 'fallos',   icon: AlertTriangle, label: 'Análisis Fallos' },
    // Aquí irán las páginas futuras (agentes, clientes, etc.)
    // { id: 'agentes',  icon: Users,         label: 'Rendimiento'     },
    { id: 'config',   icon: Settings,       label: 'Configuración'   },
]

export function MenuLateral({ abierto, setAbierto, paginaActual, onNavegar }) {
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
            {/* Botón hamburguesa — abre/cierra el sidebar */}
            <button
                onClick={() => setAbierto(!abierto)}
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: abierto ? 'flex-start' : 'center',
                    padding: abierto ? '0 20px' : '0',
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

            {/* Lista de ítems de navegación */}
            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
                    // Un ítem está activo si su id coincide con la página que App.jsx está mostrando
                    const activo = paginaActual === id
                    return (
                        <button
                            key={id}
                            onClick={() => onNavegar(id)}
                            title={!abierto ? label : undefined}  // tooltip cuando el menú está cerrado
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                // Cuando el menú está cerrado, centramos el ícono horizontalmente.
                                // Cuando está abierto, alineamos a la izquierda para que el texto quede bien.
                                justifyContent: abierto ? 'flex-start' : 'center',
                                gap: 10,
                                // El padding lateral desaparece cuando el menú está colapsado
                                // para que el ícono quede exactamente centrado en los 64px de ancho.
                                padding: abierto ? '9px 12px' : '9px 0',
                                borderRadius: 10,
                                textDecoration: 'none',
                                background: activo ? 'var(--brand-light)' : 'transparent',
                                color: activo ? 'var(--brand)' : 'var(--text-muted)',
                                fontWeight: activo ? 700 : 500,
                                fontSize: 13,
                                transition: 'background 0.15s',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                border: 'none',
                                cursor: 'pointer',
                                width: '100%',
                                textAlign: 'left',
                            }}
                            onMouseEnter={e => { if (!activo) e.currentTarget.style.background = '#F1F5F9' }}
                            onMouseLeave={e => { if (!activo) e.currentTarget.style.background = 'transparent' }}
                        >
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            {abierto && label}
                        </button>
                    )
                })}
            </nav>
        </aside>
    )
}
