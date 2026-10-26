// ══════════════════════════════════════════════════════════════════════════════
// Tip.jsx — Tooltip explicativo para títulos (y para el texto de ayuda de las tablas)
//
//   <Tip texto={AYUDAS.fcr}>FCR</Tip>
//
// El texto del tooltip usa el mismo estilo que los encabezados de la tabla de
// sesiones: fondo celeste, cada \n es un párrafo y lo que va antes de ":" sale
// en negrita (ver <Ayuda>).
//
// El tooltip se dibuja en <body> con posición fija (portal). Así no lo corta
// ninguna tarjeta con overflow ni lo tapa la tarjeta vecina, y se acomoda solo:
// se alinea al borde de la pantalla si no cabe y se abre hacia arriba si abajo
// no hay espacio. Aparece con el cursor y también con el foco del teclado.
//
// El título conserva su aspecto: lo único que cambia es el cursor (de ayuda).
// ══════════════════════════════════════════════════════════════════════════════

import { createElement, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Convierte el texto de ayuda en párrafos; lo que va antes de ":" (el subtítulo) sale en negrita.
// Solo cuenta como subtítulo un texto corto sin puntos, para no poner en negrita frases largas.
export function Ayuda({ texto }) {
    return texto.split('\n').map((linea, i) => {
        const m = linea.match(/^([^:.]{1,28}:)\s*(.*)$/)
        return (
            <span key={i} className="col-tip-linea">
                {m ? <><strong>{m[1]}</strong> {m[2]}</> : linea}
            </span>
        )
    })
}

const ANCHO_MAXIMO = 340
const MARGEN = 16

// `as` elige el elemento que actúa como zona sensible (por defecto un <span> en línea). Se puede
// usar un <div> para que reaccione toda la cabecera de una tarjeta y no solo las letras del título.
export function Tip({ texto, as: Elemento = 'span', className = '', style, children }) {
    const ref = useRef(null)
    const id = useId()
    const [pos, setPos] = useState(null)   // null = tooltip oculto

    function mostrar() {
        const r = ref.current.getBoundingClientRect()
        const ancho = Math.min(ANCHO_MAXIMO, window.innerWidth - MARGEN * 2)
        const left = Math.min(Math.max(MARGEN, r.left), window.innerWidth - ancho - MARGEN)
        // Si el título está en la mitad de abajo de la pantalla, el tooltip se abre hacia arriba
        const haciaArriba = r.bottom > window.innerHeight * 0.6
        setPos(haciaArriba
            ? { left, ancho, bottom: window.innerHeight - r.top + 10 }
            : { left, ancho, top: r.bottom + 10 })
    }
    const ocultar = () => setPos(null)

    // Al hacer scroll el título se mueve y el tooltip quedaría flotando: se cierra
    useEffect(() => {
        if (!pos) return
        window.addEventListener('scroll', ocultar, true)
        return () => window.removeEventListener('scroll', ocultar, true)
    }, [pos])

    // Sin texto de ayuda se comporta como un contenedor normal (sin cursor ni tooltip)
    if (!texto) return createElement(Elemento, { className, style }, children)

    return (
        <>
            {createElement(Elemento, {
                ref,
                className: `tip ${className}`.trim(),
                style,
                tabIndex: 0,
                'aria-describedby': pos ? id : undefined,
                onMouseEnter: mostrar,
                onMouseLeave: ocultar,
                onFocus: mostrar,
                onBlur: ocultar,
            }, children)}
            {pos && createPortal(
                <span
                    role="tooltip"
                    id={id}
                    className="col-tip-texto tip-flotante"
                    style={{ left: pos.left, top: pos.top ?? 'auto', bottom: pos.bottom ?? 'auto', width: pos.ancho }}
                >
                    <Ayuda texto={texto} />
                </span>,
                document.body,
            )}
        </>
    )
}
