// MenuFiltros.jsx ─ Fila de filtros tipo pill, alineados a la IZQUIERDA
// Ahora acepta datos reales de Supabase (vía App.jsx) o usa el mock interno.
//
// Props:
//   filtros   → array de { label, opciones[], valorActual } — si null usa filtrosMock
//   onCambio  → callback(label: string, value: string) cuando el usuario cambia un filtro

import { ChevronDown } from "lucide-react"

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lista.map((filtro) => (
                <div
                    key={filtro.label}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px',
                        borderRadius: 999,
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow)',
                    }}
                >
                    <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 500 }}>
                        {filtro.label}
                    </span>

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        {/*
                            "value" (controlled) en lugar de "defaultValue":
                            así el select siempre refleja el estado real de App.jsx.
                            Cuando el usuario elige una opción, onCambio actualiza
                            el estado en App → re-render → value se actualiza.
                        */}
                        <select
                            value={filtro.valorActual}
                            onChange={e => onCambio?.(filtro.label, e.target.value)}
                            style={{
                                fontSize: 12, fontWeight: 700,
                                color: 'var(--brand)',
                                background: 'transparent',
                                border: 'none', outline: 'none',
                                paddingRight: 16, cursor: 'pointer',
                                appearance: 'none',
                            }}
                        >
                            {filtro.opciones.map(op => (
                                <option key={op} value={op}>{op}</option>
                            ))}
                        </select>

                        <ChevronDown
                            size={13}
                            style={{ position: 'absolute', right: 0, pointerEvents: 'none', color: 'var(--text-light)' }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
