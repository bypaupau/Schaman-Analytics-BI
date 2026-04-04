// MenuFiltros.jsx ─ Fila de filtros tipo pill, alineados a la IZQUIERDA
// (antes estaban centrados con justify-center, lo que los desalineaba del contenido)

import { ChevronDown } from "lucide-react"

const filtrosMock = [
    { label: "Año",   opciones: ["2022", "2023", "2024"],                       valorInicial: "2023"    },
    { label: "Mes",   opciones: ["Enero","Febrero","Marzo","Octubre","Todos"],   valorInicial: "Octubre" },
    { label: "Canal", opciones: ["Todos", "Llamadas", "Chat", "Email", "App"],  valorInicial: "Todos"   },
    { label: "Zona",  opciones: ["Global", "Norte", "Centro", "Sur"],           valorInicial: "Global"  },
]

export function MenuFiltros({ filtros = filtrosMock, onCambio }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {filtros.map((filtro) => (
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
                        <select
                            defaultValue={filtro.valorInicial}
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
