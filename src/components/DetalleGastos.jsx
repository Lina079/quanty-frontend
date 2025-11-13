import { useState, useEffect } from 'react';
import ModalConfirmacion from './ModalConfirmacion';

function DetalleGastos() {
  const [gastos, setGastos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);

  const cargarGastos = () => {
    const gastosGuardados = JSON.parse(localStorage.getItem('gastos') || '[]');
    const gastosOrdenados = gastosGuardados.sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    setGastos(gastosOrdenados);
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  const abrirModalEliminar = (gasto) => {
    setGastoAEliminar(gasto);
    setModalOpen(true);
  };

  const confirmarEliminar = () => {
    const gastosActualizados = gastos.filter(g => g.id !== gastoAEliminar.id);
    localStorage.setItem('gastos', JSON.stringify(gastosActualizados));
    setGastos(gastosActualizados);
    setModalOpen(false);
    setGastoAEliminar(null);
  };

  const getCategoriaEmoji = (categoria) => {
    const emojis = {
      'compra': '🛒', 'alquiler': '🏠', 'suministros': '💡',
      'transporte': '🚗', 'gimnasio': '💪', 'salud': '🏥',
      'viajes': '✈️', 'ocio': '🎉', 'otro': '📝'
    };
    return emojis[categoria] || '💰';
  };

  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

  return (
    <div className="wrapper">
      <h1>Detalle de Gastos</h1>
      <p className="subtitle">Gestiona tus gastos registrados</p>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto 32px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '12px' }}>Total Gastos</h3>
        <p style={{ fontSize: '42px', fontWeight: '800', color: '#EF4444', margin: 0 }}>
          €{totalGastos.toFixed(2)}
        </p>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          {gastos.length} {gastos.length === 1 ? 'gasto' : 'gastos'}
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {gastos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📊</p>
            <h3 style={{ marginBottom: '12px' }}>No hay gastos registrados</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Comienza agregando tu primer gasto desde el Dashboard
            </p>
          </div>
        ) : (
          gastos.map(gasto => (
            <div key={gasto.id} className="card" style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '60px 1fr auto auto',
                gap: '16px',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '32px', textAlign: 'center' }}>
                  {getCategoriaEmoji(gasto.categoria)}
                </div>
                <div>
                  <h3 style={{ marginBottom: '4px', textTransform: 'capitalize' }}>
                    {gasto.categoria}
                  </h3>
                  {gasto.descripcion && (
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                      {gasto.descripcion}
                    </p>
                  )}
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    {new Date(gasto.fecha).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '24px', fontWeight: '800', color: '#EF4444', margin: 0 }}>
                    €{gasto.monto.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => abrirModalEliminar(gasto)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        mensaje="Este gasto se eliminará permanentemente."
      />
    </div>
  );
}

export default DetalleGastos;