import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function HistorialFiltrado({ type, onDelete, data, onTotalChange }) {
  const [filterType, setFilterType] = useState('month'); // 'day', 'week', 'month', 'year'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
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
      storageKey: 'gastos',
      color: '#EF4444',
      emoji: '💸',
      label: 'Gastos'
    },
    income: {
      storageKey: 'ingresos',
      color: '#10B981',
      emoji: '💰',
      label: 'Ingresos'
    },
    saving: {
      storageKey: 'ahorros',
      color: '#F59E0B',
      emoji: '🏦',
      label: 'Ahorros'
    },
    investment: {
      storageKey: 'inversiones',
      color: '#8B5CF6',
      emoji: '📈',
      label: 'Inversiones'
    }
  };

  const currentConfig = config[type];

  // Cargar todas las transacciones cuando cambia data
  useEffect(() => {
    if (data) {
      const sorted = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setAllTransactions(sorted);
    }
  }, [data]);

  // Filtrar transacciones cuando cambia el filtro o las transacciones
  useEffect(() => {
    if (allTransactions.length === 0) {
      setFilteredTransactions([]);
      setChartData([]);
      return;
    }

    const now = new Date();
    const filtered = allTransactions.filter(transaction => {
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
        return date.getMonth() === month - 1 && 
               date.getFullYear() === year;
      } else if (filterType === 'year') {
        return date.getFullYear() === now.getFullYear();
      }
      return false;
    });

    setFilteredTransactions(filtered);

    const grouped = {};
    filtered.forEach(transaction => {
      const categoria = transaction.categoria;
      if (!grouped[categoria]) {
        grouped[categoria] = 0;
      }
      grouped[categoria] += transaction.monto;
    });

    const chartArray = Object.entries(grouped).map(([name, total]) => ({
      name,
      total: parseFloat(total.toFixed(2))
    }));

    setChartData(chartArray);

    // Notificar al componente padre el total filtrado y las transacciones filtradas
    const totalFiltered = filtered.reduce((sum, t) => sum + t.monto, 0);
    if (onTotalChange) {
      onTotalChange(totalFiltered, filtered.length, filtered); // AGREGAMOS: filtered
    }
  }, [allTransactions, filterType, selectedMonth, onTotalChange]);

  const getCategoriaEmoji = (categoria) => {
    const emojis = {
      'compra': '🛒', 'alquiler': '🏠', 'suministros': '💡',
      'transporte': '🚗', 'gimnasio': '💪', 'salud': '🏥',
      'viajes': '✈️', 'ocio': '🎉', 'otro': '📝',
      'salario': '💼', 'freelance': '💻', 'inversiones': '📊',
      'regalo': '🎁', 'venta': '🏷️'
    };
    return emojis[categoria] || currentConfig.emoji;
  };

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
              <button
                onClick={() => setFilterType('day')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: filterType === 'day' 
                    ? `2px solid ${currentConfig.color}` 
                    : '1px solid rgba(255,255,255,.2)',
                  background: filterType === 'day' 
                    ? `${currentConfig.color}20` 
                    : 'rgba(14,49,71,.5)',
                  color: filterType === 'day' ? currentConfig.color : 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: filterType === 'day' ? '700' : '500',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                📅 Por Día
              </button>
              <button
                onClick={() => setFilterType('week')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: filterType === 'week' 
                    ? `2px solid ${currentConfig.color}` 
                    : '1px solid rgba(255,255,255,.2)',
                  background: filterType === 'week' 
                    ? `${currentConfig.color}20` 
                    : 'rgba(14,49,71,.5)',
                  color: filterType === 'week' ? currentConfig.color : 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: filterType === 'week' ? '700' : '500',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                📅 Por Semana
              </button>
              <button
                onClick={() => setFilterType('month')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: filterType === 'month' 
                    ? `2px solid ${currentConfig.color}` 
                    : '1px solid rgba(255,255,255,.2)',
                  background: filterType === 'month' 
                    ? `${currentConfig.color}20` 
                    : 'rgba(14,49,71,.5)',
                  color: filterType === 'month' ? currentConfig.color : 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: filterType === 'month' ? '700' : '500',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                📆 Por Mes
              </button>
              <button
                onClick={() => setFilterType('year')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: filterType === 'year' 
                    ? `2px solid ${currentConfig.color}` 
                    : '1px solid rgba(255,255,255,.2)',
                  background: filterType === 'year' 
                    ? `${currentConfig.color}20` 
                    : 'rgba(14,49,71,.5)',
                  color: filterType === 'year' ? currentConfig.color : 'var(--text-primary)',
                  fontSize: '15px',
                  fontWeight: filterType === 'year' ? '700' : '500',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                📊 Por Año
              </button>
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
                  fontSize: '42px', 
                  fontWeight: '800', 
                  color: currentConfig.color, 
                  margin: 0 
                }}>
                  €{chartData.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
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
                    {chartData.map((entry, index) => {
                      const colors = [
                        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
                        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
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
                    formatter={(value, name, props) => {
                      const total = chartData.reduce((sum, item) => sum + item.total, 0);
                      const percent = ((value / total) * 100).toFixed(1);
                      return [`€${value.toFixed(2)} (${percent}%)`, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {isMobile && (
                <div style={{ marginTop: '24px' }}>
                  {chartData.map((item, index) => {
                    const colors = [
                      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
                      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
                    ];
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
                            fontSize: '18px',
                            color: color
                          }}>
                            €{item.total.toFixed(2)}
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
                <div key={transaction.id} className="card transaction-card" style={{ marginBottom: '12px' }}>
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
        €{transaction.monto.toFixed(2)}
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