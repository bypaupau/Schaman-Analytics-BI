-- ══════════════════════════════════════════════════════════════════════════════
-- filtro_periodo.sql
-- Migración del filtro de fecha: de (p_anio, p_mes) a un rango (p_desde, p_hasta).
--
-- El dashboard ahora tiene un solo filtro "Período" que permite elegir un año,
-- un mes, un rango de fechas o un día. Para eso todas las funciones reciben dos
-- fechas y filtran con:   d.fecha_completa BETWEEN p_desde AND p_hasta
--   · un año    → 2025-01-01 a 2025-12-31
--   · un mes    → 2025-10-01 a 2025-10-31
--   · un día    → p_desde = p_hasta
--
-- CÓMO EJECUTARLO: pega el archivo completo en el SQL Editor de Supabase y dale
-- Run. Es seguro repetirlo (usa IF NOT EXISTS y CREATE OR REPLACE).
-- La limpieza de las versiones viejas está al final (paso 3).
-- ══════════════════════════════════════════════════════════════════════════════


-- ── 0. ID real de sesión en la tabla de hechos (no hace nada si ya existe) ───
ALTER TABLE hecho_sesion_omnicanal
    ADD COLUMN IF NOT EXISTS id_sesion_sk BIGINT GENERATED ALWAYS AS IDENTITY;

CREATE UNIQUE INDEX IF NOT EXISTS ux_hecho_sesion_id_sesion_sk
    ON hecho_sesion_omnicanal (id_sesion_sk);


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. KPIs
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_kpi_fcr(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    fcr_pct        NUMERIC,
    total_sesiones BIGINT  -- sesiones con resolucion_primer_contacto informado
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(
            (COUNT(*) FILTER (WHERE h.resolucion_primer_contacto = true) * 100.0)
            / NULLIF(COUNT(*) FILTER (WHERE h.resolucion_primer_contacto IS NOT NULL), 0),
        1) AS fcr_pct,

        COUNT(*) FILTER (WHERE h.resolucion_primer_contacto IS NOT NULL) AS total_sesiones

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
    JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
    JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

    WHERE
        (d.fecha_completa BETWEEN p_desde AND p_hasta)
        AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
        AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
        AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona);
END;
$$;


CREATE OR REPLACE FUNCTION get_kpi_tmo(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    tmo_segundos NUMERIC,
    tmo_minutos  NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(AVG(h.duracion_segundos), 0)        AS tmo_segundos,
        ROUND(AVG(h.duracion_segundos) / 60.0, 1) AS tmo_minutos

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
    JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
    JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

    WHERE
        (d.fecha_completa BETWEEN p_desde AND p_hasta)
        AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
        AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
        AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona);
END;
$$;


CREATE OR REPLACE FUNCTION get_kpi_tnps(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    tnps_score      NUMERIC,
    promotores_pct  NUMERIC,
    detractores_pct NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH NPS_Base AS (
        SELECT
            ROUND(
                (COUNT(*) FILTER (WHERE h.calificacion_satisfaccion >= 9) * 100.0)
                / NULLIF(COUNT(*) FILTER (WHERE h.calificacion_satisfaccion IS NOT NULL), 0),
            1) AS prom,

            ROUND(
                (COUNT(*) FILTER (WHERE h.calificacion_satisfaccion <= 6) * 100.0)
                / NULLIF(COUNT(*) FILTER (WHERE h.calificacion_satisfaccion IS NOT NULL), 0),
            1) AS det

        FROM HECHO_SESION_OMNICANAL h
        JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
        JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
        JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

        WHERE
            (d.fecha_completa BETWEEN p_desde AND p_hasta)
            AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
            AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
            AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)
    )
    SELECT
        ROUND(COALESCE(prom, 0) - COALESCE(det, 0), 0) AS tnps_score,
        COALESCE(prom, 0) AS promotores_pct,
        COALESCE(det,  0) AS detractores_pct
    FROM NPS_Base;
END;
$$;


CREATE OR REPLACE FUNCTION get_kpi_tasa_exito(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    tasa_exito_pct     NUMERIC,
    sesiones_resueltas BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(
            (COUNT(*) FILTER (WHERE h.resultado_sesion = 'RESUELTO') * 100.0)
            / NULLIF(COUNT(*), 0),
        1) AS tasa_exito_pct,

        COUNT(*) FILTER (WHERE h.resultado_sesion = 'RESUELTO') AS sesiones_resueltas

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
    JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
    JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

    WHERE
        (d.fecha_completa BETWEEN p_desde AND p_hasta)
        AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
        AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
        AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona);
