import { KPICard }      from "./components/KPICard.jsx"
import { KPICardLineal } from "./components/KPICardLineal.jsx"
import { KPICardPie }    from "./components/KPICardPie.jsx"
import { KPICardBarras } from "./components/KPICardBarras.jsx"
import { MenuFiltros }   from "./components/MenuFiltros.jsx"
import { Tabla }         from "./components/Tabla.jsx"
import { ScoreCard }     from "./components/ScoreCard.jsx"
import logo              from "./assets/logo.png"
import { MenuLateral }   from "./components/MenuLateral.jsx"
import { useState }      from 'react'

// ── Datos mock ──────────────────────────────────────────────────────────────
// Cuando el ETL esté listo vendrán de Supabase.
// "color" usa el nombre semántico → KPICard lo mapea a la paleta correcta.
const kpisMock = [
  {
    KPINombre:  "FCR",
    kpiLabel:   "Resolución al Primer Contacto",
    metricaKPI: "92%",
    textoKPI:   "Problemas resueltos en la primera interacción.",
    color:      "green",
    tendencia:  "↑ +4% vs mes anterior",
    positivo:   true,
  },
  {
    KPINombre:  "TMO",
    kpiLabel:   "Tiempo Medio de Operación",
    metricaKPI: "245s",
    textoKPI:   "Duración promedio por sesión con guiado dinámico.",
    color:      "blue",
    tendencia:  "↓ −18s mejorado",
    positivo:   true,
  },
  {
    KPINombre:  "T-NPS",
    kpiLabel:   "Satisfacción del Cliente",
    metricaKPI: "+42",
    textoKPI:   "Net Promoter Score transaccional post-sesión.",
    color:      "amber",
    tendencia:  "↑ +20 pts digitales",
    positivo:   true,
  },
  {
    KPINombre:  "Tasa Éxito",
    kpiLabel:   "Sesiones Resueltas",
    metricaKPI: "90%",
    textoKPI:   "Sesiones con resolución efectiva del problema.",
    color:      "teal",
    tendencia:  "↑ +6% trimestre",
    positivo:   true,
  },
  {
    KPINombre:  "Deflection",
    kpiLabel:   "Resuelto por IA",
    metricaKPI: "67%",
    textoKPI:   "Contactos resueltos por IA sin agente humano.",
    color:      "violet",
    tendencia:  "↑ Meta: 70%",
    positivo:   true,
  },
]

function App() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="flex min-h-screen w-full" style={{ background: 'var(--bg)' }}>

      {/* ── Menú lateral ── */}
      <MenuLateral abierto={menuAbierto} setAbierto={setMenuAbierto} />

      {/* ── Área principal ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 4px rgba(15,52,96,0.06)',
        }}>
          <div className="px-8 h-[64px] flex items-center justify-between">

            {/* Logo + título — centrado */}
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

        {/* ── Contenido principal ────────────────────────────────────── */}
        {/* px-8 igual al header para que todo quede alineado, SIN max-w mx-auto */}
        <main className="px-8 py-6 flex flex-col gap-5 w-full">

          {/* 1. Filtros */}
          <MenuFiltros />

          {/* 2. Score Global ─ el más importante, ocupa todo el ancho */}
          <ScoreCard />

          {/* 3. KPI Cards ─ 5 columnas iguales, ancho completo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            {kpisMock.map((kpi, i) => (
              <KPICard key={i} {...kpi} />
            ))}
          </div>

          {/* 4. Gráficos ─ 3 columnas iguales (triángulo invertido: visión general → detalle) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <KPICardLineal titulo="FCR & TMO — Evolución Mensual" />
            <KPICardPie    titulo="Distribución por Canal" />
            <KPICardBarras titulo="Tasa de Éxito por Zona" />
          </div>

          {/* 5. Tabla ─ el nivel más detallado (base del triángulo) */}
          <Tabla />

        </main>
      </div>
    </div>
  )
}

export default App
