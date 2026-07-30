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
const movimientosRouter = require('./routes/movimientos');
const reportesRouter = require('./routes/reportes');
const importacionRouter = require('./routes/importacion');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// Middlewares globales
// ------------------------------------------------------------

// cors: permite que el frontend (React en otro puerto) consuma la API
app.use(cors());

// express.json: convierte el body de las peticiones POST/PUT/PATCH
// de JSON a objeto JavaScript automáticamente
// Aumentamos el límite a 10MB para soportar CSVs grandes
app.use(express.json({ limit: '10mb' }));

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

// Módulo 3 — MOVIMIENTOS
// Registro de entradas, salidas y ajustes de stock
app.use('/api/movimientos', movimientosRouter);

// Módulo 4 — REPORTES
// Consultas de stock, movimientos y resumen
app.use('/api/reportes', reportesRouter);

// Módulo 5 — IMPORTACIÓN
// Preview y confirmación de importación CSV
app.use('/api/importacion', importacionRouter);

// ------------------------------------------------------------
// Inicio del servidor
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[Server] Krismat corriendo en http://localhost:${PORT}`);
});