END;
$$;


CREATE OR REPLACE FUNCTION get_kpi_deflection(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    deflection_pct   NUMERIC,
    resueltas_por_ia BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(
            (COUNT(*) FILTER (WHERE h.resuelto_por_ia = true) * 100.0)
            / NULLIF(COUNT(*), 0),
        1) AS deflection_pct,

        COUNT(*) FILTER (WHERE h.resuelto_por_ia = true) AS resueltas_por_ia

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
    JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
    JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

    WHERE
        (d.fecha_completa BETWEEN p_desde AND p_hasta)
        AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
        AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
        AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona);
END;
$$;


CREATE OR REPLACE FUNCTION get_score_global(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    score_total  NUMERIC,
    nivel        TEXT,
    cobertura    NUMERIC,
    efectividad  NUMERIC,
    eficiencia   NUMERIC,
    experiencia  NUMERIC,
    proactividad NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH metricas AS (
        SELECT
            -- Cobertura = FCR
            ROUND((COUNT(*) FILTER (WHERE h.resolucion_primer_contacto = true) * 100.0) / NULLIF(COUNT(*) FILTER (WHERE h.resolucion_primer_contacto IS NOT NULL), 0), 0) AS cov,
            -- Efectividad = Tasa de éxito
            ROUND((COUNT(*) FILTER (WHERE h.resultado_sesion = 'RESUELTO') * 100.0) / NULLIF(COUNT(*), 0), 0) AS efe,
            -- Eficiencia = % de sesiones en menos de 5 min (300 segundos)
            ROUND((COUNT(*) FILTER (WHERE h.duracion_segundos <= 300) * 100.0) / NULLIF(COUNT(*), 0), 0) AS efi,
            -- Experiencia = % de Promotores (calificación 9 o 10)
            ROUND((COUNT(*) FILTER (WHERE h.calificacion_satisfaccion >= 9) * 100.0) / NULLIF(COUNT(*), 0), 0) AS exp,
            -- Proactividad = % Resuelto por IA
            ROUND((COUNT(*) FILTER (WHERE h.resuelto_por_ia = true) * 100.0) / NULLIF(COUNT(*), 0), 0) AS pro

        FROM HECHO_SESION_OMNICANAL h
        JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
        JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
        JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

        WHERE
            (d.fecha_completa BETWEEN p_desde AND p_hasta)
            AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
            AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
            AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)
    )
    SELECT
        (COALESCE(cov, 0) + COALESCE(efe, 0) + COALESCE(efi, 0) + COALESCE(exp, 0) + COALESCE(pro, 0)) AS score_total,

        CASE
            WHEN (COALESCE(cov,0) + COALESCE(efe,0) + COALESCE(efi,0) + COALESCE(exp,0) + COALESCE(pro,0)) >= 425 THEN 'Excelente'
            WHEN (COALESCE(cov,0) + COALESCE(efe,0) + COALESCE(efi,0) + COALESCE(exp,0) + COALESCE(pro,0)) >= 350 THEN 'Avanzado'
            WHEN (COALESCE(cov,0) + COALESCE(efe,0) + COALESCE(efi,0) + COALESCE(exp,0) + COALESCE(pro,0)) >= 250 THEN 'Intermedio'
            ELSE 'Básico'
        END AS nivel,

        COALESCE(cov, 0) AS cobertura,
        COALESCE(efe, 0) AS efectividad,
        COALESCE(efi, 0) AS eficiencia,
        COALESCE(exp, 0) AS experiencia,
        COALESCE(pro, 0) AS proactividad
    FROM metricas;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. Gráficos del panel general
-- ══════════════════════════════════════════════════════════════════════════════

