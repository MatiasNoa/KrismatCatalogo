// ============================================================
// movimientoController.js — Lógica del módulo MOVIMIENTOS
// ============================================================
// Controla las entradas, salidas y ajustes de stock.
// Cada movimiento se registra en la tabla `movimiento` y sus
// detalles en `detalle_movimiento`. El stock del producto se
// actualiza automáticamente dentro de una transacción.
// ============================================================

const pool = require('../db');

// ============================================================
// listar
// GET /api/movimientos
// Query params: ?tipo=&fechaDesde=&fechaHasta=&limit=&offset=
// ============================================================
async function listar(req, res) {
  const { tipo, fechaDesde, fechaHasta, limit, offset } = req.query;
  let sql = `
    SELECT m.*,
      COUNT(dm.id_detalle_movimiento)::int AS total_productos,
      COALESCE(SUM(dm.cantidad), 0)::int AS total_cantidad
    FROM movimiento m
    LEFT JOIN detalle_movimiento dm ON dm.movimiento_id = m.id_movimiento
    WHERE 1=1
  `;
  const params = [];
  const conditions = [];

  if (tipo) {
    conditions.push(`m.tipo = $${params.length + 1}`);
    params.push(tipo);
  }
  if (fechaDesde) {
    conditions.push(`m.fecha >= $${params.length + 1}`);
    params.push(fechaDesde);
  }
  if (fechaHasta) {
    conditions.push(`m.fecha <= $${params.length + 1}`);
    params.push(fechaHasta);
  }

  if (conditions.length > 0) {
    sql += ' AND ' + conditions.join(' AND ');
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
    console.error('[Movimientos] Error al listar:', err.message);
    res.status(500).json({ error: 'Error al listar movimientos' });
  }
}

// ============================================================
// obtener
// GET /api/movimientos/:id
// Devuelve el movimiento con su array de detalles (cada uno
// incluye marca, modelo, tipo del producto)
// ============================================================
async function obtener(req, res) {
  const { id } = req.params;

  try {
    const mov = await pool.query(
      'SELECT * FROM movimiento WHERE id_movimiento = $1',
      [id]
    );

    if (mov.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    const detalles = await pool.query(
      `SELECT dm.*, p.marca, p.modelo, p.tipo
       FROM detalle_movimiento dm
       JOIN producto p ON p.id_producto = dm.producto_id
       WHERE dm.movimiento_id = $1
       ORDER BY p.marca, p.modelo`,
      [id]
    );

    res.json({
      ...mov.rows[0],
      detalles: detalles.rows,
    });
  } catch (err) {
    console.error('[Movimientos] Error al obtener:', err.message);
    res.status(500).json({ error: 'Error al obtener movimiento' });
  }
}

// ============================================================
// crear
// POST /api/movimientos
// Body: { tipo, motivo, detalles: [{ producto_id, cantidad }] }
//
// Ejecuta una transacción que:
//   1. Inserta el movimiento (cabecera)
//   2. Para cada detalle: inserta detalle y actualiza stock
//      (ENTRADA/AJUSTE_POSITIVO → suma, SALIDA/AJUSTE_NEGATIVO → resta)
// ============================================================
async function crear(req, res) {
  const { tipo, motivo, detalles } = req.body;

  if (!tipo) {
    return res.status(400).json({ error: 'El campo "tipo" es obligatorio' });
  }
  if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: 'Debe incluir al menos un detalle' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insertar cabecera del movimiento
    const movResult = await client.query(
      `INSERT INTO movimiento (tipo, motivo)
       VALUES ($1, $2)
       RETURNING *`,
      [tipo, motivo || null]
    );
    const movimiento = movResult.rows[0];
    const movId = movimiento.id_movimiento;

    // 2. Procesar cada detalle
    const signo = ['ENTRADA', 'AJUSTE_POSITIVO'].includes(tipo) ? '+' : '-';
    const esSalida = ['SALIDA', 'AJUSTE_NEGATIVO'].includes(tipo);
    const detallesInsertados = [];

    for (const d of detalles) {
      if (!d.producto_id || !d.cantidad || d.cantidad <= 0) {
        throw new Error(
          'Detalle inválido: producto_id y cantidad > 0 son requeridos'
        );
      }

      const prod = await client.query(
        'SELECT marca, modelo, stock FROM producto WHERE id_producto = $1',
        [d.producto_id]
      );

      if (prod.rows.length === 0) {
        throw new Error(`Producto ID ${d.producto_id} no encontrado`);
      }

      const { marca, modelo, stock: stockActual } = prod.rows[0];

      if (esSalida && d.cantidad > stockActual) {
        throw new Error(
          `Stock insuficiente: ${marca} ${modelo} tiene ${stockActual} unidad${stockActual !== 1 ? 'es' : ''}, se requieren ${d.cantidad}`
        );
      }

      // Insertar detalle
      const detResult = await client.query(
        `INSERT INTO detalle_movimiento (movimiento_id, producto_id, cantidad)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [movId, d.producto_id, d.cantidad]
      );

      // Actualizar stock
      await client.query(
        `UPDATE producto
         SET stock = stock ${signo} $1
         WHERE id_producto = $2`,
        [d.cantidad, d.producto_id]
      );

      detallesInsertados.push(detResult.rows[0]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...movimiento,
      detalles: detallesInsertados,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Movimientos] Error al crear:', err.message);
    res.status(400).json({ error: err.message || 'Error al crear movimiento' });
  } finally {
    client.release();
  }
}

// ============================================================
// eliminar
// DELETE /api/movimientos/:id
// Revierte el movimiento: descuenta lo que había sumado y
// viceversa. Solo permite eliminar si el stock resultante
// no queda negativo.
// ============================================================
async function eliminar(req, res) {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    // Obtener movimiento
    const movResult = await client.query(
      'SELECT * FROM movimiento WHERE id_movimiento = $1',
      [id]
    );

    if (movResult.rows.length === 0) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    const movimiento = movResult.rows[0];
    const signo = ['ENTRADA', 'AJUSTE_POSITIVO'].includes(movimiento.tipo) ? '-' : '+';

    await client.query('BEGIN');

    // Obtener detalles
    const detalles = await client.query(
      'SELECT * FROM detalle_movimiento WHERE movimiento_id = $1',
      [id]
    );

    // Revertir stock
    for (const d of detalles.rows) {
      const result = await client.query(
        `UPDATE producto
         SET stock = stock ${signo} $1
         WHERE id_producto = $2
         RETURNING stock`,
        [d.cantidad, d.producto_id]
      );

      if (result.rows[0].stock < 0) {
        throw new Error(
          `Stock negativo al revertir. Producto ID ${d.producto_id}`
        );
      }
    }

    // Eliminar detalles (CASCADE lo hace automáticamente, pero igual)
    await client.query(
      'DELETE FROM detalle_movimiento WHERE movimiento_id = $1',
      [id]
    );

    // Eliminar movimiento
    await client.query(
      'DELETE FROM movimiento WHERE id_movimiento = $1',
      [id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Movimiento eliminado y stock revertido' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Movimientos] Error al eliminar:', err.message);
    res.status(400).json({ error: err.message || 'Error al eliminar movimiento' });
  } finally {
    client.release();
  }
}

// ============================================================
// Exportar controladores
// ============================================================
module.exports = { listar, obtener, crear, eliminar };
