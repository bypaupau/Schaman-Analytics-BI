// ══════════════════════════════════════════════════════════════════════════════
// fechas.js — Utilidades de fechas para el filtro de período
//
// Todas las fechas viajan como texto ISO 'YYYY-MM-DD' (es lo que reciben las
// funciones RPC). Se construyen con año/mes/día locales y nunca con toISOString(),
// que convierte a UTC y puede correr la fecha un día.
// ══════════════════════════════════════════════════════════════════════════════

export const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const dos = n => String(n).padStart(2, '0')

// (2025, 12, 23) → '2025-12-23'   (mes de 1 a 12)
export function aIso(anio, mes, dia) {
    return `${anio}-${dos(mes)}-${dos(dia)}`
}

// '2025-12-23' → { anio: 2025, mes: 12, dia: 23 }
export function partes(iso) {
    const [anio, mes, dia] = String(iso).split('-').map(Number)
    return { anio, mes, dia }
}

export function diasEnMes(anio, mes) {
    return new Date(anio, mes, 0).getDate()
}

export function rangoDeAnio(anio) {
    return { desde: aIso(anio, 1, 1), hasta: aIso(anio, 12, 31) }
}

export function rangoDeMes(anio, mes) {
    return { desde: aIso(anio, mes, 1), hasta: aIso(anio, mes, diasEnMes(anio, mes)) }
}

// '2025-12-23' → '23/12/2025'
export function formatoCorto(iso) {
    const { anio, mes, dia } = partes(iso)
    return `${dos(dia)}/${dos(mes)}/${anio}`
}

// Cuántos días abarca el rango, contando ambos extremos
export function diasDelRango(desde, hasta) {
    const a = partes(desde), b = partes(hasta)
    const ms = Date.UTC(b.anio, b.mes - 1, b.dia) - Date.UTC(a.anio, a.mes - 1, a.dia)
    return Math.round(ms / 86400000) + 1
}

// Describe el rango con las palabras que usaría una persona:
//   año completo → "Año 2025" · mes completo → "Octubre 2025"
//   un solo día  → "23/12/2025" · otro rango → "01/10/2025 – 18/10/2025"
export function describirPeriodo(desde, hasta) {
    if (!desde || !hasta) return ''
    const a = partes(desde), b = partes(hasta)

    if (desde === hasta) return formatoCorto(desde)
    if (desde === aIso(a.anio, 1, 1) && hasta === aIso(a.anio, 12, 31)) return `Año ${a.anio}`
    if (a.anio === b.anio && a.mes === b.mes && a.dia === 1 && b.dia === diasEnMes(b.anio, b.mes)) {
        return `${MESES[a.mes - 1]} ${a.anio}`
    }
    return `${formatoCorto(desde)} – ${formatoCorto(hasta)}`
}

// ¿Cubre el rango un año completo o un mes completo? Sirve para los selectores rápidos.
export function tipoDeRango(desde, hasta) {
    const a = partes(desde), b = partes(hasta)
    if (desde === aIso(a.anio, 1, 1) && hasta === aIso(a.anio, 12, 31)) return { tipo: 'anio', anio: a.anio }
    if (a.anio === b.anio && a.mes === b.mes && a.dia === 1 && b.dia === diasEnMes(b.anio, b.mes)) {
        return { tipo: 'mes', anio: a.anio, mes: a.mes }
    }
    return { tipo: 'personalizado', anio: a.anio }
}