-- FCR y TMO en el tiempo. Si el período es corto (hasta 62 días) devuelve un punto
-- por DÍA; si es más largo, un punto por MES. Así un mes o un día seleccionado
-- no queda como una línea de un solo punto.
CREATE OR REPLACE FUNCTION get_chart_fcr_tmo_mensual(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
-- NOMBRES DE COLUMNAS DEBEN COINCIDIR EXACTAMENTE con GraficoLineal.jsx:
--   dataKey="mes"  → columna: mes   (etiqueta del eje X: día 'DD/MM' o nombre del mes)
--   dataKey="fcr"  → columna: fcr   (YAxis izquierdo, en %)
--   dataKey="tmo"  → columna: tmo   (YAxis derecho, en SEGUNDOS)
RETURNS TABLE (
    mes VARCHAR,
    fcr NUMERIC,
    tmo NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF (p_hasta - p_desde) <= 61 THEN
        -- Período corto: un punto por día
        RETURN QUERY
        SELECT
            to_char(d.fecha_completa, 'DD/MM')::VARCHAR AS mes,
            ROUND(
                (COUNT(*) FILTER (WHERE h.resolucion_primer_contacto = true) * 100.0)
                / NULLIF(COUNT(*) FILTER (WHERE h.resolucion_primer_contacto IS NOT NULL), 0),
            1) AS fcr,
            ROUND(AVG(h.duracion_segundos), 0) AS tmo

        FROM HECHO_SESION_OMNICANAL h
        JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
        JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
        JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

        WHERE
            (d.fecha_completa BETWEEN p_desde AND p_hasta)
            AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
            AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
            AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)

        GROUP BY d.fecha_completa
        ORDER BY d.fecha_completa ASC;
    ELSE
        -- Período largo: un punto por mes (con el año si el rango cruza varios años)
        RETURN QUERY
        SELECT
            (CASE
                WHEN EXTRACT(YEAR FROM p_desde) = EXTRACT(YEAR FROM p_hasta) THEN d.nombre_mes
                ELSE d.nombre_mes || ' ' || d.anio::TEXT
             END)::VARCHAR AS mes,
            ROUND(
                (COUNT(*) FILTER (WHERE h.resolucion_primer_contacto = true) * 100.0)
                / NULLIF(COUNT(*) FILTER (WHERE h.resolucion_primer_contacto IS NOT NULL), 0),
            1) AS fcr,
            ROUND(AVG(h.duracion_segundos), 0) AS tmo

        FROM HECHO_SESION_OMNICANAL h
        JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
        JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
        JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

        WHERE
            (d.fecha_completa BETWEEN p_desde AND p_hasta)
            AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
            AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
            AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)

        GROUP BY d.anio, d.mes, d.nombre_mes
        ORDER BY d.anio ASC, d.mes ASC;
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION get_chart_distribucion_canal(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    name           VARCHAR,
    value          NUMERIC,
    total_sesiones BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH conteo_por_canal AS (
        SELECT
            c.nombre_canal,
            COUNT(*) AS conteo
        FROM HECHO_SESION_OMNICANAL h
        JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
        JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
        JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

        WHERE
            (d.fecha_completa BETWEEN p_desde AND p_hasta)
            AND (p_canal   = 'Todos'  OR c.nombre_canal = p_canal)
            AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1) = p_region)
            AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)

        GROUP BY c.nombre_canal
    )
    SELECT
        cc.nombre_canal AS name,
        ROUND((cc.conteo * 100.0) / NULLIF(SUM(cc.conteo) OVER(), 0), 1) AS value,
        cc.conteo AS total_sesiones
    FROM conteo_por_canal cc
    ORDER BY value DESC;
END;
$$;


CREATE OR REPLACE FUNCTION get_chart_exito_zona(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
-- NOMBRES DE COLUMNAS DEBEN COINCIDIR EXACTAMENTE con GraficoBarras.jsx:
--   YAxis dataKey="zona"     → columna: zona
--   Bar   dataKey="exito"    → columna: exito  (en %)
--   Cell  fill={entry.color} → columna: color
--   total_sesiones           → columna extra para el tooltip
RETURNS TABLE (
    zona           VARCHAR,
    exito          NUMERIC,
    color          VARCHAR,
    total_sesiones BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH exito_por_zona AS (
        SELECT
            z.nombre_zona,
            ROUND(
                (COUNT(*) FILTER (WHERE h.resultado_sesion = 'RESUELTO') * 100.0)
                / NULLIF(COUNT(*), 0),
            1) AS tasa_exito,
            COUNT(*) AS total

        FROM HECHO_SESION_OMNICANAL h
        JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
        JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
        JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

        WHERE
            (d.fecha_completa BETWEEN p_desde AND p_hasta)
            AND (p_canal   = 'Todos'  OR c.nombre_canal                                   = p_canal)
            AND (p_region  = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1)                = p_region)
            AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)

        GROUP BY z.nombre_zona
    )
    SELECT
        ez.nombre_zona::VARCHAR AS zona,

        ez.tasa_exito AS exito,

        CASE
            WHEN ez.tasa_exito >= 90 THEN '#3B82F6'
            WHEN ez.tasa_exito >= 75 THEN '#0EA5E9'
            ELSE                          '#8B5CF6'
        END::VARCHAR AS color,

        ez.total::BIGINT AS total_sesiones

    FROM exito_por_zona ez
    ORDER BY ez.tasa_exito DESC;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. Página Sesiones (con búsqueda por ID, cliente o fecha)
