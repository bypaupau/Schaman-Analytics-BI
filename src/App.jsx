import { KPICard } from "./components/KPICard.jsx"
import { KPICardLineal } from "./components/KPICardLineal.jsx"
import { KPICardPie } from "./components/KPICardPie.jsx"
import { MenuFiltros } from "./components/MenuFiltros.jsx"
import { Tabla } from "./components/Tabla.jsx"
import { ScoreCard } from "./components/ScoreCard.jsx"
import logo from "./assets/logo.png"
import { MenuLateral } from "./components/MenuLateral.jsx"
import { Menu } from 'lucide-react'
import { useState } from 'react'

// Datos mock — cuando el ETL esté listo, estos valores vendrán de Supabase
// Cada KPI tiene un "color" semántico que comunica el tipo de métrica
const kpisMock = [
  {
    KPINombre: "FCR — Resolución al Primer Contacto",
    metricaKPI: "92%",
    textoKPI: "Porcentaje de problemas resueltos en la primera interacción, evitando que el cliente vuelva a contactar.",
    color: "green",   // verde = éxito / resolución positiva
  },
  {
    KPINombre: "TMO — Tiempo Medio de Operación",
    metricaKPI: "245s",
    textoKPI: "Duración promedio de la sesión, gracias al guiado dinámico de Schaman.",
    color: "blue",    // azul = tiempo / eficiencia operativa
  },
  {
    KPINombre: "T-NPS — Satisfacción del Cliente",
    metricaKPI: "+42 pts",
    textoKPI: "Net Promoter Score transaccional que mide la fidelidad inmediatamente después de la sesión.",
    color: "yellow",  // amarillo = calidez / satisfacción (= amarillo Schaman)
  },
  {
    KPINombre: "Tasa de Éxito",
    metricaKPI: "90%",
    textoKPI: "Porcentaje de sesiones que culminaron en una resolución efectiva del problema planteado.",
    color: "emerald", // esmeralda = crecimiento / resultado positivo
  },
  {
    KPINombre: "Deflection Rate",
    metricaKPI: "67%",
    textoKPI: "Contactos resueltos autónomamente por agentes de IA sin intervención humana.",
    color: "purple",  // violeta = IA / automatización / tecnología
  },
]

function App() {
  // 3. Creamos el estado (inicia en false para que empiece cerrado y ahorre espacio)
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
      // 1. Contenedor principal FLEX (pone las cosas una al lado de la otra)
      <div className="flex min-h-screen w-full" style={{ background: 'var(--radial-bg)' }}>

        {/* 2. menú lateral a la izquierda */}
        <MenuLateral abierto={menuAbierto} setAbierto={setMenuAbierto}/>

        <div className="flex-1 flex flex-col min-w-0 transition-all">
          <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(15,52,96,0.06)' }}>
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">


                <img src={logo} alt="Logo Schaman" className="w-9 h-9 object-contain" />
                <div>
                  <h1 className="font-extrabold tracking-tight leading-none" style={{ fontSize: '1.35rem', color: 'var(--brand-blue)' }}>
                    Schaman
                  </h1>
                  <p className="text-xs leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Inteligencia de Resolución Omnicanal
                  </p>
                </div>
              </div>
            </div>
          </header>



        {/* ── Contenido principal ─────────────────────────── */}
          <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-6 w-full">
          {/* Filtros */}
          <MenuFiltros />

          {/* Score Global de Calidad */}
          <ScoreCard />

          {/* KPI Cards */}
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {kpisMock.map((kpi, index) => (
              <KPICard
                key={index}
                KPINombre={kpi.KPINombre}
                metricaKPI={kpi.metricaKPI}
                textoKPI={kpi.textoKPI}
                color={kpi.color}
              />
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KPICardLineal titulo="Evolución Mensual de Eficiencia (FCR & TMO)" />
            <KPICardPie titulo="Distribución por Canal de Origen" />
          </div>

          {/* Tabla de sesiones */}
          <Tabla />

        </main>
      </div>
    </div>
  )
}

export default App
