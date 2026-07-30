const pool = require('../db');

async function resumen(req, res) {
  try {
    const [
      totalProductos,
      totalStock,
      sinStock,
      stockBajo,
      movimientosMes,
      totalMovimientos,
    ] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM producto WHERE estado = 'ACTIVO'"),
      pool.query('SELECT COALESCE(SUM(stock), 0)::int AS count FROM producto'),
      pool.query("SELECT COUNT(*)::int AS count FROM producto WHERE stock = 0 AND estado = 'ACTIVO'"),
      pool.query("SELECT COUNT(*)::int AS count FROM producto WHERE stock > 0 AND stock <= 5 AND estado = 'ACTIVO'"),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM movimiento
         WHERE fecha >= date_trunc('month', NOW())`
      ),
      pool.query('SELECT COUNT(*)::int AS count FROM movimiento'),
    ]);

    res.json({
      totalProductos: totalProductos.rows[0].count,
      totalStock: totalStock.rows[0].count,
      sinStock: sinStock.rows[0].count,
      stockBajo: stockBajo.rows[0].count,
      movimientosMes: movimientosMes.rows[0].count,
      totalMovimientos: totalMovimientos.rows[0].count,
    });
  } catch (err) {
    console.error('[Reportes] Error al obtener resumen:', err.message);
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
}

async function stock(req, res) {
  const { minStock } = req.query;
  let sql = `
    SELECT id_producto, marca, modelo, anio, tipo, stock, ubicacion,
      (SELECT COUNT(*) FROM compatibilidad WHERE producto_id = producto.id_producto)::int AS compat_count
    FROM producto
    WHERE estado = 'ACTIVO'
  `;
  const params = [];

  if (minStock !== undefined && minStock !== '') {
    sql += ` AND stock <= $${params.length + 1}`;
    params.push(parseInt(minStock));
  }

  sql += ' ORDER BY stock ASC, marca, modelo';

  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[Reportes] Error al listar stock:', err.message);
    res.status(500).json({ error: 'Error al obtener reporte de stock' });
  }
}

async function movimientos(req, res) {
  const { fechaDesde, fechaHasta, tipo, limit, offset } = req.query;
  let sql = `
    SELECT m.*,
      COUNT(dm.id_detalle_movimiento)::int AS total_productos,
      COALESCE(SUM(dm.cantidad), 0)::int AS total_cantidad
    FROM movimiento m
    LEFT JOIN detalle_movimiento dm ON dm.movimiento_id = m.id_movimiento
    WHERE 1=1
  `;
  const params = [];

  if (tipo) {
    sql += ` AND m.tipo = $${params.length + 1}`;
    params.push(tipo);
  }
  if (fechaDesde) {
    sql += ` AND m.fecha >= $${params.length + 1}`;
    params.push(fechaDesde);
  }
  if (fechaHasta) {
    sql += ` AND m.fecha <= $${params.length + 1}`;
    params.push(fechaHasta);
  }

  sql += `
    GROUP BY m.id_movimiento
    ORDER BY m.fecha DESC
  `;

  if (limit) {
    sql += ` LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
  }
  if (offset) {
    sql += ` OFFSET $${params.length + 1}`;
    params.push(parseInt(offset));
  }

  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[Reportes] Error al listar movimientos:', err.message);
    res.status(500).json({ error: 'Error al obtener reporte de movimientos' });
  }
}

module.exports = { resumen, stock, movimientos };
