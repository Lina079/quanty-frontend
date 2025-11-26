import { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useToast } from '../../contexts/ToastContext';
import ModalConfirmacion from './components/ModalConfirmacion';
import CardResumen from './components/CardResumen';
import HistorialFiltrado from './components/HistorialFiltrado';

function Ahorros() {
  const { ahorros, createTransaction, deleteTransaction, isLoading } = useTransactions();
  const { showToast } = useToast();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ahorroAEliminar, setAhorroAEliminar] = useState(null);
  const [totalFiltrado, setTotalFiltrado] = useState(null);
  const [cantidadFiltrada, setCantidadFiltrada] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatCurrency, getCurrencySymbol } = useSettings();

  // Obtener ahorros del contexto
  const ahorrosData = ahorros();

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
    { value: 'tranquilidad', label: '🛡️ Ahorro de tranquilidad' },
    { value: 'invertir', label: '📈 Ahorro para invertir' },
    { value: 'viajar', label: '✈️ Ahorro para viajar' },
    { value: 'casa', label: '🏠 Ahorro comprar casa' },
    { value: 'carro', label: '🚗 Ahorro comprar carro' },
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
        tipo: 'ahorro',
        categoria: formData.categoria,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion,
        fecha: formData.fecha
      });

      showToast('Ahorro guardado correctamente', 'success');
      
      // Reset form
      setFormData({
        categoria: '',
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al guardar ahorro:', error);
      showToast(error || 'Error al guardar el ahorro', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const abrirModalEliminar = (ahorro) => {
    setAhorroAEliminar(ahorro);
    setModalOpen(true);
  };

  const confirmarEliminar = async () => {
    try {
      await deleteTransaction(ahorroAEliminar._id);
      showToast('Ahorro eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error al eliminar ahorro:', error);
      showToast(error || 'Error al eliminar el ahorro', 'error');
    } finally {
      setModalOpen(false);
      setAhorroAEliminar(null);
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

  const totalAhorros = totalFiltrado !== null 
    ? totalFiltrado 
    : ahorrosData.reduce((sum, ahorro) => sum + ahorro.monto, 0);
  const cantidadAhorros = cantidadFiltrada !== null 
    ? cantidadFiltrada 
    : ahorrosData.length;

  if (isLoading) {
    return (
      <main className="wrapper">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid rgba(245, 158, 11, 0.2)',
            borderTop: '4px solid #F59E0B',
            borderRadius: '50%',
            margin: '0 auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
            Cargando ahorros...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="wrapper">
      <h1 style={{ textAlign: 'center' }}>Gestión de Ahorros</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Construye tu futuro financiero
      </p>

      <CardResumen 
        tipo="ahorros"
        total={totalAhorros}
        cantidad={cantidadAhorros}
        mensaje="💎 Ahorrar es plantar semillas para tu futuro. ¡Todo cuenta!"
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
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Nuevo Ahorro</h3>

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
                  background: 'rgba(245, 158, 11, 0.1)',
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
                        background: '#F59E0B',
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
                    fontSize: '16px',
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
                    ? 'rgba(245, 158, 11, 0.5)' 
                    : 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                  color: '#00222F',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {isSubmitting ? 'Guardando...' : '💾 Guardar Ahorro'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial con gráfica */}
      <HistorialFiltrado 
        type="saving" 
        onDelete={abrirModalEliminar}
        data={ahorrosData}
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
        mensaje="Este ahorro se eliminará permanentemente."
      />
    </main>
  );
}

export default Ahorros;
