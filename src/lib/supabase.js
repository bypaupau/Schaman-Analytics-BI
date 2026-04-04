import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Función asíncrona para probar la conexión
async function probarConexion() {
    try {
        // Intenta hacer una consulta a una tabla que exista en tu base de datos
        // Cambia 'tu_tabla' por el nombre real de alguna tabla tuya
        const { data, error } = await supabase.from('dim_canal').select('*').limit(1);

        if (error) {
            console.error("❌ Error al conectar o consultar:", error.message);
            return;
        }

        console.log("✅ Conexión exitosa. Datos obtenidos:", data);
    } catch (err) {
        console.error("❌ Error inesperado:", err);
    }
}

probarConexion();