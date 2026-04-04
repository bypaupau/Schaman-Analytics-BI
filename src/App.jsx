import { useState }         from 'react'
import { useFiltros }        from './hooks/useFiltros'
import { useDashboardData }  from './hooks/useDashboardData'

import { KPICard }       from './components/KPICard.jsx'
import { KPICardLineal } from './components/KPICardLineal.jsx'
import { KPICardPie }    from './components/KPICardPie.jsx'
import { KPICardBarras } from './components/KPICardBarras.jsx'
import { MenuFiltros }   from './components/MenuFiltros.jsx'
import { Tabla }         from './components/Tabla.jsx'
import { ScoreCard }     from './components/ScoreCard.jsx'
import { MenuLateral }   from './components/MenuLateral.jsx'
import logo              from './assets/logo.png'

function App() {
    const [menuAbierto, setMenuAbierto] = useState(false)

    // Filtros y opciones de los selects
    const { filtros, handleFiltroChange, filtrosParaMenu } = useFiltros()

    // Datos del dashboard (se re-fetcha cuando filtros cambia)
    const { kpisData, scoreData, dataLineal, dataPie, dataBarras, dataSesiones } = useDashboardData(filtros)

    return (
        <div className="flex min-h-screen w-full" style={{ background: 'var(--bg)' }}>

            {/* Menú lateral */}
            <MenuLateral abierto={menuAbierto} setAbierto={setMenuAbierto} />

            {/* Área principal */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <header style={{
                    background:   'var(--card)',
                    borderBottom: '1px solid var(--border)',
                    boxShadow:    '0 1px 4px rgba(15,52,96,0.06)',
                }}>
                    <div className="px-8 h-[64px] flex items-center justify-between">

                        {/* Logo + título */}
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

                        {/* Badge "En vivo" */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 999,
                            background: '#F0FDF4', border: '1px solid #BBF7D0',
                        }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%', background: '#10B981',
                                animation: 'pulse-dot 2s infinite', display: 'inline-block',
                            }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>En vivo</span>
                        </div>

                    </div>
                </header>

                {/* Contenido */}
                <main className="px-8 py-6 flex flex-col gap-5 w-full">

                    {/* 1. Filtros */}
                    <MenuFiltros filtros={filtrosParaMenu} onCambio={handleFiltroChange} />

                    {/* 2. Score Global */}
                    <ScoreCard score={scoreData?.score} dimensiones={scoreData?.dimensiones} />

                    {/* 3. KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                        {kpisData.map((kpi, i) => (
                            <KPICard key={i} {...kpi} />
                        ))}
                    </div>

                    {/* 4. Gráficos */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <KPICardLineal titulo="FCR & TMO — Evolución Mensual"  data={dataLineal}  />
                        <KPICardPie    titulo="Distribución por Canal"          data={dataPie}     />
                        <KPICardBarras titulo="Tasa de Éxito por Zona"          data={dataBarras}  />
                    </div>

                    {/* 5. Sesiones recientes */}
                    <Tabla data={dataSesiones} />

                </main>
            </div>
        </div>
    )
}

export default App
