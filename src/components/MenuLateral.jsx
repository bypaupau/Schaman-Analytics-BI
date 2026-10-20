// ══════════════════════════════════════════════════════════════════════════════
// MenuLateral.jsx — Sidebar de navegación colapsable
//
// Cómo funciona la navegación:
//   - App.jsx tiene un estado `pagina` ('overview' | 'fallos' | ...)
//   - Al hacer clic en un ítem del menú, llamamos onNavegar(id) para cambiarlo
//   - El ítem activo se marca con aria-current="page" (lo usa el CSS para
//     resaltarlo y los lectores de pantalla para anunciarlo)
//
// Por qué no usamos React Router:
//   - El proyecto es una SPA sencilla con pocas páginas
//   - Agregar React Router añadiría dependencia extra y complejidad de configuración
//   - Con un simple estado string en App.jsx tenemos todo lo que necesitamos
//
// Contraído: solo se ve el símbolo del logo y los íconos (con tooltip).
// ══════════════════════════════════════════════════════════════════════════════

import { LayoutDashboard, TriangleAlert, Database, List, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import logo from '../assets/logo.png'

// Cada ítem tiene:
//   id     → identificador único que App.jsx usa para saber qué página mostrar
//   icon   → ícono de Lucide
//   label  → texto que aparece cuando el menú está expandido
const NAV_ITEMS = [
    { id: 'overview', icon: LayoutDashboard, label: 'Panel general'   },
    { id: 'fallos',   icon: TriangleAlert,   label: 'Análisis de fallos' },
    { id: 'sesiones', icon: List,              label: 'Sesiones' },
    // Aquí irán las páginas futuras (agentes, clientes, etc.)
    // { id: 'agentes',  icon: Users,         label: 'Rendimiento'     },
]

const NAV_SECUNDARIO = [
    { id: 'config', icon: Database, label: 'Datos y metodología' },
]

const ANCHO_ABIERTO = 264
const ANCHO_CERRADO = 84

function ItemNav({ id, icon: Icon, label, abierto, activo, onNavegar }) {
    return (
        <button
            type="button"
            className="nav-item"
            onClick={() => onNavegar(id)}
            aria-current={activo ? 'page' : undefined}
            aria-label={!abierto ? label : undefined}
            title={!abierto ? label : undefined}  // tooltip cuando el menú está cerrado
            style={{ justifyContent: abierto ? 'flex-start' : 'center', padding: abierto ? '0 14px' : 0 }}
        >
            <Icon size={20} strokeWidth={2} aria-hidden="true" style={{ flexShrink: 0 }} />
            {abierto && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
        </button>
    )
}

function Seccion({ titulo, abierto }) {
    return abierto
        ? <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-light)', padding: '0 14px', margin: '8px 0 6px' }}>{titulo}</p>
        : <div style={{ height: 1, background: 'var(--border)', margin: '12px 10px' }} />
}

export function MenuLateral({ abierto, setAbierto, paginaActual, onNavegar }) {
    const ToggleIcon = abierto ? PanelLeftClose : PanelLeftOpen

    return (
        <aside
            aria-label="Navegación principal"
            style={{
                width: abierto ? ANCHO_ABIERTO : ANCHO_CERRADO,
                height: '100vh',
                position: 'sticky',
                top: 0,
                flexShrink: 0,
                padding: 16,
                transition: 'width 0.25s ease',
                zIndex: 10,
            }}
        >
            <div
                className="card"
                style={{ height: '100%', padding: '20px 12px 12px', overflow: 'hidden', gap: 4 }}
            >
                {/* Logo: contraído mostramos solo el símbolo recortando la imagen */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: abierto ? 'flex-start' : 'center', padding: abierto ? '0 12px' : 0, height: 44, marginBottom: 16 }}>
                    <div style={{ width: abierto ? 126 : 25, overflow: 'hidden', transition: 'width 0.25s ease' }}>
                        <img src={logo} alt="Schaman" width={126} height={36} style={{ display: 'block', width: 126, height: 36, maxWidth: 'none' }} />
                    </div>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <Seccion titulo="Análisis" abierto={abierto} />
                    {NAV_ITEMS.map(item => (
                        <ItemNav key={item.id} {...item} abierto={abierto} activo={paginaActual === item.id} onNavegar={onNavegar} />
                    ))}

                    <Seccion titulo="Sistema" abierto={abierto} />
                    {NAV_SECUNDARIO.map(item => (
                        <ItemNav key={item.id} {...item} abierto={abierto} activo={paginaActual === item.id} onNavegar={onNavegar} />
                    ))}
                </nav>

                {/* Botón para contraer / expandir el menú */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                    <button
                        type="button"
                        className="nav-item"
                        onClick={() => setAbierto(!abierto)}
                        aria-expanded={abierto}
                        aria-label={abierto ? 'Contraer menú' : 'Expandir menú'}
                        title={abierto ? undefined : 'Expandir menú'}
                        style={{ justifyContent: abierto ? 'flex-start' : 'center', padding: abierto ? '0 14px' : 0 }}
                    >
                        <ToggleIcon size={20} aria-hidden="true" style={{ flexShrink: 0 }} />
                        {abierto && <span>Contraer menú</span>}
                    </button>
                </div>
            </div>
        </aside>
    )
}
