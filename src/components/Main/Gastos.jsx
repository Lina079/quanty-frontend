import { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useToast } from '../../contexts/ToastContext';
import BudgetCard from '../Budget/BudgetCard';
import ModalConfirmacion from './components/ModalConfirmacion';
import CardResumen from './components/CardResumen';
import HistorialFiltrado from './components/HistorialFiltrado';
import quantumHead from '../../images/Quantum-only-head.png';

function Gastos() {
  const { gastos, ingresos, ahorros, inversiones, createTransaction, deleteTransaction, isLoading } = useTransactions();
  const { showToast } = useToast();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [totalFiltrado, setTotalFiltrado] = useState(null);
  const [cantidadFiltrada, setCantidadFiltrada] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatCurrency, getCurrencySymbol } = useSettings();
  const { t } = useLanguage();

  // Obtener gastos del contexto
  const gastosData = gastos();
  const ahorrosData = ahorros();
  const inversionesData = inversiones();
  const ingresosData = ingresos();

  // Calcular balance disponible
  const sumIngresos = ingresosData.reduce((sum, i) => sum + i.monto, 0);
  const sumGastos = gastosData.reduce((sum, g) => sum + g.monto, 0);
  const sumAhorros = ahorrosData.reduce((sum, a) => sum + a.monto, 0);
  const sumInversiones = inversionesData.reduce((sum, inv) => sum + inv.monto, 0);
  const balanceDisponible = sumIngresos - sumGastos - sumAhorros - sumInversiones;

  // Determinar color y mensaje del balance
  const getBalanceInfo = () => {
    if (balanceDisponible > 0) {
      return { color: '#4ADE80', mensaje: t('expenses.balancePositive') }; 
    } else if (balanceDisponible === 0) {
      return { color: '#F59E0B', mensaje: t('expenses.balanceZero') };
    } else {
      return { color: '#EF4444', mensaje: t('expenses.balanceNegative') };
    }
  };

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
  { value: 'alquiler', label: t('expenseCategories.rent') },
  { value: 'hipoteca', label: t('expenseCategories.mortgage') },
  { value: 'compra', label: t('expenseCategories.groceries') },
  { value: 'suministros', label: t('expenseCategories.utilities') },
  { value: 'transporte', label: t('expenseCategories.transport') },
  { value: 'tarjeta-credito', label: t('expenseCategories.creditCard') },
  { value: 'gimnasio', label: t('expenseCategories.gym') },
  { value: 'salud', label: t('expenseCategories.health') },
  { value: 'viajes', label: t('expenseCategories.travel') },
  { value: 'ocio', label: t('expenseCategories.entertainment') },
  { value: 'otro', label: t('expenseCategories.other') }
  ];

  const [categorias, setCategorias] = useState(categoriasBase);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoria || !formData.monto) {
      showToast(t('form.requiredFields'), 'error');
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

      showToast(t('toast.savedSuccess'), 'success');
      
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
      showToast(error || t('toast.errorSaving'), 'error');
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
      showToast(t('toast.deletedSuccess'), 'success');
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      showToast(error || t('toast.errorDeleting'), 'error');
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
            {t('common.loading')}...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="wrapper">
      <h1 style={{ textAlign: 'center' }}>{t('expenses.title')}</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        {t('expenses.subtitle')}
      </p>

      <CardResumen 
        tipo="gastos"
        total={totalGastos}
        cantidad={cantidadGastos}
        mensaje={t('expenses.quantumMessage')}
        mostrarFormulario={mostrarFormulario}
        onToggleFormulario={() => setMostrarFormulario(!mostrarFormulario)}
        esPeriodoFiltrado={totalFiltrado !== null}
        formatCurrency={formatCurrency}
      />

        {/* Balance Disponible - Estilo Kakeibo */}
      <div className="kakeibo-balance-box" style={{
      maxWidth: '800px',
      margin: '0 auto 24px',
      padding: '20px 24px',
      background: 'linear-gradient(160deg, var(--card-bg-start) 0%, var(--card-bg-end) 100%)',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: '16px'
      }}>
        {/* Trabajando para ti (Ahorro + Inversión) */}
      <div style={{ marginBottom: '16px' }}>
      <p style={{ 
      margin: 0, 
      fontSize: '14px', 
      color: 'var(--text-secondary)' 
      }}>
        🌱 {t('expenses.workingForYou')}
      </p>
      <p style={{ 
      margin: '4px 0 0', 
      fontSize: '24px', 
      fontWeight: '800',
      color: '#4ADE80'
      }}>
        {formatCurrency(sumAhorros + sumInversiones)}
      </p>
      <p style={{ 
      margin: '4px 0 0', 
      fontSize: '12px', 
      color: 'var(--text-secondary)' 
      }}>
        ({t('nav.savings')} {formatCurrency(sumAhorros)} + {t('nav.investments')} {formatCurrency(sumInversiones)})
      </p>
      </div>

        {/* Separador */}
      <div style={{ 
        borderTop: '1px solid rgba(255,255,255,.1)', 
        margin: '16px 0' 
      }}></div>

      {/* Libre para gastar */}
    <div className="kakeibo-balance-content">
    <div>
    <p style={{ 
      margin: 0, 
      fontSize: '14px', 
      color: 'var(--text-secondary)' 
    }}>
      💳 {t('expenses.freeToSpend')}
    </p>
    <p style={{ 
      margin: '4px 0 0', 
      fontSize: '24px', 
      fontWeight: '800',
      color: getBalanceInfo().color
    }}>
      {formatCurrency(balanceDisponible)}
    </p>
  </div>
    
  {/* Quantum + Mensaje */}
  <div className="quantum-msg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img 
      src={quantumHead} 
      alt="Quantum" 
      style={{ width: '40px', height: '40px' }} 
    />
    <p style={{ 
      margin: 0, 
      fontSize: '14px', 
      color: 'var(--text-secondary)',
      maxWidth: '150px'
    }}>
      {getBalanceInfo().mensaje}
    </p>
    </div>
    </div>
    </div>

    {/* Presupuesto */}
      <BudgetCard tipo="gasto" />

      {/* Formulario */}
      {mostrarFormulario && (
        <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>{t('expenses.newExpense')}</h3>

              {/* Categoría */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  {t('form.category')} *
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
                  <option value="">{t('form.selectCategory')}</option>
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                  <option value="custom">➕ {t('form.addCustomCategory')}</option>
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
                      placeholder={t('form.newCategory')}
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
                  {t('form.amount')} ({getCurrencySymbol()}) *
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
                  {t('form.description')}
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder={t('form.optional')}
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
                  {t('form.date')}
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
                    fontSize: 'clamp(14px, 2vw, 20px)',
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
                {isSubmitting ? `${t('common.loading')}...` : `💾 ${t('expenses.addExpense')}`}
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
        mensaje={t('modal.permanentDelete')}
      />
    </main>
  );
}

export default Gastos;