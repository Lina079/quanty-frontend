import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function HistorialFiltrado({ type, onDelete, data = [], onTotalChange, formatCurrency }) {
  const [filterType, setFilterType] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configuración según el tipo
  const config = {
    expense: {
      color: '#EF4444',
      emoji: '💸',
      label: 'Gastos'
    },
    income: {
      color: '#10B981',
      emoji: '💰',
      label: 'Ingresos'
    },
    saving: {
      color: '#F59E0B',
      emoji: '🏦',
      label: 'Ahorros'
    },
    investment: {
      color: '#8B5CF6',
      emoji: '📈',
      label: 'Inversiones'
    }
  };

  const currentConfig = config[type];

  // Ordenar transacciones por fecha (más recientes primero)
  const allTransactions = useMemo(() => {
    return [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [data]);

  // Filtrar transacciones según el filtro seleccionado
  const filteredTransactions = useMemo(() => {
    if (allTransactions.length === 0) return [];

    const now = new Date();
    
    return allTransactions.filter(transaction => {
      const date = new Date(transaction.fecha);

      if (filterType === 'day') {
        return date.toDateString() === now.toDateString();
      } else if (filterType === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return date >= startOfWeek && date <= endOfWeek;
      } else if (filterType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        return date.getMonth() === month - 1 && date.getFullYear() === year;
      } else if (filterType === 'year') {
        return date.getFullYear() === now.getFullYear();
      }
      return false;
    });
  }, [allTransactions, filterType, selectedMonth]);

  // Calcular datos del gráfico
  const chartData = useMemo(() => {
    const grouped = {};
    filteredTransactions.forEach(transaction => {
      const categoria = transaction.categoria;
      if (!grouped[categoria]) {
        grouped[categoria] = 0;
      }
      grouped[categoria] += transaction.monto;
    });

    return Object.entries(grouped).map(([name, total]) => ({
      name,
      total: parseFloat(total.toFixed(2))
    }));
  }, [filteredTransactions]);

  // Notificar al padre cuando cambian los totales filtrados
  useEffect(() => {
    const totalFiltered = filteredTransactions.reduce((sum, t) => sum + t.monto, 0);
    if (onTotalChange) {
      onTotalChange(totalFiltered, filteredTransactions.length, filteredTransactions);
    }
  }, [filteredTransactions, onTotalChange]);

  const getCategoriaEmoji = (categoria) => {
    const emojis = {
      'compra': '🛒', 'alquiler': '🏠', 'suministros': '💡',
      'transporte': '🚗', 'gimnasio': '💪', 'salud': '🏥',
      'viajes': '✈️', 'ocio': '🎉', 'otro': '📝',
      'salario': '💼', 'freelance': '💻', 'inversiones': '📊',
      'regalo': '🎁', 'venta': '🏷️', 'hipoteca': '🏠',
      'tarjeta-credito': '💳'
    };
    return emojis[categoria] || currentConfig.emoji;
  };

  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '20px' }}>Historial de {currentConfig.label}</h3>

      {allTransactions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📊</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            No hay {currentConfig.label.toLowerCase()} registrados. ¡Comienza agregando uno!
          </p>
        </div>
      ) : (
        <>
          {/* Botones de filtro */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {['day', 'week', 'month', 'year'].map((filter) => {
                const labels = {
                  day: '📅 Por Día',
                  week: '📅 Por Semana',
                  month: '📆 Por Mes',
                  year: '📊 Por Año'
                };
                return (
                  <button
                    key={filter}
                    className='filter-btn'
                    onClick={() => setFilterType(filter)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: filterType === filter 
                        ? `2px solid ${currentConfig.color}` 
                        : '1px solid rgba(255,255,255,.2)',
                      background: filterType === filter 
                        ? `${currentConfig.color}20` 
                        : 'rgba(14,49,71,.5)',
                      color: filterType === filter ? currentConfig.color : 'var(--text-primary)',
                      fontSize: '15px',
                      fontWeight: filterType === filter ? '700' : '500',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>

            {/* Selector de mes */}
            {filterType === 'month' && (
              <div style={{ 
                marginTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px'
              }}>
                <label style={{ fontSize: '15px', fontWeight: '600' }}>
                  Seleccionar mes:
                </label>
                <input
                  className="month-selector"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: `2px solid ${currentConfig.color}`,
                    background: 'rgba(14,49,71,.5)',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: '600',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    width: '100%',
                    maxWidth: '280px'
                  }}
                />
              </div>
            )}
          </div>

          {/* Gráfica */}
          {chartData.length > 0 ? (
            <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
              <h4 style={{ marginBottom: '12px', textAlign: 'center' }}>
                {filterType === 'day' && 'Hoy'}
                {filterType === 'week' && 'Esta semana'}
                {filterType === 'month' && new Date(selectedMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                {filterType === 'year' && 'Este año'}
              </h4>
              
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                  Total
                </p>
                <p style={{ 
                  fontSize: 'clamp(20px, 5vw, 42px)', 
                  fontWeight: '800', 
                  color: currentConfig.color, 
                  margin: 0 
                }}>
                  {formatCurrency(chartData.reduce((sum, item) => sum + item.total, 0))}
                </p>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 50 : 60}
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={2}
                    dataKey="total"
                    label={!isMobile ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : false}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    wrapperClassName="chart-tooltip"
                    contentStyle={{
                      background: 'linear-gradient(160deg, rgba(14,49,71,.98) 0%, rgba(11,36,54,.98) 100%)',
                      border: '2px solid #2BE3FF',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 8px 24px rgba(43, 227, 255, 0.3)'
                    }}
                    itemStyle={{
                      color: '#2BE3FF',
                      fontWeight: '700',
                      fontSize: '16px'
                    }}
                    labelStyle={{
                      color: '#FFFFFF',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}
                    formatter={(value) => {
                      const total = chartData.reduce((sum, item) => sum + item.total, 0);
                      const percent = ((value / total) * 100).toFixed(1);
                      return [`${formatCurrency(value)} (${percent}%)`];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {isMobile && (
                <div style={{ marginTop: '24px' }}>
                  {chartData.map((item, index) => {
                    const color = colors[index % colors.length];
                    const total = chartData.reduce((sum, i) => sum + i.total, 0);
                    const percent = ((item.total / total) * 100).toFixed(1);

                    return (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          marginBottom: '8px',
                          background: `${color}15`,
                          border: `2px solid ${color}40`,
                          borderRadius: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            background: color,
                            flexShrink: 0
                          }} />
                          <span style={{ 
                            fontWeight: '600', 
                            fontSize: '15px',
                            textTransform: 'capitalize'
                          }}>
                            {item.name}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontWeight: '800', 
                            fontSize: 'clamp(14px, 4vw, 18px)',
                            color: color
                          }}>
                            {formatCurrency(item.total)}
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            color: 'var(--text-secondary)',
                            marginTop: '2px'
                          }}>
                            {percent}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '20px' }}>
              <p style={{ fontSize: '36px', margin: '0 0 12px' }}>📭</p>
              <p style={{ color: 'var(--text-secondary)' }}>
                No hay {currentConfig.label.toLowerCase()} en este período
              </p>
            </div>
          )}

          {/* Lista de transacciones */}
          <div>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <div key={transaction._id} className="card transaction-card" style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ 
                      fontSize: '28px', 
                      textAlign: 'center',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getCategoriaEmoji(transaction.categoria)}
                    </div>
                    <div style={{ flex: '1', minWidth: '150px' }}>
                      <h3 style={{ 
                        marginBottom: '4px', 
                        textTransform: 'capitalize', 
                        fontSize: '18px' 
                      }}>
                        {transaction.categoria}
                      </h3>
                      {transaction.descripcion && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: 'var(--text-secondary)', 
                          margin: '0 0 4px' 
                        }}>
                          {transaction.descripcion}
                        </p>
                      )}
                      <p style={{ 
                        fontSize: '14px', 
                        color: 'var(--text-secondary)', 
                        margin: 0 
                      }}>
                        {new Date(transaction.fecha).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                      <p style={{ 
                        fontSize: '22px', 
                        fontWeight: '800', 
                        color: currentConfig.color, 
                        margin: 0 
                      }}>
                        {formatCurrency(transaction.monto)}
                      </p>
                    </div>
                    <button
                      onClick={() => onDelete(transaction)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#EF4444',
                        fontSize: '20px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '36px', margin: '0 0 12px' }}>📭</p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  No hay {currentConfig.label.toLowerCase()} para mostrar en este período
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default HistorialFiltrado;
