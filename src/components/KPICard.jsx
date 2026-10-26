// src/components/KPICard.jsx
//
// Anatomía (igual en todas las tarjetas):
//   [ícono] Nombre del KPI
//           descripción corta
//   VALOR GRANDE
//   [chip de contexto]
//   ─────────────
//   nota al pie
//
// `color` define el TONO de la tarjeta:
//   'brand'    → por defecto (identidad de marca, sin significado de estado)
//   'good' | 'warning' | 'critical' → el KPI comunica un estado; el chip
//   lleva además un ícono para que el color nunca vaya solo.

import { CircleCheck, TriangleAlert, OctagonAlert } from 'lucide-react'
import { Tip } from './Tip.jsx'

const TONOS = {
    brand:    { icon: 'var(--brand)',            iconBg: 'var(--brand-soft)',            chip: 'var(--brand-ink)',            chipBg: 'var(--brand-softer)',          estado: null          },
    good:     { icon: 'var(--status-good)',      iconBg: 'var(--status-good-soft)',      chip: 'var(--status-good-ink)',      chipBg: 'var(--status-good-soft)',      estado: CircleCheck   },
    warning:  { icon: 'var(--status-warning-ink)', iconBg: 'var(--status-warning-soft)', chip: 'var(--status-warning-ink)',   chipBg: 'var(--status-warning-soft)',   estado: TriangleAlert },
    critical: { icon: 'var(--status-critical)',  iconBg: 'var(--status-critical-soft)',  chip: 'var(--status-critical-ink)',  chipBg: 'var(--status-critical-soft)',  estado: OctagonAlert  },
}

export function KPICard({
                            KPINombre,
                            ayuda,                // texto del tooltip del título
                            kpiLabel,
                            metricaKPI,
                            textoKPI,
                            color = 'brand',
                            tendencia,
                            icono: Icono,
                            esTextoLargo = false, // ← reduce la tipografía cuando la métrica es un texto (ej: nombre de problema)
                        }) {
    const t = TONOS[color] ?? TONOS.brand
    const IconoEstado = t.estado

    return (
        <article className="card kpi-card reveal">
            {/* Altura mínima fija: así los valores de todas las tarjetas quedan alineados */}
            <Tip as="div" texto={ayuda} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minHeight: 56 }}>
                {Icono && (
                    <span style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: 'grid', placeItems: 'center', background: t.iconBg, color: t.icon }}>
                        <Icono size={22} aria-hidden="true" />
                    </span>
                )}
                <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>
                        {KPINombre}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.35 }}>
                        {kpiLabel}
                    </p>
                </div>
            </Tip>

            {/* ── Métrica (ajusta su tamaño si es texto) ── */}
            <p
                className="tabular"
                title={esTextoLargo && typeof metricaKPI === 'string' ? metricaKPI : undefined}
                style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: esTextoLargo ? 22 : 38,
                    fontWeight: 700,
                    color: 'var(--text)',
                    lineHeight: esTextoLargo ? 1.25 : 1,
                    letterSpacing: esTextoLargo ? '-0.01em' : '-0.03em',
                    textTransform: esTextoLargo ? 'capitalize' : 'none',
                    // Truncar a 2 líneas si es muy largo para no romper la tarjeta
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}
            >
                {esTextoLargo && typeof metricaKPI === 'string' ? metricaKPI.toLowerCase() : metricaKPI}
            </p>

            {tendencia && (
                <span className="chip" style={{ background: t.chipBg, color: t.chip }}>
                    {IconoEstado && <IconoEstado size={15} aria-hidden="true" />}
                    {tendencia}
                </span>
            )}

            <p style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.45, minHeight: 'calc(2.9em + 13px)' }}>
                {textoKPI}
            </p>
        </article>
    )
}
