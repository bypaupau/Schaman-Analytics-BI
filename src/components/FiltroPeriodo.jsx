// ══════════════════════════════════════════════════════════════════════════════
// FiltroPeriodo.jsx — Un solo filtro de fecha: año, mes, rango o día
//
// Reemplaza a los filtros separados de Año y Mes. Al abrirlo se puede:
//   · elegir un año o un mes con los selectores rápidos, o
//   · tocar un día en el calendario (un solo día) y luego otro día (rango).
//
// Los cambios quedan en un borrador y solo se aplican con "Aplicar"; "Cerrar"
// (o Escape, o hacer clic fuera) los descarta.
//
// Props:
//   valor    → { desde, hasta } fechas ISO 'YYYY-MM-DD' del período activo
//   limites  → { min, max } primera y última fecha con datos
//   onCambio → callback({ desde, hasta }) al aplicar
// ══════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import {
    MESES, DIAS_SEMANA, aIso, partes, diasEnMes, rangoDeAnio, rangoDeMes,
    formatoCorto, describirPeriodo, tipoDeRango,
} from '../lib/fechas'

// Deja el rango dentro de las fechas que tienen datos
function acotar({ desde, hasta }, { min, max }) {
    return { desde: desde < min ? min : desde, hasta: hasta > max ? max : hasta }
}

