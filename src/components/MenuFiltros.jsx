// MenuFiltros.jsx
// Barra de filtros del dashboard.
//
// Props:
//   filtros (array) — Lista de filtros. Cada uno tiene:
//     { label: "Año", opciones: ["2022", "2023", "2024"], valorInicial: "2023" }
//   onCambio (función) — Se llama cuando el usuario cambia un filtro.
//     Recibe (label, valorNuevo). Ej: ("Año", "2022")

// Datos mock — cuando haya datos reales, estos vendrán como prop
import { ChevronDown } from "lucide-react"

const filtrosMock = [
    { label: "Año",    opciones: ["2022", "2023", "2024"],                        valorInicial: "2023"    },
    { label: "Mes",    opciones: ["Enero","Febrero","Marzo","Octubre","Todos"],    valorInicial: "Octubre" },
    { label: "Canal",  opciones: ["Todos", "Llamadas", "Chat", "Email", "App"],   valorInicial: "Todos"   },
    { label: "Zona",   opciones: ["Global", "Norte", "Centro", "Sur"],            valorInicial: "Global"  },
]

export function MenuFiltros({ filtros = filtrosMock, onCambio }) {
    return (
        <div className="flex flex-wrap gap-2 justify-center py-2">
            {filtros.map((filtro) => (
                <div key={filtro.label} className="flex items-center gap-2 rounded-full px-4 py-2" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {filtro.label}
                    </span>

                    {/* Contenedor para el select y el ícono */}
                    <div className="relative flex items-center">
                        <select
                            defaultValue={filtro.valorInicial}
                            onChange={(e) => onCambio && onCambio(filtro.label, e.target.value)}
                            // Agregamos pr-4 (padding-right) para que el texto no pise el ícono
                            className="text-sm font-semibold cursor-pointer outline-none bg-transparent pr-4 appearance-none"
                            style={{ color: 'var(--accent)' }}
                        >
                            {filtro.opciones.map((opcion) => (
                                <option key={opcion} value={opcion}>{opcion}</option>
                            ))}
                        </select>

                        {/* Ícono de Lucide posicionado absolutamente a la derecha */}
                        <ChevronDown
                            size={14}
                            className="absolute right-0 pointer-events-none"
                            style={{ color: 'var(--accent)' }}
                        />
                    </div>

                </div>
            ))}
        </div>
    )
}