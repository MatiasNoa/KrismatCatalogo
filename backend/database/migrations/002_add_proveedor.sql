-- ==========================================================
-- Migración 002: Agregar columna proveedor a producto
-- ==========================================================
-- Campo opcional. Si es NULL, significa que no se ha
-- registrado el proveedor.
-- ==========================================================

ALTER TABLE producto
ADD COLUMN proveedor VARCHAR(100);
