// 1. Importamos el ícono "Menu" (las tres rayitas)
import { Home, BarChart, Users, Settings, Menu } from "lucide-react"

// 2. Aquí recibimos la variable "abierto" Y la función "setAbierto"
export function MenuLateral({ abierto, setAbierto }) {
    return (
        <aside className={`${abierto ? 'w-64' : 'w-20'} min-h-screen flex flex-col transition-all duration-300 overflow-hidden shrink-0 "shadow-[50px_0_15px_-3px_rgba(0,0,0,0.8)] }`} style={{ background: 'var(--card)' }}>

            {/* Header del menú convertido en un BOTÓN CLICKABLE */}
            <button
                onClick={() => setAbierto(!abierto)} // 3. Al hacer clic, cambia el estado
                className="h-[76px] flex items-center px-6 shrink-0 cursor-pointer hover:bg-slate-50 transition-colors w-full"
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                {/* 4. LÓGICA DEL SEMÁFORO DEL HEADER */}
                {abierto ? (
                    // Si está abierto, mostramos el texto "Navegación"
                    <span className="font-bold text-[20px] truncate" style={{ color: 'var(--text-muted)' }}>
                        Navegación
                    </span>
                ) : (
                    // Si está cerrado (w-20), mostramos el ícono centrado y azul
                    <div className="w-full flex justify-center -ml-2"> {/* Ajuste fino de centrado */}
                        <Menu size={24} style={{ color: 'var(--brand-blue)' }} />
                    </div>
                )}
            </button>

            {/* Links del menú (el resto del código queda igual, ya lo tenías bien) */}
            <nav className="flex-1 p-4 flex flex-col gap-2">

                {/* Opción Activa */}
                <a href="#" className="flex items-center gap-3 p-3 rounded-4xl font-semibold transition-colors" style={{ background: 'var(--text-light)', color: 'white' }}>
                    <Home size={20} className="shrink-0" />
                    {abierto && <span className="whitespace-nowrap">Dashboard</span>}
                </a>

                {/* Opciones Inactivas */}
                <a href="#" className="flex items-center gap-3 p-3 rounded-xl font-medium transition-colors hover:bg-slate-100" style={{ color: 'var(--text-muted)' }}>
                    <BarChart size={20} className="shrink-0" />
                    {abierto && <span className="whitespace-nowrap">Analítica</span>}
                </a>

                <a href="#" className="flex items-center gap-3 p-3 rounded-xl font-medium transition-colors hover:bg-slate-100" style={{ color: 'var(--text-muted)' }}>
                    <Users size={20} className="shrink-0" />
                    {abierto && <span className="whitespace-nowrap">Agentes de IA</span>}
                </a>

                <a href="#" className="flex items-center gap-3 p-3 rounded-xl font-medium transition-colors hover:bg-slate-100" style={{ color: 'var(--text-muted)' }}>
                    <Settings size={20} className="shrink-0" />
                    {abierto && <span className="whitespace-nowrap">Configuración</span>}
                </a>

            </nav>

        </aside>
    )
}