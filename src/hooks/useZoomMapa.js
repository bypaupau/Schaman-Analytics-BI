// ══════════════════════════════════════════════════════════════════════════════
// useZoomMapa.js — Zoom y desplazamiento de un SVG moviendo su viewBox
//
//   · Ctrl/⌘ + rueda (o pellizco en el trackpad) → acerca/aleja en el cursor
//   · Arrastrar con el mouse                       → mover el mapa
//   · acercar() / alejar() / reiniciar()           → para los botones
//
// La rueda sin Ctrl/⌘ se deja pasar a propósito: así la página sigue haciendo
// scroll con normalidad al pasar el cursor por encima del mapa.
// ══════════════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from 'react'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export function useZoomMapa({ ancho, alto, zoomMaximo = 8 }) {
    const svgRef    = useRef(null)
    const arrastre  = useRef(null)
    const [vista, setVista] = useState({ x: 0, y: 0, w: ancho })

    // Mantiene el recuadro visible dentro del mapa y el zoom dentro de sus límites
    const limitar = useCallback(({ x, y, w }) => {
        const nw = clamp(w, ancho / zoomMaximo, ancho)
        const nh = nw * alto / ancho
        return { x: clamp(x, 0, ancho - nw), y: clamp(y, 0, alto - nh), w: nw }
    }, [ancho, alto, zoomMaximo])

    // Cambia el zoom por `factor` dejando fijo el punto (cx, cy) en coordenadas del SVG
    const zoomEn = useCallback((factor, cx, cy) => {
        setVista(v => {
            const nw = clamp(v.w / factor, ancho / zoomMaximo, ancho)
            const k = nw / v.w
            return limitar({ x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k, w: nw })
        })
    }, [ancho, zoomMaximo, limitar])

    const acercar   = () => zoomEn(1.5, vista.x + vista.w / 2, vista.y + (vista.w * alto / ancho) / 2)
    const alejar    = () => zoomEn(1 / 1.5, vista.x + vista.w / 2, vista.y + (vista.w * alto / ancho) / 2)
    const reiniciar = () => setVista({ x: 0, y: 0, w: ancho })

    // Rueda: listener nativo y no pasivo, porque React no deja usar preventDefault en onWheel
    useEffect(() => {
        const svg = svgRef.current
        if (!svg) return
        function onWheel(e) {
            if (!e.ctrlKey && !e.metaKey) return
            e.preventDefault()
            const rect = svg.getBoundingClientRect()
            setVista(v => {
                const cx = v.x + ((e.clientX - rect.left) / rect.width)  * v.w
                const cy = v.y + ((e.clientY - rect.top)  / rect.height) * (v.w * alto / ancho)
                const nw = clamp(v.w / Math.exp(-e.deltaY * 0.0025), ancho / zoomMaximo, ancho)
                const k = nw / v.w
                return limitar({ x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k, w: nw })
            })
        }
        svg.addEventListener('wheel', onWheel, { passive: false })
        return () => svg.removeEventListener('wheel', onWheel)
    }, [ancho, alto, zoomMaximo, limitar])

    // Arrastre con el mouse
    const eventosArrastre = {
        onPointerDown(e) {
            if (e.pointerType === 'touch' || e.button !== 0) return
            e.currentTarget.setPointerCapture(e.pointerId)
            arrastre.current = { x: e.clientX, y: e.clientY, vista }
        },
        onPointerMove(e) {
            const a = arrastre.current
            if (!a) return
            const rect = e.currentTarget.getBoundingClientRect()
            const dx = ((e.clientX - a.x) / rect.width)  * a.vista.w
            const dy = ((e.clientY - a.y) / rect.height) * (a.vista.w * alto / ancho)
            setVista(limitar({ x: a.vista.x - dx, y: a.vista.y - dy, w: a.vista.w }))
        },
        onPointerUp()     { arrastre.current = null },
        onPointerCancel() { arrastre.current = null },
    }

    const zoom = ancho / vista.w
    return {
        svgRef, eventosArrastre, acercar, alejar, reiniciar, zoom,
        viewBox: `${vista.x} ${vista.y} ${vista.w} ${vista.w * alto / ancho}`,
        puedeAcercar: zoom < zoomMaximo - 0.01,
        puedeAlejar:  zoom > 1.01,
    }
}
