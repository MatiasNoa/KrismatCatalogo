-- ==========================================================
-- Inicialización Base de Datos
-- Sistema de Inventario de Pisos para Autos
-- PostgreSQL
-- ==========================================================

BEGIN;

-- ==========================================================
-- ENUMS
-- ==========================================================

CREATE TYPE estado_producto AS ENUM (
    'ACTIVO',
    'INACTIVO'
);

CREATE TYPE tipo_producto AS ENUM (
    '5D',
    '8D'
);

CREATE TYPE tipo_movimiento AS ENUM (
    'ENTRADA',
    'SALIDA',
    'AJUSTE_POSITIVO',
    'AJUSTE_NEGATIVO'
);

-- ==========================================================
-- PRODUCTOS
-- ==========================================================

CREATE TABLE producto (

    id_producto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    marca VARCHAR(100) NOT NULL,

    modelo VARCHAR(100) NOT NULL,

    anio VARCHAR(30) NOT NULL,

    tipo tipo_producto NOT NULL,

    stock INTEGER NOT NULL DEFAULT 0
        CHECK (stock >= 0),

    ubicacion VARCHAR(100),

    observaciones TEXT,

    estado estado_producto NOT NULL DEFAULT 'ACTIVO',

    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),

    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE INDEX idx_producto_marca
ON producto(marca);

CREATE INDEX idx_producto_modelo
ON producto(modelo);

CREATE INDEX idx_producto_estado
ON producto(estado);


-- ==========================================================
-- COMPATIBILIDADES
-- ==========================================================

CREATE TABLE compatibilidad (

    id_compatibilidad INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    producto_id INTEGER NOT NULL,

    producto_compatible_id INTEGER NOT NULL,


    CONSTRAINT fk_comp_producto
        FOREIGN KEY (producto_id)
        REFERENCES producto(id_producto)
        ON DELETE RESTRICT,


    CONSTRAINT fk_comp_producto_compatible
        FOREIGN KEY (producto_compatible_id)
        REFERENCES producto(id_producto)
        ON DELETE RESTRICT,


    CONSTRAINT chk_no_auto_compatibilidad
        CHECK (producto_id <> producto_compatible_id)
);


-- Evita duplicados A-B y B-A
CREATE UNIQUE INDEX uq_compatibilidad
ON compatibilidad (
    LEAST(producto_id, producto_compatible_id),
    GREATEST(producto_id, producto_compatible_id)
);


CREATE INDEX idx_compatibilidad_producto
ON compatibilidad(producto_id);


CREATE INDEX idx_compatibilidad_producto_compatible
ON compatibilidad(producto_compatible_id);


-- ==========================================================
-- MOVIMIENTOS
-- ==========================================================

CREATE TABLE movimiento (

    id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    tipo tipo_movimiento NOT NULL,

    fecha TIMESTAMP NOT NULL DEFAULT NOW(),

    motivo TEXT
);


CREATE INDEX idx_movimiento_fecha
ON movimiento(fecha);


CREATE INDEX idx_movimiento_tipo
ON movimiento(tipo);


-- ==========================================================
-- DETALLE MOVIMIENTO
-- ==========================================================

CREATE TABLE detalle_movimiento (

    id_detalle_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    movimiento_id INTEGER NOT NULL,

    producto_id INTEGER NOT NULL,

    cantidad INTEGER NOT NULL
        CHECK (cantidad > 0),


    CONSTRAINT fk_detalle_movimiento
        FOREIGN KEY (movimiento_id)
        REFERENCES movimiento(id_movimiento)
        ON DELETE CASCADE,


    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id)
        REFERENCES producto(id_producto)
        ON DELETE RESTRICT
);


CREATE INDEX idx_detalle_movimiento
ON detalle_movimiento(movimiento_id);


CREATE INDEX idx_detalle_producto
ON detalle_movimiento(producto_id);


-- ==========================================================
-- TRIGGER
-- Actualizar fecha_actualizacion
-- ==========================================================

CREATE OR REPLACE FUNCTION actualizar_fecha_producto()
RETURNS TRIGGER AS
$$
BEGIN

    NEW.fecha_actualizacion := NOW();

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_producto_fecha
BEFORE UPDATE ON producto
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_producto();


-- ==========================================================
-- COMENTARIOS
-- ==========================================================

COMMENT ON TABLE producto IS
'Productos del inventario';


COMMENT ON TABLE compatibilidad IS
'Compatibilidades comprobadas físicamente';


COMMENT ON TABLE movimiento IS
'Cabecera de movimientos de inventario';


COMMENT ON TABLE detalle_movimiento IS
'Detalle de productos afectados por cada movimiento';


COMMIT;
