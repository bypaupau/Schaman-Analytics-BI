-- ══════════════════════════════════════════════════════════════════════════════
-- fallos_sesiones_con_fallo.sql
-- Corrige las tarjetas "Sesiones con fallo" e "Impacto del problema" de Análisis de fallos:
--   · get_fallos_top_problemas: agrega la columna sesiones_con_fallo (sesiones sin resolver por problema)
--   · get_fallos_resumen (nueva): total de sesiones y total sin resolver del período
-- Son las mismas funciones de filtro_periodo.sql (sección 4): úsalo si ya ejecutaste ese archivo.
-- ══════════════════════════════════════════════════════════════════════════════

-- Se borra la versión anterior porque esta devuelve una columna más (sesiones_con_fallo)
DROP FUNCTION IF EXISTS get_fallos_top_problemas(
    date, date, character varying, character varying, character varying, integer
);

-- Problemas más frecuentes del período. total_sesiones cuenta TODAS las sesiones del problema (resueltas o no);
-- sesiones_con_fallo cuenta solo las que terminaron sin resolverse (escaladas, pendientes o abandonadas).
CREATE OR REPLACE FUNCTION get_fallos_top_problemas(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR,
    p_limit   INT DEFAULT 10
)
RETURNS TABLE (
    problema           VARCHAR,
    total_sesiones     BIGINT,
    tasa_resolucion    NUMERIC,
    prioridad          VARCHAR,
    color              VARCHAR,
    sesiones_con_fallo BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.nombre_problema::VARCHAR AS problema,
        COUNT(*)::BIGINT AS total_sesiones,
        ROUND(
            (COUNT(*) FILTER (WHERE h.resultado_sesion = 'RESUELTO') * 100.0)
            / NULLIF(COUNT(*), 0),
        1)::NUMERIC AS tasa_resolucion,
        p.prioridad::VARCHAR AS prioridad,
        CASE p.prioridad
            WHEN 'Crítica' THEN '#EF4444'
            WHEN 'Alta'    THEN '#F97316'
            WHEN 'Media'   THEN '#EAB308'
            ELSE                '#3B82F6'
        END::VARCHAR AS color,
        COUNT(*) FILTER (
            WHERE h.resultado_sesion IN ('ESCALADO', 'ABANDONADO', 'PENDIENTE')
        )::BIGINT AS sesiones_con_fallo

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA    d ON h.id_fecha_sk    = d.id_fecha_sk
    JOIN DIM_PROBLEMA p ON h.id_problema_sk = p.id_problema_sk
    JOIN DIM_CANAL    c ON h.id_canal_sk    = c.id_canal_sk
    JOIN DIM_ZONA_GEO z ON h.id_zona_sk     = z.id_zona_sk

    WHERE (d.fecha_completa BETWEEN p_desde AND p_hasta)
      AND (p_canal = 'Todos' OR c.nombre_canal = p_canal)
      AND (p_region = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1) = p_region)
      AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)

    GROUP BY p.nombre_problema, p.prioridad
    ORDER BY total_sesiones DESC
    LIMIT p_limit;
END;
$$;


-- Resumen del período: total de sesiones y cuántas terminaron sin resolverse.
-- Es el dato de las tarjetas "Sesiones con fallo" e "Impacto del problema".
CREATE OR REPLACE FUNCTION get_fallos_resumen(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    total_sesiones     BIGINT,
    sesiones_con_fallo BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_sesiones,
        COUNT(*) FILTER (
            WHERE h.resultado_sesion IN ('ESCALADO', 'ABANDONADO', 'PENDIENTE')
        )::BIGINT AS sesiones_con_fallo

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
    JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
    JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

    WHERE (d.fecha_completa BETWEEN p_desde AND p_hasta)
      AND (p_canal = 'Todos' OR c.nombre_canal = p_canal)
      AND (p_region = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1) = p_region)
      AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona);
END;
$$;

-- Actualiza la caché de funciones RPC de Supabase/PostgREST.
NOTIFY pgrst, 'reload schema';
