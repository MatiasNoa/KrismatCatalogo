// ============================================================
// productoController.js — Lógica de negocio del módulo INVENTARIO
// ============================================================
// Cada función recibe (req, res) y se encarga de:
//   1. Extraer parámetros (query, params, body)
//   2. Validar datos de entrada
//   3. Ejecutar consultas SQL contra la BD
//   4. Enviar la respuesta HTTP al cliente
//
// Separado de routes/productos.js para que las rutas solo
// definan el mapeo URL → controlador.
// ============================================================

const pool = require('../db');

// ============================================================
// listar
// GET /api/productos
// Query params: ?marca=&modelo=&tipo=&estado=
// ============================================================
async function listar(req, res) {
  const { marca, modelo, tipo, estado } = req.query;
  let sql = `SELECT producto.*,
                    (SELECT COUNT(*) FROM compatibilidad
                     WHERE compatibilidad.producto_id = producto.id_producto)
                    AS compat_count
             FROM producto WHERE 1=1`;
  const params = [];

  if (marca) {
    sql += ` AND marca ILIKE $${params.length + 1}`;
    params.push(`%${marca}%`);
  }
  if (modelo) {
    sql += ` AND modelo ILIKE $${params.length + 1}`;
    params.push(`%${modelo}%`);
  }
  if (tipo) {
    sql += ` AND tipo = $${params.length + 1}`;
    params.push(tipo);
  }
  if (estado) {
    sql += ` AND estado = $${params.length + 1}`;
    params.push(estado);
  }
  sql += ' ORDER BY marca, modelo';

  try {
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[Productos] Error al listar:', err.message);
    res.status(500).json({ error: 'Error al listar productos' });
  }
}

// ============================================================
// buscar
// GET /api/productos/buscar?q=texto
// ============================================================
async function buscar(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `SELECT producto.*,
              (SELECT COUNT(*) FROM compatibilidad
               WHERE compatibilidad.producto_id = producto.id_producto)
              AS compat_count
       FROM producto
       WHERE (marca ILIKE $1 OR modelo ILIKE $1)
       ORDER BY marca, modelo`,
      [`%${q.trim()}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[Productos] Error al buscar:', err.message);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
}

// ============================================================
// obtener
// GET /api/productos/:id
// Devuelve el producto con su array de compatibilidades
// ============================================================
async function obtener(req, res) {
  const { id } = req.params;

  try {
    const producto = await pool.query(
      'SELECT * FROM producto WHERE id_producto = $1',
      [id]
    );

    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const compatibilidades = await pool.query(
      `SELECT c.id_compatibilidad, p.id_producto, p.marca, p.modelo, p.anio, p.tipo
       FROM compatibilidad c
       JOIN producto p ON p.id_producto = c.producto_compatible_id
       WHERE c.producto_id = $1
       ORDER BY p.marca, p.modelo`,
      [id]
    );

    res.json({
      ...producto.rows[0],
      compatibilidades: compatibilidades.rows,
    });
  } catch (err) {
    console.error('[Productos] Error al obtener:', err.message);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
}

// ============================================================
// crear
// POST /api/productos
// Body: { marca, modelo, anio, tipo, proveedor?, ubicacion?, observaciones? }
// ============================================================
async function crear(req, res) {
  const { marca, modelo, anio, tipo, proveedor, ubicacion, observaciones } = req.body;

  if (!marca || !modelo || !anio || !tipo) {
    return res.status(400).json({
      error: 'marca, modelo, anio y tipo son requeridos',
    });
  }

  if (!['5D', '8D'].includes(tipo)) {
    return res.status(400).json({ error: 'tipo debe ser 5D o 8D' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO producto (marca, modelo, anio, tipo, proveedor, ubicacion, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [marca, modelo, anio, tipo, proveedor || null, ubicacion || null, observaciones || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[Productos] Error al crear:', err.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
}

// ============================================================
// actualizar
// PUT /api/productos/:id
// Body: { marca?, modelo?, anio?, tipo?, proveedor?, ubicacion?, observaciones?, estado? }
// COALESCE: mantiene el valor actual si el campo no se envía
// ============================================================
async function actualizar(req, res) {
  const { id } = req.params;
  const { marca, modelo, anio, tipo, proveedor, ubicacion, observaciones, estado } =
    req.body;

  try {
    const result = await pool.query(
      `UPDATE producto
       SET marca = COALESCE($1, marca),
           modelo = COALESCE($2, modelo),
           anio = COALESCE($3, anio),
           tipo = COALESCE($4, tipo),
           proveedor = COALESCE($5, proveedor),
           ubicacion = COALESCE($6, ubicacion),
           observaciones = COALESCE($7, observaciones),
           estado = COALESCE($8, estado)
       WHERE id_producto = $9
       RETURNING *`,
      [marca, modelo, anio, tipo, proveedor, ubicacion, observaciones, estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Productos] Error al actualizar:', err.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
}

// ============================================================
// cambiarEstado
// PATCH /api/productos/:id/estado
// Body: { estado: 'ACTIVO' | 'INACTIVO' }
// ============================================================
async function cambiarEstado(req, res) {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado || !['ACTIVO', 'INACTIVO'].includes(estado)) {
    return res
      .status(400)
      .json({ error: 'estado debe ser ACTIVO o INACTIVO' });
  }

  try {
    const result = await pool.query(
      `UPDATE producto SET estado = $1 WHERE id_producto = $2 RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Productos] Error al cambiar estado:', err.message);
    res.status(500).json({ error: 'Error al cambiar estado' });
  }
}