-- ══════════════════════════════════════════════════════════════════════════════

-- Se borran las versiones anteriores (7, 8 y 9 parámetros). La nueva recibe p_orden con varias columnas
-- y p_offset para paginar en la base de datos.
DROP FUNCTION IF EXISTS get_sesiones_recientes(
    date, date, character varying, character varying, character varying, integer, character varying
);
DROP FUNCTION IF EXISTS get_sesiones_recientes(
    date, date, character varying, character varying, character varying, integer, character varying, character varying, character varying
);
DROP FUNCTION IF EXISTS get_sesiones_recientes(
    date, date, character varying, character varying, character varying, integer, character varying, character varying
);

CREATE OR REPLACE FUNCTION get_sesiones_recientes(
    p_desde    DATE,
    p_hasta    DATE,
    p_canal    VARCHAR,
    p_region   VARCHAR,
    p_subzona  VARCHAR,
    p_limit    INT DEFAULT 10,              -- filas por página (máximo 200)
    p_busqueda VARCHAR DEFAULT NULL,        -- texto a buscar en el ID, el nombre del cliente o la fecha
    p_orden    VARCHAR DEFAULT 'fecha:desc',-- criterios separados por coma, p. ej. 'cliente:asc,fecha:desc'
                                            -- columnas: id, cliente, fecha, canal, zona, duracion, primer, ia, nps, estado
    p_offset   INT DEFAULT 0                -- filas a saltar: (página - 1) * filas por página
)
RETURNS TABLE (
    id                  VARCHAR,
    cliente             VARCHAR,
    fecha               DATE,
    canal               VARCHAR,
    zona                VARCHAR,
    duracion            VARCHAR,
    "tercerContacto"    VARCHAR,
    "resueltaIA"        VARCHAR,
    nps                 NUMERIC,
    estado              VARCHAR,
    total_coincidencias BIGINT          -- cuántas sesiones coinciden en total (para calcular las páginas)
)
LANGUAGE plpgsql
AS $fn$
DECLARE
    v_q          TEXT;
    v_like       TEXT;
    v_criterio   TEXT;
    v_columna    TEXT;
    v_expresion  TEXT;
    v_direccion  TEXT;
    v_orden_sql  TEXT := '';
    v_cantidad   INT  := 0;
    v_limite     INT  := LEAST(GREATEST(COALESCE(p_limit, 10), 1), 200);
    v_desplazar  INT  := GREATEST(COALESCE(p_offset, 0), 0);
