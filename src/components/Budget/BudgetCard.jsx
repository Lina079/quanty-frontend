import { useState, useMemo } from 'react';
import { useBudgets } from '../../contexts/BudgetsContext';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import quantumHead from '../../images/Quantum-only-head.png';

function BudgetCard({ tipo = 'gasto' }) {
  const { budgets, createBudget, deleteBudget, isLoading } = useBudgets();
  const { transactions } = useTransactions();
  const { formatCurrency, getCurrencySymbol } = useSettings();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  // Estados del componente
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ 
    categoria: '', 
    previsto: '', 
    customCategoria: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  // Fecha actual
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth();
  const añoActual = fechaActual.getFullYear();

 // Categorías según tipo (usan las mismas keys que categoryLabels)
  const categoriasPredefinidas = useMemo(() => {
    if (tipo === 'gasto') {
      return [
        { key: 'alquiler', emoji: '🏠' },
        { key: 'hipoteca', emoji: '🏠' },
        { key: 'compra', emoji: '🛒' },
        { key: 'suministros', emoji: '💡' },
        { key: 'transporte', emoji: '🚗' },
        { key: 'tarjeta-credito', emoji: '💳' },
        { key: 'gimnasio', emoji: '💪' },
        { key: 'salud', emoji: '🏥' },
        { key: 'viajes', emoji: '✈️' },
        { key: 'ocio', emoji: '🎉' },
        { key: 'otro', emoji: '📝' }
      ];
    } else {
      return [
        { key: 'sueldo', emoji: '💼' },
        { key: 'freelance', emoji: '💻' },
        { key: 'comisiones', emoji: '💰' },
        { key: 'dividendos', emoji: '📈' },
        { key: 'venta', emoji: '🏷️' },
        { key: 'otro', emoji: '📝' }
      ];
    }
  }, [tipo]);
  
 // Presupuestos filtrados por tipo
  const presupuestosTipo = useMemo(() => {
    return budgets.filter(b => b.tipo === tipo && b.activo);
  }, [budgets, tipo]);

  // Categorías ya usadas (para excluirlas del select)
  const categoriasUsadas = useMemo(() => {
    return presupuestosTipo.map(b => b.categoria.toLowerCase());
  }, [presupuestosTipo]);

  // Categorías disponibles para añadir
  const categoriasDisponibles = useMemo(() => {
    return categoriasPredefinidas.filter(
      cat => !categoriasUsadas.includes(cat.key.toLowerCase())
    );
  }, [categoriasPredefinidas, categoriasUsadas]);

  // Gastos/ingresos del mes actual agrupados por categoría
  const montosDelMes = useMemo(() => {
    const tipoTransaccion = tipo === 'gasto' ? 'gasto' : 'ingreso';
    
    return transactions
      .filter(t => {
        const fecha = new Date(t.fecha);
        return t.tipo === tipoTransaccion &&
               fecha.getMonth() === mesActual &&
               fecha.getFullYear() === añoActual;
      })
      .reduce((acc, t) => {
        const cat = t.categoria.toLowerCase();
        acc[cat] = (acc[cat] || 0) + t.monto;
        return acc;
      }, {});
  }, [transactions, tipo, mesActual, añoActual]);

  // Obtener label traducido de categoría
  const getCategoryLabel = (key) => {
    const label = t(`categoryLabels.${key}`);
    if (label === `categoryLabels.${key}`) {
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
    return label;
  };

  // Nombre del mes
  const nombreMes = fechaActual.toLocaleDateString(
    language === 'es' ? 'es-ES' : 'en-US', 
    { month: 'long' }
  );
  
  // Datos calculados para cada presupuesto
  const datosPresupuesto = useMemo(() => {
    return presupuestosTipo.map(budget => {
      const categoriaLower = budget.categoria.toLowerCase();
      const real = montosDelMes[categoriaLower] || 0;
      const previsto = budget.previsto;
      const porcentaje = previsto > 0 ? (real / previsto) * 100 : 0;
      const diferencia = previsto - real;

      let estado, color, mensajeKey;
      
      // Verificar si está "completado" (entre 99.5% y 100.5%)
      const esCompletado = porcentaje >= 99.5 && porcentaje <= 100.5;
      
      if (porcentaje <= 50) {
        estado = 'bien';
        color = '#4ADE80';
        mensajeKey = 'budget.status.good';
      } else if (porcentaje <= 80) {
        estado = 'precaucion';
        color = '#FBBF24';
        mensajeKey = 'budget.status.caution';
      } else if (porcentaje < 99.5) {
        estado = 'alerta';
        color = '#F97316';
        mensajeKey = 'budget.status.alert';
      } else if (esCompletado) {
        // 100% exacto = completado (perfecto para gastos fijos)
        estado = 'completado';
        color = '#38E1FF'; // Cyan de Quanty
        mensajeKey = 'budget.status.completed';
      } else {
        // > 100.5% = excedido
        estado = 'excedido';
        color = '#EF4444';
        mensajeKey = tipo === 'gasto' 
          ? 'budget.status.exceededExpense' 
          : 'budget.status.exceededIncome';
      }

      return {
        ...budget,
        real,
        porcentaje: Math.min(porcentaje, 100),
        porcentajeReal: porcentaje,
        diferencia,
        estado,
        color,
        mensaje: t(mensajeKey)
      };
    });
  }, [presupuestosTipo, montosDelMes, t, tipo]);

  // Totales generales
  const totales = useMemo(() => {
    const totalPrevisto = datosPresupuesto.reduce((sum, item) => sum + item.previsto, 0);
    const totalReal = datosPresupuesto.reduce((sum, item) => sum + item.real, 0);
    const porcentajeTotal = totalPrevisto > 0 ? (totalReal / totalPrevisto) * 100 : 0;
    
    let colorTotal;
    if (porcentajeTotal <= 50) colorTotal = '#4ADE80';
    else if (porcentajeTotal <= 80) colorTotal = '#FBBF24';
    else if (porcentajeTotal < 100) colorTotal = '#F97316';
    else colorTotal = '#EF4444';

    return { totalPrevisto, totalReal, porcentajeTotal, colorTotal };
  }, [datosPresupuesto]);

 // Añadir presupuesto
  const handleAddBudget = async (e) => {
    e.preventDefault();
    
    const categoriaFinal = newBudget.categoria === 'custom' 
      ? newBudget.customCategoria.trim()
      : newBudget.categoria;

    if (!categoriaFinal || !newBudget.previsto) {
      showToast(t('form.requiredFields'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBudget({
        categoria: categoriaFinal,
        previsto: parseFloat(newBudget.previsto),
        tipo: tipo
      });
      showToast(t('budget.budgetAdded'), 'success');
      setNewBudget({ categoria: '', previsto: '', customCategoria: '' });
      setShowAddForm(false);
    } catch (error) {
      if (error.includes && error.includes('duplicate')) {
        showToast(t('budget.duplicateError'), 'error');
      } else {
        showToast(error || 'Error', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir modal eliminar
  const openDeleteModal = (budget) => {
    setBudgetToDelete(budget);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!budgetToDelete) return;
    
    try {
      await deleteBudget(budgetToDelete._id);
      showToast(t('budget.budgetDeleted'), 'success');
    } catch (error) {
      showToast(error || 'Error', 'error');
    } finally {
      setShowDeleteModal(false);
      setBudgetToDelete(null);
    }
  };

  // Loading state
  if (isLoading) return null;
  
  // Estilos inline reutilizables
  const styles = {
    input: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid var(--border-color, rgba(255,255,255,.2))',
      background: 'var(--input-bg, rgba(14,49,71,.5))',
      color: 'var(--text-primary)',
      fontSize: '14px',
      fontFamily: 'inherit',
      width: '100%',
      boxSizing: 'border-box'
    },
    select: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid var(--border-color, rgba(255,255,255,.2))',
      background: 'var(--input-bg, rgba(14,49,71,.5))',
      color: 'var(--text-primary)',
      fontSize: '14px',
      fontFamily: 'inherit',
      width: '100%',
      boxSizing: 'border-box',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2338E1FF' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: '36px'
    },
    deleteButton: {
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#EF4444',
      cursor: 'pointer',
      fontSize: '13px',
      padding: '6px 12px',
      borderRadius: '8px',
      fontFamily: 'inherit',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'background 0.2s'
    }
  };

 return (
    <>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 24px',
        background: 'linear-gradient(160deg, var(--card-bg-start) 0%, var(--card-bg-end) 100%)',
        border: '1px solid var(--border-color, rgba(255,255,255,.1))',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        
        {/* Header colapsable */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            borderBottom: isExpanded ? '1px solid var(--border-color, rgba(255,255,255,.1))' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                {tipo === 'gasto' ? t('budget.title') : t('budget.titleIncome')}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} {añoActual}
              </p>
            </div>
          </div>
          
          {/* Mini resumen cuando está cerrado */}
          {!isExpanded && datosPresupuesto.length > 0 && (
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '700',
              color: totales.colorTotal,
              marginRight: '8px'
            }}>
              {formatCurrency(totales.totalReal)} / {formatCurrency(totales.totalPrevisto)}
            </span>
          )}
          
          <span style={{ 
            fontSize: '18px',
            transition: 'transform 0.2s',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text-secondary)'
          }}>
            ▼
          </span>
        </div> 

        {/* Contenido expandible */}
        {isExpanded && (
          <div style={{ padding: '20px' }}>
            
            {/* Resumen total */}
            {datosPresupuesto.length > 0 && (
              <div style={{
                padding: '16px',
                background: 'var(--card-item-bg, rgba(14,49,71,.4))',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {t('budget.totalBudget')}
                  </span>
                  <div>
                    <span style={{ 
                      fontSize: '20px', 
                      fontWeight: '800',
                      color: totales.colorTotal 
                    }}>
                      {formatCurrency(totales.totalReal)}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                      {' / '}{formatCurrency(totales.totalPrevisto)}
                    </span>
                  </div>
                </div>
                
                {/* Barra de progreso total */}
                <div style={{
                  height: '8px',
                  background: 'var(--progress-bg, rgba(255,255,255,.1))',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(totales.porcentajeTotal, 100)}%`,
                    height: '100%',
                    background: totales.colorTotal,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                
                <p style={{ 
                  margin: '8px 0 0', 
                  fontSize: '12px', 
                  color: 'var(--text-secondary)',
                  textAlign: 'right'
                }}>
                  {Math.round(totales.porcentajeTotal)}% {tipo === 'gasto' 
                    ? t('budget.totalSpent').toLowerCase() 
                    : t('budget.totalEarned').toLowerCase()}
                </p>
              </div>
            )}

         {/* Lista de presupuestos */}
            {datosPresupuesto.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {datosPresupuesto.map((item) => (
                  <div 
                    key={item._id}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--card-item-bg, rgba(14,49,71,.4))',
                      borderRadius: '12px',
                      borderLeft: `4px solid ${item.color}`
                    }}
                  >
                    {/* Categoría y botón eliminar */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontWeight: '700', fontSize: '15px' }}>
                        {getCategoryLabel(item.categoria)}
                      </span>
                      <button
                        onClick={() => openDeleteModal(item)}
                        style={styles.deleteButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        }}
                      >
                        🗑️ {t('common.delete')}
                      </button>
                    </div>

                    {/* Barra de progreso */}
                    <div style={{
                      height: '12px',
                      background: 'var(--progress-bg, rgba(255,255,255,.1))',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        width: `${item.porcentaje}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>

                    {/* Montos y mensaje Quantum */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div>
                        <span style={{ 
                          fontSize: '18px', 
                          fontWeight: '800',
                          color: item.color 
                        }}>
                          {formatCurrency(item.real)}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {' / '}{formatCurrency(item.previsto)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img 
                          src={quantumHead} 
                          alt="Quantum" 
                          style={{ width: '24px', height: '24px' }}
                        />
                        <span style={{ 
                          fontSize: '13px',
                          color: item.color,
                          fontWeight: '600'
                        }}>
                          {item.mensaje}
                        </span>
                      </div>
                    </div>
                
                {/* Diferencia restante */}
                    <p style={{ 
                      margin: '8px 0 0', 
                      fontSize: '12px', 
                      color: item.estado === 'excedido' ? '#EF4444' : 
                             item.estado === 'completado' ? '#38E1FF' : 
                             'var(--text-secondary)'
                    }}>
                      {item.estado === 'completado'
                        ? '✓ ' + (tipo === 'gasto' ? t('budget.totalSpent') : t('budget.totalEarned'))
                        : item.estado === 'excedido'
                          ? `${t('budget.exceededBy')} ${formatCurrency(Math.abs(item.diferencia))}`
                          : `${t('budget.remaining')} ${formatCurrency(item.diferencia)} ${t('budget.left')}`
                      }
                    </p>
                
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ 
                textAlign: 'center', 
                color: 'var(--text-secondary)',
                padding: '20px 0'
              }}>
                {t('budget.noBudgets')}
              </p>
            )}
          {/* Formulario para añadir */}
            {showAddForm ? (
              <form onSubmit={handleAddBudget} style={{ marginTop: '20px' }}>
                <div style={{
                  padding: '16px',
                  background: 'var(--form-bg, rgba(56, 225, 255, 0.1))',
                  borderRadius: '12px',
                  border: '1px solid var(--cyan-accent, rgba(56, 225, 255, 0.3))'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                    
                    {/* Select categoría */}
                    <select
                      value={newBudget.categoria}
                      onChange={(e) => setNewBudget({ 
                        ...newBudget, 
                        categoria: e.target.value,
                        customCategoria: '' 
                      })}
                      style={styles.select}
                      disabled={isSubmitting}
                    >
                      <option value="">{t('budget.selectCategory')}</option>
                      {categoriasDisponibles.map(cat => (
                        <option key={cat.key} value={cat.key}>
                          {cat.emoji} {getCategoryLabel(cat.key)}
                        </option>
                      ))}
                      <option value="custom">➕ {t('budget.customCategory')}</option>
                    </select>

                    {/* Input categoría personalizada */}
                    {newBudget.categoria === 'custom' && (
                      <input
                        type="text"
                        placeholder={t('budget.customPlaceholder')}
                        value={newBudget.customCategoria}
                        onChange={(e) => setNewBudget({ 
                          ...newBudget, 
                          customCategoria: e.target.value 
                        })}
                        style={styles.input}
                        disabled={isSubmitting}
                        autoFocus
                      />
                    )}

                    {/* Input monto */}
                    <input
                      type="number"
                      placeholder={`${t('budget.plannedAmount')} (${getCurrencySymbol()})`}
                      value={newBudget.previsto}
                      onChange={(e) => setNewBudget({ ...newBudget, previsto: e.target.value })}
                      min="0"
                      step="0.01"
                      style={styles.input}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Botones */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--cyan-accent, #38E1FF)',
                        color: '#00222F',
                        fontWeight: '700',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '15px'
                      }}
                    >
                      {isSubmitting ? '...' : `✓ ${t('common.save')}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewBudget({ categoria: '', previsto: '', customCategoria: '' });
                      }}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color, rgba(255,255,255,.2))',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '15px'
                      }}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '2px dashed var(--cyan-accent, rgba(56, 225, 255, 0.4))',
                  background: 'transparent',
                  color: 'var(--cyan-accent)',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {t('budget.addCategory')}
              </button>
            )}
          </div>
        )}
      </div>  

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            style={{ 
              maxWidth: '400px', 
              width: '100%',
              background: 'linear-gradient(160deg, var(--card-bg-start) 0%, var(--card-bg-end) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--border-color, rgba(255,255,255,.1))'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', textAlign: 'center', fontSize: '18px' }}>
              ⚠️ {t('budget.deleteConfirm')}
            </h3>
            <p style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5'
            }}>
              {t('budget.deleteWarning')} <strong style={{ color: 'var(--text-primary)' }}>
                "{getCategoryLabel(budgetToDelete?.categoria)}"
              </strong> {t('budget.willBeDeleted')}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,.2)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#EF4444',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                🗑️ {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BudgetCard;   