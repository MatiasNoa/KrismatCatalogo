// ============================================================
// Servidor Express — Krismat
// ============================================================
// Punto de entrada del backend. Configura Express, monta los
// routers de cada módulo y se pone a la escucha.
//
// Para iniciar:
//   npm run dev    (nodemon, recarga automática)
//   npm start      (node, producción)
// ============================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const productosRouter = require('./routes/productos');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// Middlewares globales
// ------------------------------------------------------------

// cors: permite que el frontend (React en otro puerto) consuma la API
app.use(cors());

// express.json: convierte el body de las peticiones POST/PUT/PATCH
// de JSON a objeto JavaScript automáticamente
app.use(express.json());

// ------------------------------------------------------------
// Rutas
// ------------------------------------------------------------

// GET /api/test — verificar que el servidor y la BD responden
app.get('/api/test', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    res.json({
      status: 'ok',
      message: 'Conexión a PostgreSQL exitosa',
      dbTime: result.rows[0].current_time,
    });
  } catch (err) {
    console.error('[Server] Error al conectar con PostgreSQL:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Error de conexión a la base de datos',
    });
  }
});

// Módulo 1 — INVENTARIO
// CRUD de productos + compatibilidades
// Documentación: ver routes/productos.js
app.use('/api/productos', productosRouter);

// Módulo 2 — BÚSQUEDA   (próximamente)
// Módulo 3 — MOVIMIENTOS (próximamente)
// Módulo 4 — REPORTES   (próximamente)
// Módulo 5 — IMPORTACIÓN (próximamente)

// ------------------------------------------------------------
// Inicio del servidor
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[Server] Krismat corriendo en http://localhost:${PORT}`);
});
