import { UserRound } from 'lucide-react'

// PageHeader.jsx ─ Título de página + subtítulo + elementos a la derecha (estado, año…)

export function PageHeader({ titulo, subtitulo, children }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: 'clamp(28px, 2.6vw, 36px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--text)' }}>
                    {titulo}
                </h1>
                {subtitulo && (
                    <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 8 }}>
                        {subtitulo}
                    </p>
                )}
            </div>
            <div className="page-header-actions">
                <div className="app-profile" aria-label="Sesión iniciada como Pau M., analista de datos">
                    <span className="app-profile-avatar" aria-hidden="true">PM</span>
                    <span className="app-profile-copy"><strong>Pau M.</strong><small>Analista de datos</small></span>
                    <UserRound size={17} aria-hidden="true" />
                </div>
                {children}
            </div>
        </div>
    )
}