// ============================================================
// eliminar
// DELETE /api/productos/:id
// Solo permite eliminar si el producto no tiene movimientos
// ============================================================
async function eliminar(req, res) {
  const { id } = req.params;

  try {
    // Protección: verificar movimientos asociados
    const movimientos = await pool.query(
      `SELECT 1 FROM detalle_movimiento WHERE producto_id = $1 LIMIT 1`,
      [id]
    );

    if (movimientos.rows.length > 0) {
      return res.status(409).json({
        error:
          'No se puede eliminar: el producto tiene movimientos asociados',
      });
    }

    // Limpiar compatibilidades (en ambas direcciones)
    await pool.query(
      'DELETE FROM compatibilidad WHERE producto_id = $1 OR producto_compatible_id = $1',
      [id]
    );

    const result = await pool.query(
      'DELETE FROM producto WHERE id_producto = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('[Productos] Error al eliminar:', err.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
}

// ============================================================
// agregarCompatibilidad
// POST /api/productos/:id/compatibilidades
// Body: { producto_compatible_id: number }
// ============================================================
async function agregarCompatibilidad(req, res) {
  const { id } = req.params;
  const { producto_compatible_id } = req.body;

  if (!producto_compatible_id) {
    return res
      .status(400)
      .json({ error: 'producto_compatible_id es requerido' });
  }

  if (parseInt(id) === parseInt(producto_compatible_id)) {
    return res
      .status(400)
      .json({ error: 'Un producto no puede ser compatible consigo mismo' });
  }

  try {
    // Verificar que ambos productos existen
    const producto = await pool.query(
      'SELECT 1 FROM producto WHERE id_producto = $1',
      [id]
    );
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const compatible = await pool.query(
      'SELECT 1 FROM producto WHERE id_producto = $1',
      [producto_compatible_id]
    );
    if (compatible.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Producto compatible no encontrado' });
    }

    // Insertar (ON CONFLICT DO NOTHING evita duplicados)
    const result = await pool.query(
      `INSERT INTO compatibilidad (producto_id, producto_compatible_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [id, producto_compatible_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(409)
        .json({ error: 'La compatibilidad ya existe' });
    }

    // Devolver el registro creado con datos del compatible
    const compatData = await pool.query(
      `SELECT c.id_compatibilidad, p.id_producto, p.marca, p.modelo, p.anio, p.tipo
       FROM compatibilidad c
       JOIN producto p ON p.id_producto = c.producto_compatible_id
       WHERE c.id_compatibilidad = $1`,
      [result.rows[0].id_compatibilidad]
    );

    res.status(201).json(compatData.rows[0]);
  } catch (err) {
    console.error(
      '[Productos] Error al agregar compatibilidad:',
      err.message
    );
    res.status(500).json({ error: 'Error al agregar compatibilidad' });
  }
}

// ============================================================
// quitarCompatibilidad
// DELETE /api/productos/:id/compatibilidades/:compatId
// ============================================================
async function quitarCompatibilidad(req, res) {
  const { id, compatId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM compatibilidad
       WHERE id_compatibilidad = $1 AND producto_id = $2
       RETURNING *`,
      [compatId, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Compatibilidad no encontrada' });
    }

    res.json({ mensaje: 'Compatibilidad eliminada correctamente' });
  } catch (err) {
    console.error(
      '[Productos] Error al eliminar compatibilidad:',
      err.message
    );
    res.status(500).json({ error: 'Error al eliminar compatibilidad' });
  }
}

module.exports = {
  listar,
  buscar,
  obtener,
  crear,
  actualizar,
  cambiarEstado,
  eliminar,
  agregarCompatibilidad,
  quitarCompatibilidad,
};