BEGIN
    -- Texto buscado en minúsculas y sin tildes; se escapan \ % _ para que se busquen literalmente
    v_q := translate(lower(btrim(COALESCE(p_busqueda, ''))),
                     'áàâäéèêëíìîïóòôöúùûüñç', 'aaaaeeeeiiiioooouuuunc');
    v_q := replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_');
    v_like := CASE WHEN v_q = '' THEN NULL ELSE '%' || v_q || '%' END;

    -- ORDER BY armado a partir de p_orden. Cada columna se traduce con una lista cerrada de
    -- expresiones (nada del texto recibido se pega en la consulta, así que no hay inyección de SQL).
    -- Se aceptan hasta 3 criterios; el resto se ignora.
    FOREACH v_criterio IN ARRAY string_to_array(COALESCE(p_orden, ''), ',')
    LOOP
        EXIT WHEN v_cantidad >= 3;
        v_columna   := lower(btrim(split_part(v_criterio, ':', 1)));
        v_direccion := CASE WHEN lower(btrim(split_part(v_criterio, ':', 2))) = 'asc' THEN 'ASC' ELSE 'DESC' END;
        v_expresion := CASE v_columna
            WHEN 'id'       THEN 's.sesion_sk'
            WHEN 'cliente'  THEN 'lower(s.nombre_cliente)'
            WHEN 'fecha'    THEN 's.fecha_ses'
            WHEN 'canal'    THEN 'lower(s.nombre_canal)'
            WHEN 'zona'     THEN 'lower(s.nombre_zona)'
            WHEN 'duracion' THEN 's.seg'
            WHEN 'primer'   THEN 's.fcr'
            WHEN 'ia'       THEN 'COALESCE(s.ia, false)'
            WHEN 'nps'      THEN 's.nota'
            WHEN 'estado'   THEN $$lower(CASE WHEN s.resultado = 'RESUELTO' THEN 'Exitosa' ELSE s.resultado END)$$
            ELSE NULL
        END;
        IF v_expresion IS NOT NULL THEN
            v_orden_sql := v_orden_sql || v_expresion || ' ' || v_direccion || ' NULLS LAST, ';
            v_cantidad  := v_cantidad + 1;
        END IF;
    END LOOP;

    -- Desempate (y orden por defecto si no se pidió ninguno): fecha e ID, de más reciente a más antiguo
    v_orden_sql := v_orden_sql || 's.fecha_ses DESC, s.sesion_sk DESC';

    RETURN QUERY EXECUTE format($q$
        WITH sesiones AS (
            SELECT
                h.id_sesion_sk                 AS sesion_sk,
                d.fecha_completa               AS fecha_ses,
                ('SES-' || LPAD(h.id_sesion_sk::TEXT, GREATEST(4, LENGTH(h.id_sesion_sk::TEXT)), '0')) AS codigo,
                cli.nombre_completo            AS nombre_cliente,
                c.nombre_canal                 AS nombre_canal,
                z.nombre_zona                  AS nombre_zona,
                h.duracion_segundos            AS seg,
                h.resolucion_primer_contacto   AS fcr,
                h.resuelto_por_ia              AS ia,
                h.calificacion_satisfaccion    AS nota,
                h.resultado_sesion             AS resultado

            FROM HECHO_SESION_OMNICANAL h
            JOIN DIM_FECHA    d   ON h.id_fecha_sk   = d.id_fecha_sk
            JOIN DIM_CANAL    c   ON h.id_canal_sk   = c.id_canal_sk
            JOIN DIM_ZONA_GEO z   ON h.id_zona_sk    = z.id_zona_sk
            JOIN DIM_CLIENTE  cli ON h.id_cliente_sk = cli.id_cliente_sk

            WHERE (d.fecha_completa BETWEEN $1 AND $2)
              AND ($3 = 'Todos'  OR c.nombre_canal = $3)
              AND ($4 = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1) = $4)
              AND ($5 = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = $5)
        )
        SELECT
            s.codigo::VARCHAR,
            s.nombre_cliente::VARCHAR,
            s.fecha_ses::DATE,
            s.nombre_canal::VARCHAR,
            s.nombre_zona::VARCHAR,
            (s.seg::TEXT || 's')::VARCHAR,
            (CASE
                WHEN s.fcr = true  THEN 'Sí'
                WHEN s.fcr = false THEN 'No'
                ELSE 'Sin dato'
             END)::VARCHAR,
            (CASE WHEN s.ia = true THEN 'Sí' ELSE 'No' END)::VARCHAR,
            s.nota,
            (CASE WHEN s.resultado = 'RESUELTO' THEN 'Exitosa' ELSE s.resultado END)::VARCHAR,
            COUNT(*) OVER ()::BIGINT
        FROM sesiones s
        WHERE $6 IS NULL
           OR translate(lower(s.nombre_cliente), 'áàâäéèêëíìîïóòôöúùûüñç', 'aaaaeeeeiiiioooouuuunc') LIKE $6
           OR lower(s.codigo) LIKE $6
           OR to_char(s.fecha_ses, 'DD/MM/YYYY')     LIKE $6   -- 23/12/2025
           OR to_char(s.fecha_ses, 'YYYY-MM-DD')     LIKE $6   -- 2025-12-23
           OR to_char(s.fecha_ses, 'FMDD/FMMM/YYYY') LIKE $6   -- 3/1/2025 (sin ceros)
        ORDER BY %s
        LIMIT $7 OFFSET $8
    $q$, v_orden_sql)
    USING p_desde, p_hasta, p_canal, p_region, p_subzona, v_like, v_limite, v_desplazar;
