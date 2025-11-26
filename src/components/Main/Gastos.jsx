import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useToast } from '../../contexts/ToastContext';
import ModalConfirmacion from './components/ModalConfirmacion';
import CardResumen from './components/CardResumen';
import HistorialFiltrado from './components/HistorialFiltrado';

function Gastos() {
  const { gastos, createTransaction, deleteTransaction, isLoading } = useTransactions();
  const { showToast } = useToast();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [totalFiltrado, setTotalFiltrado] = useState(null);
  const [cantidadFiltrada, setCantidadFiltrada] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatCurrency, getCurrencySymbol } = useSettings();

  // Obtener gastos del contexto
  const gastosData = gastos();

  // Form state
  const [formData, setFormData] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const categoriasBase = [
    { value: 'alquiler', label: '🏠 Alquiler' },
    { value: 'hipoteca', label: '🏠 Hipoteca' },
    { value: 'compra', label: '🛒 La compra' },
    { value: 'suministros', label: '💡 Suministros' },
    { value: 'transporte', label: '🚗 Transporte' },
    { value: 'tarjeta-credito', label: '💳 Tarjeta de crédito' },
    { value: 'gimnasio', label: '💪 Gimnasio' },
    { value: 'salud', label: '🏥 Salud' },
    { value: 'viajes', label: '✈️ Viajes' },
    { value: 'ocio', label: '🎉 Ocio' },
    { value: 'otro', label: '📝 Otro' }
  ];

  const [categorias, setCategorias] = useState(categoriasBase);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoria || !formData.monto) {
      showToast('Por favor completa los campos obligatorios', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await createTransaction({
        tipo: 'gasto',
        categoria: formData.categoria,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion,
        fecha: formData.fecha
      });

      showToast('Gasto guardado correctamente', 'success');
      
      // Reset form
      setFormData({
        categoria: '',
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      showToast(error || 'Error al guardar el gasto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const abrirModalEliminar = (gasto) => {
    setGastoAEliminar(gasto);
    setModalOpen(true);
  };

  const confirmarEliminar = async () => {
    try {
      await deleteTransaction(gastoAEliminar._id);
      showToast('Gasto eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      showToast(error || 'Error al eliminar el gasto', 'error');
    } finally {
      setModalOpen(false);
      setGastoAEliminar(null);
    }
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      const nuevaCategoria = {
        value: customCategory.toLowerCase().replace(/\s+/g, '-'),
        label: `✨ ${customCategory}`
      };
      setCategorias([...categoriasBase, nuevaCategoria]);
      setFormData({ ...formData, categoria: customCategory });
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  const totalGastos = totalFiltrado !== null 
    ? totalFiltrado 
    : gastosData.reduce((sum, gasto) => sum + gasto.monto, 0);
  const cantidadGastos = cantidadFiltrada !== null 
    ? cantidadFiltrada 
    : gastosData.length;

  if (isLoading) {
    return (
      <main className="wrapper">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid rgba(56, 225, 255, 0.2)',
            borderTop: '4px solid var(--cyan-accent)',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
            Cargando gastos...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="wrapper">
      <h1 style={{ textAlign: 'center' }}>Gestión de Gastos</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Controla tus gastos de manera efectiva
      </p>

      <CardResumen 
        tipo="gastos"
        total={totalGastos}
        cantidad={cantidadGastos}
        mensaje="✨ Registra tu movimiento, pequeño impulso = gran cambio."
        mostrarFormulario={mostrarFormulario}
        onToggleFormulario={() => setMostrarFormulario(!mostrarFormulario)}
        esPeriodoFiltrado={totalFiltrado !== null}
        formatCurrency={formatCurrency}
      />

      {/* Formulario */}
      {mostrarFormulario && (
        <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Nuevo Gasto</h3>

              {/* Categoría */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Categoría *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomCategory(true);
                    } else {
                      setFormData({ ...formData, categoria: e.target.value });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,.2)',
                    background: 'rgba(14,49,71,.5)',
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontFamily: 'inherit'
                  }}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                  <option value="custom">➕ Agregar categoría personalizada</option>
                </select>
              </div>

              {showCustomCategory && (
                <div style={{ 
                  marginBottom: '20px', 
                  padding: '16px',
                  background: 'rgba(56, 225, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Nueva categoría..."
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,.2)',
                        background: 'rgba(14,49,71,.5)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        background: 'var(--cyan-accent)',
                        color: '#00222F',
                        border: 'none',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* Monto */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Monto ({getCurrencySymbol()}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,.2)',
                    background: 'rgba(14,49,71,.5)',
                    color: 'var(--text-primary)',
                    fontSize: '20px',
                    fontWeight: '700',
                    fontFamily: 'inherit'
                  }}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Descripción */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Opcional"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,.2)',
                    background: 'rgba(14,49,71,.5)',
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontFamily: 'inherit'
                  }}
                  disabled={isSubmitting}
                />
              </div>

              {/* Fecha */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,.2)',
                    background: 'rgba(14,49,71,.5)',
                    color: 'var(--text-primary)',
                    fontSize: '22px',
                    fontFamily: 'inherit'
                  }}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isSubmitting 
                    ? 'rgba(43, 227, 255, 0.5)' 
                    : 'linear-gradient(180deg, #2BE3FF 0%, #12B4D6 100%)',
                  color: '#00222F',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {isSubmitting ? 'Guardando...' : '💾 Guardar Gasto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial con gráfica */}
      <HistorialFiltrado 
        type="expense" 
        onDelete={abrirModalEliminar}
        data={gastosData}
        onTotalChange={(total, cantidad) => {
          setTotalFiltrado(total);
          setCantidadFiltrada(cantidad);
        }}
        formatCurrency={formatCurrency}
      />

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        mensaje="Este gasto se eliminará permanentemente."
      />
    </main>
  );
}

export default Gastos;