export function FiltroPeriodo({ valor, limites, onCambio }) {
    const [abierto, setAbierto]   = useState(false)
    const [borrador, setBorrador] = useState(valor)
    const [vista, setVista]       = useState(() => ({ anio: partes(valor.desde).anio, mes: partes(valor.desde).mes }))
    const [eligiendoFin, setEligiendoFin] = useState(false)   // true tras tocar el primer día de un rango
    const contenedor = useRef(null)

    const anioMin = partes(limites.min).anio
    const anioMax = partes(limites.max).anio
    const anios = Array.from({ length: anioMax - anioMin + 1 }, (_, i) => anioMin + i)

    // Cierra con Escape o al hacer clic fuera del filtro
    useEffect(() => {
        if (!abierto) return
        const fuera  = e => { if (!contenedor.current?.contains(e.target)) setAbierto(false) }
        const tecla  = e => { if (e.key === 'Escape') setAbierto(false) }
        document.addEventListener('mousedown', fuera)
        document.addEventListener('keydown', tecla)
        return () => {
            document.removeEventListener('mousedown', fuera)
            document.removeEventListener('keydown', tecla)
        }
    }, [abierto])

    function abrir() {
        setBorrador(valor)
        setVista({ anio: partes(valor.desde).anio, mes: partes(valor.desde).mes })
        setEligiendoFin(false)
        setAbierto(true)
    }

    function fijar(rango, mesVista) {
        const r = acotar(rango, limites)
        setBorrador(r)
        setVista({ anio: partes(r.desde).anio, mes: mesVista ?? partes(r.desde).mes })
        setEligiendoFin(false)
    }

    // ── Selectores rápidos ────────────────────────────────────────────────────
    const tipo = tipoDeRango(borrador.desde, borrador.hasta)

    function elegirAnio(anio) {
        fijar(tipo.tipo === 'mes' ? rangoDeMes(anio, tipo.mes) : rangoDeAnio(anio))
    }
    function elegirMes(valorSelect) {
        fijar(valorSelect === 'todo' ? rangoDeAnio(tipo.anio) : rangoDeMes(tipo.anio, Number(valorSelect)))
    }
    function restablecer() {
        fijar(rangoDeAnio(anioMax))
    }

    // ── Calendario ────────────────────────────────────────────────────────────
    function cambiarMes(delta) {
        setVista(v => {
            const total = v.anio * 12 + (v.mes - 1) + delta
            return { anio: Math.floor(total / 12), mes: (total % 12) + 1 }
        })
    }
    const puedeRetroceder = aIso(vista.anio, vista.mes, 1) > limites.min
    const puedeAvanzar    = aIso(vista.anio, vista.mes, diasEnMes(vista.anio, vista.mes)) < limites.max

    function elegirDia(iso) {
        if (!eligiendoFin) {
            setBorrador({ desde: iso, hasta: iso })     // primer toque: ese día
            setEligiendoFin(true)
        } else {
            const [desde, hasta] = iso < borrador.desde ? [iso, borrador.desde] : [borrador.desde, iso]
            setBorrador({ desde, hasta })               // segundo toque: cierra el rango
            setEligiendoFin(false)
        }
    }

    const vacios = (new Date(vista.anio, vista.mes - 1, 1).getDay() + 6) % 7   // la semana empieza en lunes
    const celdas = [
        ...Array(vacios).fill(null),
        ...Array.from({ length: diasEnMes(vista.anio, vista.mes) }, (_, i) => i + 1),
    ]

    function aplicar() {
        onCambio(borrador)
        setAbierto(false)
    }

    return (
        <div className="periodo" ref={contenedor}>
            <button
                type="button"
                className="filter-pill filter-pill-boton"
                aria-haspopup="dialog"
                aria-expanded={abierto}
                onClick={() => (abierto ? setAbierto(false) : abrir())}
            >
                <span style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 500 }}>Período</span>
                <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{describirPeriodo(valor.desde, valor.hasta)}</span>
                <CalendarDays size={16} aria-hidden="true" style={{ color: 'var(--text-light)' }} />
            </button>

            {abierto && (
                <div className="periodo-pop" role="dialog" aria-label="Elegir período">
                    <div className="periodo-pop-cabecera">
                        <h3>Período</h3>
                        <button type="button" className="periodo-reiniciar" onClick={restablecer}>Restablecer</button>
                    </div>

                    <div className="periodo-rapido">
                        <label>
                            <span>Año</span>
                            <select value={tipo.anio} onChange={e => elegirAnio(Number(e.target.value))}>
                                {anios.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </label>
                        <label>
                            <span>Mes</span>
                            <select
                                value={tipo.tipo === 'mes' ? tipo.mes : tipo.tipo === 'anio' ? 'todo' : 'personalizado'}
                                onChange={e => elegirMes(e.target.value)}
                            >
                                <option value="todo">Todo el año</option>
                                {tipo.tipo === 'personalizado' && <option value="personalizado" disabled>Personalizado</option>}
                                {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </label>
                    </div>

                    <div className="periodo-campos">
                        <div><span>Desde</span><strong className="tabular">{formatoCorto(borrador.desde)}</strong></div>
                        <div><span>Hasta</span><strong className="tabular">{formatoCorto(borrador.hasta)}</strong></div>
                    </div>

                    <div className="cal">
                        <div className="cal-nav">
                            <button type="button" onClick={() => cambiarMes(-1)} disabled={!puedeRetroceder} aria-label="Mes anterior">
                                <ChevronLeft size={18} aria-hidden="true" />
                            </button>
                            <strong>{MESES[vista.mes - 1]} {vista.anio}</strong>
                            <button type="button" onClick={() => cambiarMes(1)} disabled={!puedeAvanzar} aria-label="Mes siguiente">
                                <ChevronRight size={18} aria-hidden="true" />
                            </button>
                        </div>

                        <div className="cal-grid" role="grid" aria-label={`${MESES[vista.mes - 1]} ${vista.anio}`}>
                            {DIAS_SEMANA.map((d, i) => (
                                <span key={d} className="cal-dia-semana" data-finde={i >= 5 || undefined}>{d}</span>
                            ))}
                            {celdas.map((dia, i) => {
                                if (dia === null) return <span key={`v${i}`} />
                                const iso = aIso(vista.anio, vista.mes, dia)
                                const extremo = iso === borrador.desde || iso === borrador.hasta
                                const enRango = iso > borrador.desde && iso < borrador.hasta
                                const fueraDeDatos = iso < limites.min || iso > limites.max
                                return (
                                    <button
                                        key={iso}
                                        type="button"
                                        className="cal-celda"
                                        data-extremo={extremo || undefined}
                                        data-rango={enRango || undefined}
                                        data-inicio={(iso === borrador.desde && borrador.desde !== borrador.hasta) || undefined}
                                        data-fin={(iso === borrador.hasta && borrador.desde !== borrador.hasta) || undefined}
                                        disabled={fueraDeDatos}
                                        aria-pressed={extremo || enRango}
                                        aria-label={formatoCorto(iso)}
                                        onClick={() => elegirDia(iso)}
                                    >
                                        <span>{dia}</span>
                                    </button>
                                )
                            })}
                        </div>
                        <p className="cal-ayuda">
                            {eligiendoFin ? 'Toca otro día para cerrar el rango' : 'Toca un día, o dos para un rango'}
                        </p>
                    </div>

                    <div className="periodo-pie">
                        <button type="button" className="periodo-cerrar" onClick={() => setAbierto(false)}>Cerrar</button>
                        <button type="button" className="periodo-aplicar" onClick={aplicar}>Aplicar</button>
                    </div>
                </div>
            )}
        </div>
    )
}