END;
$fn$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. Página Análisis de fallos
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_fallos_top_problemas(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR,
    p_limit   INT DEFAULT 10
)
RETURNS TABLE (
    problema        VARCHAR,
    total_sesiones  BIGINT,
    tasa_resolucion NUMERIC,
    prioridad       VARCHAR,
    color           VARCHAR
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
        END::VARCHAR AS color

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


CREATE OR REPLACE FUNCTION get_fallos_por_categoria(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    name            VARCHAR,
    value           NUMERIC,
    total_sesiones  BIGINT,
    tasa_resolucion NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH conteo_categoria AS (
        SELECT
            COALESCE(p.nombre_categoria_padre, 'Sin categoría') AS categoria,
            COUNT(*) AS conteo,
            ROUND(
                (COUNT(*) FILTER (WHERE h.resultado_sesion = 'RESUELTO') * 100.0)
                / NULLIF(COUNT(*), 0),
            1) AS tasa_res

        FROM HECHO_SESION_OMNICANAL h
        JOIN DIM_FECHA    d ON h.id_fecha_sk    = d.id_fecha_sk
        JOIN DIM_PROBLEMA p ON h.id_problema_sk = p.id_problema_sk
        JOIN DIM_CANAL    c ON h.id_canal_sk    = c.id_canal_sk
        JOIN DIM_ZONA_GEO z ON h.id_zona_sk     = z.id_zona_sk

        WHERE (d.fecha_completa BETWEEN p_desde AND p_hasta)
          AND (p_canal = 'Todos' OR c.nombre_canal = p_canal)
          AND (p_region = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1) = p_region)
          AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)
        GROUP BY COALESCE(p.nombre_categoria_padre, 'Sin categoría')
    )
    SELECT
        cc.categoria::VARCHAR AS name,
        ROUND(
            (cc.conteo * 100.0) / NULLIF(SUM(cc.conteo) OVER(), 0),
        1)::NUMERIC AS value,
        cc.conteo AS total_sesiones,
        cc.tasa_res AS tasa_resolucion

    FROM conteo_categoria cc
    ORDER BY cc.conteo DESC;
END;
$$;


CREATE OR REPLACE FUNCTION get_fallos_resolucion_por_prioridad(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    prioridad       VARCHAR,
    total_sesiones  BIGINT,
    resueltas       BIGINT,
    tasa_resolucion NUMERIC,
    orden           INT    -- para que el frontend pueda ordenar Crítica→Alta→Media→Baja
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.prioridad::VARCHAR AS prioridad,
        COUNT(*)::BIGINT AS total_sesiones,
        COUNT(*) FILTER (WHERE h.resultado_sesion = 'RESUELTO')::BIGINT AS resueltas,
        ROUND(
            (COUNT(*) FILTER (WHERE h.resultado_sesion = 'RESUELTO') * 100.0)
            / NULLIF(COUNT(*), 0),
        1)::NUMERIC AS tasa_resolucion,
        CASE p.prioridad
            WHEN 'Crítica' THEN 1
            WHEN 'Alta'    THEN 2
            WHEN 'Media'   THEN 3
            WHEN 'Baja'    THEN 4
            ELSE                5
        END::INT AS orden

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA    d ON h.id_fecha_sk    = d.id_fecha_sk
    JOIN DIM_PROBLEMA p ON h.id_problema_sk = p.id_problema_sk
    JOIN DIM_CANAL    c ON h.id_canal_sk    = c.id_canal_sk
    JOIN DIM_ZONA_GEO z ON h.id_zona_sk     = z.id_zona_sk

    WHERE (d.fecha_completa BETWEEN p_desde AND p_hasta)
      AND (p_canal = 'Todos' OR c.nombre_canal = p_canal)
      AND (p_region = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1) = p_region)
      AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)
    GROUP BY p.prioridad
    ORDER BY orden ASC;
END;
$$;


