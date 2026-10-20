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
//
// Orden del overview (de lo general a lo detallado — "pirámide invertida"):
//   Panel general: título + filtros → score global → KPIs → gráficos
//   Sesiones: misma selección de filtros → tabla de registros recientes
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
import { ScoreCard }     from './components/ScoreCard.jsx'
import { PageHeader } from './components/PageHeader.jsx'

// Navegación
import { MenuLateral }   from './components/MenuLateral.jsx'

// Páginas secundarias
import { PaginaFallos }  from './pages/PaginaFallos.jsx'
import { PaginaDatos }   from './pages/PaginaDatos.jsx'
import { PaginaSesiones } from './pages/PaginaSesiones.jsx'

function App() {
    // ── Navegación: qué página está activa ──────────────────────────────────
    const [pagina,      setPagina]      = useState('overview')
    // En pantallas anchas el menú arranca abierto; en laptops pequeñas, contraído
    const [menuAbierto, setMenuAbierto] = useState(() => window.innerWidth >= 1280)

    // ── Filtros del Overview y datos del dashboard ───────────────────────────
    // Los hooks se ejecutan siempre (las reglas de hooks en React no permiten
    // llamarlos condicionalmente), pero solo usamos sus datos en el Overview.
    const { filtros, handleFiltroChange, filtrosParaMenu } = useFiltros()
    const { kpisData, scoreData, dataLineal, dataPie, dataBarras, dataSesiones } = useDashboardData(filtros)

    const periodo = filtros.mes && filtros.mes !== 'Todos' ? `${filtros.mes} ${filtros.anio}` : `Año ${filtros.anio}`

    return (
        <div className="flex min-h-screen w-full">

            {/* ── Sidebar de navegación ─────────────────────────────────────── */}
            <MenuLateral
                abierto={menuAbierto}
                setAbierto={setMenuAbierto}
                paginaActual={pagina}
                onNavegar={setPagina}   // simplemente guardamos el id de la página
            />

            {/* ── Área principal ────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* ── Renderizado condicional de páginas ────────────────────── */}
                {/* Cada `pagina` corresponde a un componente diferente */}

                {pagina === 'overview' && (
                    <main className="page">
                        <PageHeader
                            titulo="Panel general"
                            subtitulo={`Inteligencia de resolución omnicanal - ${periodo}`}
                        >

                        </PageHeader>

                        <MenuFiltros filtros={filtrosParaMenu} onCambio={handleFiltroChange} />

                        <ScoreCard score={scoreData?.score} dimensiones={scoreData?.dimensiones} />

                        <div className="grid-kpis">
                            {kpisData.map((kpi, i) => <KPICard key={i} {...kpi} />)}
                        </div>

                        <div className="grid-3">
                            <KPICardLineal titulo="FCR y TMO por mes"        data={dataLineal}  />
                            <KPICardPie    titulo="Distribución por canal"   data={dataPie}     />
                            <KPICardBarras titulo="Tasa de éxito por zona"   data={dataBarras}  />
                        </div>
                    </main>
                )}

                {pagina === 'sesiones' && (
                    <PaginaSesiones
                        filtros={filtrosParaMenu}
                        onCambioFiltro={handleFiltroChange}
                        data={dataSesiones}
                        periodo={periodo}
                    />
                )}

                {pagina === 'fallos' && (
                    <PaginaFallos
                        filtros={filtrosParaMenu}
                        valoresFiltro={filtros}
                        onCambioFiltro={handleFiltroChange}
                    />
                )}

                {pagina === 'config' && <PaginaDatos />}

            </div>
        </div>
    )
}

export default App
