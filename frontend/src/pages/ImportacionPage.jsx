import { useState, useRef } from 'react';
import { importacionApi } from '../services/api';
import { Upload, CheckCircle, XCircle, AlertTriangle, FileText, Download } from 'lucide-react';

export default function ImportacionPage() {
  const [csvContent, setCsvContent] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setResult(null);
    setError(null);
    setPreview(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setCsvContent(text);
      handlePreview(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handlePreview = async (csv) => {
    setLoading(true);
    setError(null);
    try {
      const data = await importacionApi.preview(csv);
      setPreview(data);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview || preview.validos === 0) return;
    setConfirming(true);
    setError(null);
    try {
      const data = await importacionApi.confirm(csvContent);
      setResult(data);
      setPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const descargarPlantilla = () => {
    const template = 'marca,modelo,anio,tipo,stock,ubicacion,proveedor,observaciones\nToyota,Corolla,2015-2020,5D,10,A1-01,Proveedor SAC,\nSubaru,Forester,2019+,8D,5,B2-03,Freya,';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_importacion.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <h1 className="page-reports__title">Importación</h1>

      {/* Plantilla descargable */}
      <div className="import-section">
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Descargá la plantilla CSV, completala con tus productos y luego importala.
        </p>
        <button className="btn btn--secondary" onClick={descargarPlantilla}>
          <Download size={16} /> Descargar plantilla
        </button>
      </div>

      <div className="import-section">
        <h2 className="import-section__title">Subir archivo</h2>
        <p className="import-section__desc">Formatos aceptados: CSV con columnas: marca, modelo, anio, tipo, stock, ubicacion, proveedor, observaciones</p>

        <div
          className="file-upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="file-upload__icon">
            <Upload size={40} />
          </div>
          <div className="file-upload__text">
            Arrastrá tu archivo CSV aquí o <strong>hacé clic para seleccionar</strong>
          </div>
          <div className="file-upload__hint">Archivo CSV con encabezados</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--color-danger-light)', color: 'var(--color-danger)',
          padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)',
          display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
        }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Preview */}
      {loading && (
        <div className="loading-state"><p>Procesando archivo...</p></div>
      )}

      {preview && !loading && (
        <div className="import-section">
          <h2 className="import-section__title">Vista previa</h2>
          <p className="import-section__desc">
            {preview.total} filas encontradas — {' '}
            <span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-weight-semibold)' }}>
              {preview.validos} válidas
            </span>
            {preview.invalidos > 0 && (
              <span style={{ color: 'var(--color-danger)', fontWeight: 'var(--font-weight-semibold)' }}>
                {' '}· {preview.invalidos} inválidas
              </span>
            )}
          </p>

          <div className="table-container" style={{ maxHeight: '20rem', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Año</th>
                  <th>Tipo</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {preview.filas.map((f, i) => (
                  <tr key={i} style={f.valido ? {} : { background: 'var(--color-danger-light)' }}>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{f.linea}</td>
                    <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{f.datos.marca}</td>
                    <td>{f.datos.modelo}</td>
                    <td>{f.datos.anio}</td>
                    <td><span className="badge badge--type">{f.datos.tipo?.toUpperCase()}</span></td>
                    <td>{f.datos.stock}</td>
                    <td>
                      {f.valido ? (
                        <span className="badge badge--stock"><CheckCircle size={12} /> Válido</span>
                      ) : (
                        <span className="badge badge--nostock"><XCircle size={12} /> {f.errores[0]}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-actions" style={{ marginTop: 'var(--spacing-xl)' }}>
            <button
              className="btn btn--primary btn--full btn--lg"
              disabled={preview.validos === 0 || confirming}
              onClick={handleConfirm}
            >
              {confirming ? 'Importando...' : `Importar ${preview.validos} fila${preview.validos !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="import-section">
          <h2 className="import-section__title">Resultado</h2>
          <div style={{
            background: 'var(--color-success-light)', color: 'var(--color-success)',
            padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-xl)',
            display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
              <CheckCircle size={20} /> {result.message}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-xl)', fontSize: 'var(--font-size-sm)' }}>
              <span><strong>{result.insertados}</strong> insertados</span>
              <span><strong>{result.actualizados}</strong> actualizados</span>
              {result.invalidos > 0 && <span><strong>{result.invalidos}</strong> inválidos</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