CREATE OR REPLACE FUNCTION get_fallos_dispositivos(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR,
    p_limit   INT DEFAULT 10
)
RETURNS TABLE (
    modelo             VARCHAR,
    sesiones_con_fallo BIGINT,
    total_sesiones     BIGINT,
    pct_fallos         NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dv.modelo::VARCHAR AS modelo,
        COUNT(*) FILTER (
            WHERE h.resultado_sesion IN ('ESCALADO', 'ABANDONADO', 'PENDIENTE')
        )::BIGINT AS sesiones_con_fallo,
        COUNT(*)::BIGINT AS total_sesiones,
        ROUND(
            (COUNT(*) FILTER (
                WHERE h.resultado_sesion IN ('ESCALADO', 'ABANDONADO', 'PENDIENTE')
            ) * 100.0) / NULLIF(COUNT(*), 0),
        1)::NUMERIC AS pct_fallos

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA       d  ON h.id_fecha_sk       = d.id_fecha_sk
    JOIN DIM_CANAL       c  ON h.id_canal_sk       = c.id_canal_sk
    JOIN DIM_ZONA_GEO    z  ON h.id_zona_sk        = z.id_zona_sk
    JOIN DIM_DISPOSITIVO dv ON h.id_dispositivo_sk = dv.id_dispositivo_sk

    WHERE (d.fecha_completa BETWEEN p_desde AND p_hasta)
      AND (p_canal = 'Todos' OR c.nombre_canal = p_canal)
      AND (p_region = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1) = p_region)
      AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)
    GROUP BY dv.modelo
    ORDER BY sesiones_con_fallo DESC
    LIMIT p_limit;
END;
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. Página Mapa
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_mapa_sesiones(
    p_desde   DATE,
    p_hasta   DATE,
    p_canal   VARCHAR,
    p_region  VARCHAR,
    p_subzona VARCHAR
)
RETURNS TABLE (
    zona                      VARCHAR,
    total_sesiones            BIGINT,
    resueltas_ia              BIGINT,
    resueltas_primer_contacto BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        z.nombre_zona::VARCHAR AS zona,
        COUNT(*)::BIGINT AS total_sesiones,
        COUNT(*) FILTER (WHERE h.resuelto_por_ia = true)::BIGINT AS resueltas_ia,
        COUNT(*) FILTER (WHERE h.resolucion_primer_contacto = true)::BIGINT AS resueltas_primer_contacto

    FROM HECHO_SESION_OMNICANAL h
    JOIN DIM_FECHA    d ON h.id_fecha_sk = d.id_fecha_sk
    JOIN DIM_CANAL    c ON h.id_canal_sk = c.id_canal_sk
    JOIN DIM_ZONA_GEO z ON h.id_zona_sk  = z.id_zona_sk

    WHERE (d.fecha_completa BETWEEN p_desde AND p_hasta)
      AND (p_canal = 'Todos' OR c.nombre_canal = p_canal)
      AND (p_region = 'Global' OR SPLIT_PART(z.nombre_zona, ' ', 1) = p_region)
      AND (p_subzona = 'Global' OR SUBSTRING(z.nombre_zona FROM POSITION(' ' IN z.nombre_zona) + 1) = p_subzona)
    GROUP BY z.nombre_zona
    ORDER BY total_sesiones DESC;
END;
$$;


-- Actualiza la caché de funciones RPC de Supabase/PostgREST.
NOTIFY pgrst, 'reload schema';


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. LIMPIEZA (opcional, ejecutar DESPUÉS de comprobar que el dashboard funciona)
--    Borra las versiones viejas que recibían (p_anio, p_mes). Descomenta y ejecuta.
-- ══════════════════════════════════════════════════════════════════════════════
-- DROP FUNCTION IF EXISTS get_kpi_fcr(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_kpi_tmo(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_kpi_tnps(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_kpi_tasa_exito(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_kpi_deflection(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_score_global(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_chart_fcr_tmo_mensual(integer, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_chart_distribucion_canal(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_chart_exito_zona(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_sesiones_recientes(integer, character varying, character varying, character varying, character varying, integer);
-- DROP FUNCTION IF EXISTS get_sesiones_recientes(integer, character varying, character varying, character varying, character varying, integer, character varying);
-- DROP FUNCTION IF EXISTS get_fallos_top_problemas(integer, character varying, character varying, character varying, character varying, integer);
-- DROP FUNCTION IF EXISTS get_fallos_por_categoria(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_fallos_resolucion_por_prioridad(integer, character varying, character varying, character varying, character varying);
-- DROP FUNCTION IF EXISTS get_fallos_dispositivos(integer, character varying, character varying, character varying, character varying, integer);
-- DROP FUNCTION IF EXISTS get_mapa_sesiones(integer, character varying, character varying, character varying, character varying);
