import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movimientosApi } from '../services/api';
import MovementForm from '../components/Movimientos/MovementForm';

export default function MovimientoFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await movimientosApi.crear(data);
      navigate('/movimientos');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div style={{
          background: 'var(--color-danger-light)', color: 'var(--color-danger)',
          padding: 'var(--spacing-md) var(--spacing-lg)', borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)',
        }}>
          {error}
        </div>
      )}
      <MovementForm onSubmit={handleSubmit} loading={loading} />
    </>
  );
}
