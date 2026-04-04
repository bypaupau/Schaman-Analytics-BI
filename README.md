# Schaman Analytics - Data Warehouse & Dashboard Omnicanal
**Integrantes:** Paula Martillo, Leonor Molina, Raúl Molina, Daniel Vaca

Este proyecto implementa una solución completa de Business Intelligence para **Schaman S.A.**, abarcando desde el diseño e implementación de un Data Warehouse (modelo dimensional) hasta la construcción de un dashboard analítico consumido en tiempo real.

## Objetivo del Proyecto
Diseñar, implementar y consumir un Data Warehouse para integrar, consolidad y organizar la información del centro de resolución omnicanal, facilitando el análisis histórico y la toma de decisiones estratégicas de Schaman.

## Arquitectura y Tecnologías
* **Frontend / Aplicación Consumidora:** React.js (Vite) + Tailwind CSS + Recharts (para visualización de datos).
* **Base de Datos / Data Warehouse:** PostgreSQL alojado en Supabase.
* **Proceso ETL:** Pentaho Data Integration (PDI) para la extracción, limpieza, transformación y carga de datos desde la base OLTP al Data Warehouse.
* **Capa Lógica:** Funciones RPC (Remote Procedure Calls) nativas en SQL optimizadas.

## Modelo Dimensional (Data Warehouse)
El proyecto utiliza un **Modelo Estrella** para optimizar las consultas analíticas.
* **Tabla de Hechos:** `HECHO_SESION_OMNICANAL` (Granularidad: 1 fila = 1 sesión de atención).
* **Dimensiones:**
  * `DIM_FECHA`: Jerarquía temporal para análisis evolutivo.
  * `DIM_CANAL`: WhatsApp, Llamadas, App, Email.
  * `DIM_ZONA_GEO`: Norte, Centro, Sur.
  * `DIM_CLIENTE`: Datos de contacto y perfil.

## 📈 KPIs Implementados
El dashboard consume el Data Warehouse mediante consultas SQL dinámicas (filtrando por Año, Mes, Canal, Zona) para calcular:
1. **FCR (Resolución al Primer Contacto):** Porcentaje de problemas resueltos en la primera interacción.
2. **TMO (Tiempo Medio de Operación):** Duración promedio de las sesiones.
3. **T-NPS (Satisfacción del Cliente):** Net Promoter Score calculado al vuelo.
4. **Tasa de Éxito:** Porcentaje de sesiones con estado final "Resuelto".
5. **Deflection Rate:** Sesiones resueltas proactivamente por la Inteligencia Artificial.
6. **Score Global:** Métrica compuesta de calidad sobre 500 puntos.
