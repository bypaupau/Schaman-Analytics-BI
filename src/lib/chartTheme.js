// ══════════════════════════════════════════════════════════════════════════════
// chartTheme.js — Fuente única de colores y estilos para TODOS los gráficos
//
// Reglas que seguimos (para que el dashboard se lea como un solo sistema):
//   1. Paleta categórica en ORDEN FIJO (validada para daltonismo). Sirve para
//      identidad: canales, categorías… Un color = una entidad, siempre.
//   2. El color sigue a la ENTIDAD, no a su posición: si un filtro quita un
//      canal, los demás conservan su color (ver colorCanal / colorPorNombre).
//   3. Una sola serie → un solo color (SERIES[0]). No pintamos barras distintas
//      si todas miden lo mismo.
//   4. Los colores de ESTADO (bueno / atención / serio / crítico) están
//      reservados para significado, y siempre van con texto o leyenda.
//   5. Los textos (etiquetas, valores, ejes) usan colores de texto, no el de la serie.
//
// Los valores son los mismos que los tokens de src/index.css (--series-*, --status-*).
// ══════════════════════════════════════════════════════════════════════════════

export const SERIES = [
    '#0F8F84', // 1 teal (marca)
    '#EB6834', // 2 naranja
    '#3B6FD8', // 3 azul
    '#EDA100', // 4 ámbar
    '#D9659A', // 5 rosa
    '#7C5FD6', // 6 violeta
    '#8A9A2A', // 7 oliva
    '#5AA9D6', // 8 celeste
]

// Color para la porción "Otros" cuando hay más de 8 categorías
export const COLOR_OTROS = '#A3B1AF'

export const STATUS = {
    good:     { fill: '#0CA30C', ink: '#0B7A2E', soft: '#E8F6E8' },
    warning:  { fill: '#FAB219', ink: '#8A5A00', soft: '#FEF4DC' },
    serious:  { fill: '#EC835A', ink: '#A8461C', soft: '#FDEDE5' },
    critical: { fill: '#D03B3B', ink: '#B42828', soft: '#FBEAEA' },
    neutral:  { fill: '#7E93AE', ink: '#4B5F5C', soft: '#EEF2F6' },
}

export const INK = {
    text:  '#0F1F1D',
    muted: '#4B5F5C',
    light: '#637572',
    grid:  '#E6EEEC',
    surface: '#FFFFFF',
}

// ── Estilo común de ejes y grilla (recesivos: no compiten con los datos) ─────
export const AXIS_TICK = { fontSize: 12, fill: INK.light, fontFamily: 'Figtree, sans-serif' }
export const AXIS_TICK_LABEL = { ...AXIS_TICK, fill: INK.muted, fontWeight: 500 }
export const GRID_PROPS = { stroke: INK.grid, strokeDasharray: '4 4' }
export const CURSOR_BAR = { fill: 'rgba(15,143,132,0.06)' }
export const CURSOR_LINE = { stroke: '#9FB3B0', strokeWidth: 1, strokeDasharray: '4 4' }

// ── Helpers ──────────────────────────────────────────────────────────────────

export function normalizar(str) {
    return String(str ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
}

// Canales conocidos → slot fijo. Así "Chat" es del mismo color en el donut
// y en la tabla, sin importar cuántos canales haya en el filtro.
const CANAL_SLOT = {
    llamada: 0, llamadas: 0, telefono: 0, voz: 0, call: 0,
    chat: 1,
    email: 2, correo: 2, 'e-mail': 2,
    app: 3, movil: 3, 'app movil': 3,
    whatsapp: 0,
    'web chat': 5,
    web: 5,
    redes: 6, 'redes sociales': 6,
    tienda: 7, presencial: 7,
}

// Canal no conocido → slot derivado del nombre (hash simple), para que
// tenga el mismo color en el donut y en la tabla.
export function colorCanal(nombre) {
    const clave = normalizar(nombre)
    const slot = CANAL_SLOT[clave]
        ?? [...clave].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0) % SERIES.length
    return SERIES[slot]
}

// Para categorías sin mapa conocido: ordenamos alfabéticamente los nombres
// y asignamos por esa posición → estable aunque cambie el ranking por valor.
export function colorPorNombre(nombres) {
    const orden = [...new Set(nombres.map(String))].sort((a, b) => a.localeCompare(b, 'es'))
    return nombre => SERIES[orden.indexOf(String(nombre)) % SERIES.length]
}

// Umbrales únicos para métricas en % donde "más es mejor"
export function statusPorPorcentaje(v, { bueno = 80, medio = 50 } = {}) {
    if (v >= bueno) return 'good'
    if (v >= medio) return 'warning'
    return 'critical'
}

// Ancho del eje de etiquetas según el nombre más largo (aprox. 8.5px por carácter a 12px, mayúsculas incluidas)
export function anchoEtiquetas(data, key, max = 170) {
    const largo = Math.max(...data.map(d => String(d[key] ?? '').length))
    return Math.min(max, Math.max(56, largo * 8.5 + 12))
}

export const formatoNumero = new Intl.NumberFormat('es-ES')
