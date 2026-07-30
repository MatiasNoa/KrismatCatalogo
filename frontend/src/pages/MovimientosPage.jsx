import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { movimientosApi } from '../services/api';
import MovementCard from '../components/Movimientos/MovementCard';
import MovementDetail from '../components/Movimientos/MovementDetail';
import { Plus, ClipboardList } from 'lucide-react';

export default function MovimientosPage() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroTipo) params.tipo = filtroTipo;
      const data = await movimientosApi.listar(params);
      setMovimientos(data);
    } catch (err) {
      console.error('Error al cargar movimientos:', err);
    } finally {
      setLoading(false);
    }
  }, [filtroTipo]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleClick = useCallback(async (mov) => {
    setSelected(mov);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const data = await movimientosApi.obtener(mov.id_movimiento);
      setDetailData(data);
    } catch (err) {
      console.error('Error al obtener detalle:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
    setDetailData(null);
  }, []);

  return (
    <div className="page page-movements">
      <div className="page-movements__filters">
        <select
          className="form-select"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos los movimientos</option>
          <option value="ENTRADA">Entradas</option>
          <option value="SALIDA">Salidas</option>
          <option value="AJUSTE_POSITIVO">Ajustes +</option>
          <option value="AJUSTE_NEGATIVO">Ajustes -</option>
        </select>
      </div>

      <div className="page-movements__list">
        {loading && (
          <div className="empty-state">
            <p>Cargando movimientos...</p>
          </div>
        )}

        {!loading && movimientos.length === 0 && (
          <div className="empty-state">
            <ClipboardList size={48} />
            <h3>Sin movimientos</h3>
            <p>{filtroTipo ? 'No hay movimientos de este tipo' : 'Todavía no se registraron movimientos'}</p>
          </div>
        )}

        {!loading && movimientos.map((m) => (
          <MovementCard key={m.id_movimiento} movimiento={m} onClick={handleClick} />
        ))}
      </div>

      <button className="fab" onClick={() => navigate('/movimientos/crear')} aria-label="Nuevo movimiento">
        <Plus size={24} />
      </button>

      {detailLoading && selected && (
        <>
          <div className="modal-overlay active" />
          <div className="bottom-sheet active">
            <div className="bottom-sheet__handle" />
            <div className="bottom-sheet__header">
              <h2 className="bottom-sheet__title">Cargando...</h2>
            </div>
          </div>
        </>
      )}
      {detailData && <MovementDetail movimiento={detailData} onClose={handleClose} />}
    </div>
  );
}
