// MenuFiltros.jsx ─ Fila de filtros tipo pill, alineados a la IZQUIERDA
// Ahora acepta datos reales de Supabase (vía App.jsx) o usa el mock interno.
//
// Props:
//   filtros   → array de { label, opciones[], valorActual } — si null usa filtrosMock
//   onCambio  → callback(label: string, value: string) cuando el usuario cambia un filtro
//
// Cada pill es un <label>: así toda la pastilla es clickeable y el lector de
// pantalla anuncia "Año, 2024" en lugar de un select sin nombre.

import { ChevronDown, SlidersHorizontal } from "lucide-react"

// Datos de ejemplo mientras Supabase carga (se reemplazan automáticamente)
const filtrosMock = [
    { label: 'Año',   opciones: ['2024', '2025'],                                 valorActual: '2024'    },
    { label: 'Mes',   opciones: ['Todos', 'Enero', 'Febrero', 'Marzo', 'Octubre'], valorActual: 'Todos'   },
    { label: 'Canal', opciones: ['Todos', 'Llamadas', 'Chat', 'Email', 'App'],     valorActual: 'Todos'   },
    { label: 'Zona',  opciones: ['Global', 'Norte', 'Centro', 'Sur'],              valorActual: 'Global'  },
]

export function MenuFiltros({ filtros = filtrosMock, onCambio }) {
    // Si App.jsx aún no cargó las opciones, filtros será null → usamos el mock
    const lista = filtros ?? filtrosMock

    return (
        <div role="group" aria-label="Filtros" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>
                <SlidersHorizontal size={18} aria-hidden="true" />
                Filtrar por
            </span>

            {lista.map((filtro) => (
                <label key={filtro.label} className="filter-pill">
                    <span style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 500 }}>
                        {filtro.label}
                    </span>

                    {/*
                        "value" (controlled) en lugar de "defaultValue":
                        así el select siempre refleja el estado real de App.jsx.
                        Cuando el usuario elige una opción, onCambio actualiza
                        el estado en App → re-render → value se actualiza.
                    */}
                    <select
                        name={filtro.label}
                        value={filtro.valorActual}
                        onChange={e => onCambio?.(filtro.label, e.target.value)}
                    >
                        {filtro.opciones.map(op => (
                            <option key={op} value={op}>{op}</option>
                        ))}
                    </select>

                    <ChevronDown
                        size={16}
                        aria-hidden="true"
                        style={{ position: 'absolute', right: 14, pointerEvents: 'none', color: 'var(--text-light)' }}
                    />
                </label>
            ))}
        </div>
    )
}
