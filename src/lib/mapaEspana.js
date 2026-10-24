// ══════════════════════════════════════════════════════════════════════════════
// mapaEspana.js — Lógica del mapa: de zonas del DW a provincias pintables
//
// En el data warehouse una zona es "CIUDAD SUBZONA" (ej: 'MADRID NORTE'), y
// cada ciudad coincide con una provincia. Aquí agrupamos las zonas por ciudad
// y las asociamos al código de provincia (cod_prov del INE) del mapa.
//
// Para agregar una ciudad nueva al mapa basta con sumarla a CIUDAD_PROVINCIA.
// ══════════════════════════════════════════════════════════════════════════════

import { normalizar } from './chartTheme'

// ciudad (sin tildes, en minúsculas) → código de provincia
export const CIUDAD_PROVINCIA = {
    barcelona: '08',
    bilbao:    '48',
    madrid:    '28',
    malaga:    '29',
    sevilla:   '41',
    valencia:  '46',
    zaragoza:  '50',
}

// Métricas que se pueden pintar en el mapa (el selector de la página)
export const METRICAS_MAPA = [
    { id: 'todas',  label: 'Todas',                      campo: 'total', descripcion: 'sesiones' },
    { id: 'ia',     label: 'Resueltas por IA',           campo: 'ia',    descripcion: 'resueltas por IA' },
    { id: 'primer', label: 'Resueltas en 1er contacto',  campo: 'fcr',   descripcion: 'resueltas en el primer contacto' },
]

// 'MÁLAGA' → 'Málaga'
export function titulo(texto) {
    const t = String(texto ?? '').toLowerCase()
    return t.charAt(0).toUpperCase() + t.slice(1)
}

// Agrupa las filas de get_mapa_sesiones (una por zona) en una entrada por ciudad
export function agruparPorCiudad(filas) {
    const ciudades = new Map()

    for (const f of filas ?? []) {
        const [ciudad, ...resto] = String(f.zona).split(' ')
        const clave = normalizar(ciudad)
        const c = ciudades.get(clave) ?? {
            clave,
            nombre: titulo(ciudad),
            cod: CIUDAD_PROVINCIA[clave],
            total: 0, ia: 0, fcr: 0,
            zonas: [],
        }
        const fila = {
            nombre: titulo(resto.join(' ')) || titulo(ciudad),
            total: Number(f.total_sesiones),
            ia:    Number(f.resueltas_ia),
            fcr:   Number(f.resueltas_primer_contacto),
        }
        c.total += fila.total
        c.ia    += fila.ia
        c.fcr   += fila.fcr
        c.zonas.push(fila)
        ciudades.set(clave, c)
    }
    return [...ciudades.values()]
}

// ── Escala de color: de celeste claro a azul intenso según el valor ──────────
const COLOR_MIN = [201, 226, 250]   // #C9E2FA
const COLOR_MAX = [29, 95, 191]     // #1D5FBF

export const COLOR_ESCALA_MIN = 'rgb(201, 226, 250)'
export const COLOR_ESCALA_MAX = 'rgb(29, 95, 191)'
export const COLOR_SIN_DATOS  = '#EAF1F9'

// ratio 0..1 → color. Devuelve también si el texto encima debe ser claro u oscuro.
export function colorEscala(ratio) {
    const t = Math.min(1, Math.max(0, ratio))
    const rgb = COLOR_MIN.map((min, i) => Math.round(min + (COLOR_MAX[i] - min) * t))
    return { fill: `rgb(${rgb.join(', ')})`, textoClaro: t > 0.5 }
}

// Centro del recuadro de un path SVG (para ubicar la etiqueta de la ciudad)
export function centroDePath(d) {
    const nums = [...d.matchAll(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g)].map(m => [Number(m[1]), Number(m[2])])
    const xs = nums.map(n => n[0]), ys = nums.map(n => n[1])
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
}
