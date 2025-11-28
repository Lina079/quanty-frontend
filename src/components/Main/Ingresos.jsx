import { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useToast } from '../../contexts/ToastContext';
import ModalConfirmacion from './components/ModalConfirmacion';
import CardResumen from './components/CardResumen';
import HistorialFiltrado from './components/HistorialFiltrado';

function Ingresos() {
  const { ingresos, createTransaction, deleteTransaction, isLoading } = useTransactions();
  const { showToast } = useToast();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ingresoAEliminar, setIngresoAEliminar] = useState(null);
  const [totalFiltrado, setTotalFiltrado] = useState(null);
  const [cantidadFiltrada, setCantidadFiltrada] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatCurrency, getCurrencySymbol } = useSettings();
  const { t } = useLanguage();

  // Obtener ingresos del contexto
  const ingresosData = ingresos();

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
  { value: 'sueldo', label: t('incomeCategories.salary') },
  { value: 'freelance', label: t('incomeCategories.freelance') },
  { value: 'comisiones', label: t('incomeCategories.commissions') },
  { value: 'dividendos', label: t('incomeCategories.dividends') },
  { value: 'otro', label: t('incomeCategories.other') }
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
        tipo: 'ingreso',
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
      console.error('Error al guardar ingreso:', error);
      showToast(error || t('toast.errorSaving'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const abrirModalEliminar = (ingreso) => {
    setIngresoAEliminar(ingreso);
    setModalOpen(true);
  };

  const confirmarEliminar = async () => {
    try {
      await deleteTransaction(ingresoAEliminar._id);
      showToast(t('toast.deletedSuccess'), 'success');
    } catch (error) {
      console.error('Error al eliminar ingreso:', error);
      showToast(error || t('toast.errorDeleting'), 'error');
    } finally {
      setModalOpen(false);
      setIngresoAEliminar(null);
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

  const totalIngresos = totalFiltrado !== null 
    ? totalFiltrado 
    : ingresosData.reduce((sum, ingreso) => sum + ingreso.monto, 0);
  const cantidadIngresos = cantidadFiltrada !== null 
    ? cantidadFiltrada 
    : ingresosData.length;

  if (isLoading) {
    return (
      <main className="wrapper">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid rgba(74, 222, 128, 0.2)',
            borderTop: '4px solid #4ADE80',
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
      <h1 style={{ textAlign: 'center' }}>{t('income.title')}</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        {t('income.subtitle')}
      </p>

      <CardResumen 
        tipo="ingresos"
        total={totalIngresos}
        cantidad={cantidadIngresos}
        mensaje={t('income.quantumMessage')}
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
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>{t('income.newIncome')}</h3>

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
                  background: 'rgba(74, 222, 128, 0.1)',
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
                        background: '#4ADE80',
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
                    ? 'rgba(74, 222, 128, 0.5)' 
                    : 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
                  color: '#00222F',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {isSubmitting ? `${t('common.loading')}...` : `💾 ${t('income.addIncome')}` }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial con gráfica */}
      <HistorialFiltrado 
        type="income" 
        onDelete={abrirModalEliminar}
        data={ingresosData}
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
        mensaje="Este ingreso se eliminará permanentemente."
      />
    </main>
  );
}

export default Ingresos;