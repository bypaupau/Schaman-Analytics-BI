// ══════════════════════════════════════════════════════════════════════════════
// App.jsx — Componente raíz: layout + navegación entre páginas
//
// Arquitectura de navegación:
//   - `pagina` es un string que indica qué página mostrar ('overview', 'fallos', …)
//   - MenuLateral recibe `pagina` y `onNavegar` para resaltar el ítem activo
//     y cambiar la página al hacer clic
//   - Cada página es un componente independiente en src/pages/
//
// Toda la lógica de datos vive en los hooks (src/hooks/):
//   useFiltros       → filtros del overview + opciones de los selects
//   useDashboardData → 10 RPCs del overview
//   useFallosData    → 4 RPCs de la página de fallos (dentro de PaginaFallos)
// ══════════════════════════════════════════════════════════════════════════════

import { useState }         from 'react'
import { useFiltros }        from './hooks/useFiltros'
import { useDashboardData }  from './hooks/useDashboardData'

// Componentes del Overview (página principal)
import { KPICard }       from './components/KPICard.jsx'
import { KPICardLineal } from './components/KPICardLineal.jsx'
import { KPICardPie }    from './components/KPICardPie.jsx'
import { KPICardBarras } from './components/KPICardBarras.jsx'
import { MenuFiltros }   from './components/MenuFiltros.jsx'
import { Tabla }         from './components/Tabla.jsx'
import { ScoreCard }     from './components/ScoreCard.jsx'

// Navegación
import { MenuLateral }   from './components/MenuLateral.jsx'
import logo              from './assets/logo.png'

// Páginas secundarias
import { PaginaFallos }  from './pages/PaginaFallos.jsx'

function App() {
    // ── Navegación: qué página está activa ──────────────────────────────────
    const [pagina,      setPagina]      = useState('overview')
    const [menuAbierto, setMenuAbierto] = useState(false)

    // ── Filtros del Overview y datos del dashboard ───────────────────────────
    // Los hooks se ejecutan siempre (las reglas de hooks en React no permiten
    // llamarlos condicionalmente), pero solo usamos sus datos en el Overview.
    const { filtros, handleFiltroChange, filtrosParaMenu } = useFiltros()
    const { kpisData, scoreData, dataLineal, dataPie, dataBarras, dataSesiones } = useDashboardData(filtros)

    return (
        <div className="flex min-h-screen w-full" style={{ background: 'var(--bg)' }}>

            {/* ── Sidebar de navegación ─────────────────────────────────────── */}
            <MenuLateral
                abierto={menuAbierto}
                setAbierto={setMenuAbierto}
                paginaActual={pagina}
                onNavegar={setPagina}   // simplemente guardamos el id de la página
            />

            {/* ── Área principal ────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header — siempre visible independientemente de la página activa */}
                <header style={{
                    background:   'var(--card)',
                    borderBottom: '1px solid var(--border)',
                    boxShadow:    '0 1px 4px rgba(15,52,96,0.06)',
                }}>
                    <div className="px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Schaman" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                            <div>
                                <p className="font-bold leading-none" style={{ fontSize: '1.1rem', color: 'var(--brand)', letterSpacing: '-0.02em' }}>
                                    Schaman
                                </p>
                                <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--text-light)' }}>
                                    Inteligencia de Resolución Omnicanal
                                </p>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 999,
                            background: '#F0FDF4', border: '1px solid #BBF7D0',
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>En vivo</span>
                        </div>
                    </div>
                </header>

                {/* ── Renderizado condicional de páginas ────────────────────── */}
                {/* Cada `pagina` corresponde a un componente diferente */}

                {pagina === 'overview' && (
                    <main className="px-8 py-6 flex flex-col gap-5 w-full">
                        <MenuFiltros filtros={filtrosParaMenu} onCambio={handleFiltroChange} />
                        <ScoreCard score={scoreData?.score} dimensiones={scoreData?.dimensiones} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                            {kpisData.map((kpi, i) => <KPICard key={i} {...kpi} />)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            <KPICardLineal titulo="FCR & TMO — Evolución Mensual"  data={dataLineal}  />
                            <KPICardPie    titulo="Distribución por Canal"          data={dataPie}     />
                            <KPICardBarras titulo="Tasa de Éxito por Zona"          data={dataBarras}  />
                        </div>
                        <Tabla data={dataSesiones} />
                    </main>
                )}

                {pagina === 'fallos' && (
                    // Le pasamos el año actual del filtro para que la página
                    // haga sus consultas con el mismo año seleccionado en el Overview
                    <PaginaFallos anio={filtros.anio} />
                )}

                {/* Página placeholder para cuando el menú esté en "Configuración" */}
                {pagina === 'config' && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: 14 }}>
                        Configuración — próximamente
                    </div>
                )}

            </div>
        </div>
    )
}

export default App
