// Card.jsx ─ Contenedor estándar para gráficos, tablas y secciones
//
// Todas las tarjetas del dashboard comparten la misma anatomía:
//   título (qué es) · subtítulo (cómo leerlo) · acción opcional a la derecha · contenido
// Así el ojo encuentra la información siempre en el mismo lugar.

export function Card({ titulo, subtitulo, accion, children, className = '', bodyStyle }) {
    return (
        <section className={`card reveal ${className}`}>
            {(titulo || accion) && (
                <header className="card-header">
                    <div style={{ minWidth: 0 }}>
                        {titulo && <h2 className="card-title">{titulo}</h2>}
                        {subtitulo && <p className="card-subtitle">{subtitulo}</p>}
                    </div>
                    {accion}
                </header>
            )}
            <div className="card-body" style={bodyStyle}>
                {children}
            </div>
        </section>
    )
}

// Mensaje de estado (cargando / sin datos) con la misma altura que el gráfico
export function EstadoVacio({ alto = 220, children = 'Sin datos para este filtro' }) {
    return <div className="empty-state" style={{ height: alto }} role="status">{children}</div>
}
