-- ══════════════════════════════════════════════════════════════════════════════
-- ordenar_sesiones.sql
-- Solo la función get_sesiones_recientes, con orden por una o varias columnas.
-- Es la misma que está en filtro_periodo.sql (sección 3): úsalo si ya ejecutaste
-- ese archivo y solo necesitas actualizar esta función.
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

-- Actualiza la caché de funciones RPC de Supabase/PostgREST.
NOTIFY pgrst, 'reload schema';
