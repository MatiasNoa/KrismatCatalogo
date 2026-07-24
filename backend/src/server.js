const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/test', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    res.json({
      status: 'ok',
      message: 'Conexión a PostgreSQL exitosa',
      dbTime: result.rows[0].current_time,
    });
  } catch (err) {
    console.error('Error al conectar con PostgreSQL:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error de conexión a la base de datos',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
