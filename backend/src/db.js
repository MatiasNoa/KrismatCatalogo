// ============================================================
// Conexión a PostgreSQL
// ============================================================
// Este módulo crea y exporta un pool de conexiones a la base
// de datos PostgreSQL. Todas las consultas SQL del sistema
// usan este pool.
//
// La configuración (host, puerto, usuario, contraseña) se
// carga desde el archivo .env usando dotenv.
// ============================================================

const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexiones
// ---------------------------------------------------------------------------
// pg internamente maneja un conjunto de conexiones reutilizables. No es
// necesario abrir/cerrar conexiones manualmente; llamamos a pool.query()
// y pg decide qué conexión del pool usar.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Manejador global de errores del pool
// ---------------------------------------------------------------------------
// Si la base de datos se cae o la conexión se pierde, este evento se
// dispara. Terminamos el proceso para que el administrador (PM2, Docker,
// etc.) lo reinicie automáticamente.
pool.on('error', (err) => {
  console.error('[DB] Error inesperado en el pool de PostgreSQL:', err.message);
  process.exit(-1);
});

module.exports = pool;
