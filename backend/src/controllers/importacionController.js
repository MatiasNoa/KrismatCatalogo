const pool = require('../db');

function parseCSV(texto) {
  const lineas = texto.trim().split('\n');
  if (lineas.length < 2) return { error: 'El archivo debe tener un encabezado y al menos una fila' };

  const encabezados = lineas[0].split(',').map((h) => h.trim().toLowerCase());
  const columnasEsperadas = ['marca', 'modelo', 'anio', 'tipo', 'stock'];

  for (const col of columnasEsperadas) {
    if (!encabezados.includes(col)) {
      return { error: `Falta la columna requerida: "${col}"` };
    }
  }

  const filas = [];
  for (let i = 1; i < lineas.length; i++) {
    const vals = lineas[i].split(',').map((v) => v.trim());
    const fila = {};
    const errores = [];

    encabezados.forEach((h, idx) => {
      fila[h] = vals[idx] || '';
    });

    if (!fila.marca) errores.push('Marca requerida');
    if (!fila.modelo) errores.push('Modelo requerido');
    if (!fila.anio) errores.push('Año requerido');
    if (!fila.tipo) errores.push('Tipo requerido (5D/8D)');
    if (!['5D', '8D'].includes(fila.tipo.toUpperCase())) errores.push('Tipo debe ser 5D o 8D');

    const stock = parseInt(fila.stock);
    if (isNaN(stock) || stock < 0) errores.push('Stock debe ser un número >= 0');

    filas.push({
      linea: i + 1,
      datos: fila,
      valido: errores.length === 0,
      errores,
    });
  }

  return { filas, total: filas.length, validos: filas.filter((f) => f.valido).length, invalidos: filas.filter((f) => !f.valido).length };
}

async function previsualizar(req, res) {
  const { csv } = req.body;

  if (!csv || typeof csv !== 'string') {
    return res.status(400).json({ error: 'El campo "csv" es requerido' });
  }

  try {
    const resultado = parseCSV(csv);
    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }
    res.json(resultado);
  } catch (err) {
    console.error('[Importación] Error al previsualizar:', err.message);
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
}

async function confirmar(req, res) {
  const { csv } = req.body;

  if (!csv || typeof csv !== 'string') {
    return res.status(400).json({ error: 'El campo "csv" es requerido' });
  }

  const parsed = parseCSV(csv);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const soloValidos = parsed.filas.filter((f) => f.valido);
  if (soloValidos.length === 0) {
    return res.status(400).json({ error: 'No hay filas válidas para importar' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let insertados = 0;
    let actualizados = 0;

    for (const f of soloValidos) {
      const d = f.datos;

      // Buscar producto existente por marca + modelo + anio + tipo
      const existente = await client.query(
        `SELECT id_producto FROM producto
         WHERE marca = $1 AND modelo = $2 AND anio = $3 AND tipo = $4`,
        [d.marca, d.modelo, d.anio, d.tipo.toUpperCase()]
      );

      const stock = parseInt(d.stock);

      if (existente.rows.length > 0) {
        await client.query(
          `UPDATE producto
           SET stock = stock + $1,
               ubicacion = COALESCE(NULLIF($2, ''), ubicacion),
               proveedor = COALESCE(NULLIF($3, ''), proveedor),
               observaciones = COALESCE(NULLIF($4, ''), observaciones)
           WHERE id_producto = $5`,
          [stock, d.ubicacion || '', d.proveedor || '', d.observaciones || '', existente.rows[0].id_producto]
        );
        actualizados++;
      } else {
        await client.query(
          `INSERT INTO producto (marca, modelo, anio, tipo, stock, ubicacion, proveedor, observaciones)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [d.marca, d.modelo, d.anio, d.tipo.toUpperCase(), stock, d.ubicacion || '', d.proveedor || '', d.observaciones || '']
        );
        insertados++;
      }
    }

    await client.query('COMMIT');

    res.json({
      message: `Importación completada: ${insertados} insertados, ${actualizados} actualizados`,
      insertados,
      actualizados,
      invalidos: parsed.invalidos,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Importación] Error al confirmar:', err.message);
    res.status(400).json({ error: err.message || 'Error al importar datos' });
  } finally {
    client.release();
  }
}

module.exports = { previsualizar, confirmar };
