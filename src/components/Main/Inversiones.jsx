import { useState, useEffect, useMemo, useCallback } from 'react';
import ModalConfirmacion from './components/ModalConfirmacion';
import CardResumen from './components/CardResumen';
import HistorialFiltrado from './components/HistorialFiltrado';
import { getCryptoPrices } from '../../utils/CoinGeckoApi';
import quantumInvest from '../../images/quantum_invest_256x256.png';
import { SP500_PRICE, SP500_CHANGE_PERCENT, ERROR_MESSAGES } from '../../utils/constants';

function Inversiones() {
  const [prices, setPrices] = useState(null);
  const [inversiones, setInversiones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [inversionAEliminar, setInversionAEliminar] = useState(null);
  const [totalFiltrado, setTotalFiltrado] = useState(null);
  const [cantidadFiltrada, setCantidadFiltrada] = useState(null);
  const [inversionesFiltradas, setInversionesFiltradas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    activo: '',
    cantidad: '',
    precioCompra: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const cargarInversiones = () => {
    const inversionesGuardadas = JSON.parse(localStorage.getItem('inversiones') || '[]');
    const inversionesOrdenadas = inversionesGuardadas.sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    setInversiones(inversionesOrdenadas);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.activo || !formData.cantidad || !formData.precioCompra) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    // Calcular monto invertido = cantidad × precio de compra
    const cantidad = parseFloat(formData.cantidad);
    const precioCompra = parseFloat(formData.precioCompra);
    const monto = cantidad * precioCompra;

    const inversionesGuardadas = JSON.parse(localStorage.getItem('inversiones') || '[]');
    const nuevaInversion = {
      id: Date.now(),
      activo: formData.activo,
      categoria: formData.activo,
      tipo: 'inversion',
      cantidad: cantidad,
      precioCompra: precioCompra,
      monto: monto,
      descripcion: formData.descripcion,
      fecha: formData.fecha
    };

    inversionesGuardadas.push(nuevaInversion);
    localStorage.setItem('inversiones', JSON.stringify(inversionesGuardadas));
    
    setFormData({
      activo: '',
      cantidad: '',
      precioCompra: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setMostrarFormulario(false);
    cargarInversiones();
  };

  const abrirModalEliminar = (inversion) => {
    setInversionAEliminar(inversion);
    setModalOpen(true);
  };

  const confirmarEliminar = () => {
    const inversionesActualizadas = inversiones.filter(i => i.id !== inversionAEliminar.id);
    localStorage.setItem('inversiones', JSON.stringify(inversionesActualizadas));
    setInversiones(inversionesActualizadas);
    setModalOpen(false);
    setInversionAEliminar(null);
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const data = await getCryptoPrices();
        setPrices(data);
        setError(null);
      } catch (err) {
        setError(ERROR_MESSAGES.FETCH_PRICES);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  useEffect(() => {
    cargarInversiones();
  }, []);

  const getMarketData = () => {
    if (!prices) return null;

    return [
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        price: prices.bitcoin.price,
        change: prices.bitcoin.change24h,
        icon: '₿'
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        price: prices.ethereum.price,
        change: prices.ethereum.change24h,
        icon: 'Ξ'
      },
      {
        name: 'Oro',
        symbol: 'GOLD',
        price: prices.gold.price,
        change: prices.gold.change24h,
        icon: '🪙'
      },
      {
        name: 'S&P 500',
        symbol: 'SP500',
        price: SP500_PRICE,
        change: SP500_CHANGE_PERCENT * 100,
        icon: '📈'
      }
    ];
  };

  const marketData = prices ? getMarketData() : null;

  const totalInversiones = totalFiltrado !== null 
    ? totalFiltrado 
    : inversiones.reduce((sum, inv) => sum + inv.monto, 0);
  const cantidadInversiones = cantidadFiltrada !== null 
    ? cantidadFiltrada 
    : inversiones.length;

  // Calcular rendimiento de todas las inversiones (memorizado para evitar loops)
  const inversionesConRendimiento = useMemo(() => {
    // Usar inversiones filtradas si existen, si no, usar todas
    const inversionesParaCalcular = inversionesFiltradas !== null ? inversionesFiltradas : inversiones;
    
    if (!prices || inversionesParaCalcular.length === 0) return [];
    
    return inversionesParaCalcular.map(inversion => {
      // Si la inversión no tiene precioCompra o cantidad, no podemos calcular rendimiento
      if (!inversion.precioCompra || !inversion.cantidad) {
        return {
          ...inversion,
          precioActual: 0,
          valorActual: inversion.monto,
          ganancia: 0,
          porcentajeGanancia: 0,
          sinDatos: true
        };
      }

      let precioActual = 0;
      
      // Obtener precio actual según el activo
      if (inversion.activo === 'bitcoin') {
        precioActual = prices.bitcoin.price;
      } else if (inversion.activo === 'ethereum') {
        precioActual = prices.ethereum.price;
      } else if (inversion.activo === 'oro') {
        precioActual = prices.gold.price;
      } else if (inversion.activo === 'sp500') {
        precioActual = SP500_PRICE;
      }

      // Calcular valores
      const valorActual = inversion.cantidad * precioActual;
      const ganancia = valorActual - inversion.monto;
      const porcentajeGanancia = inversion.monto > 0 ? (ganancia / inversion.monto) * 100 : 0;

      return {
        ...inversion,
        precioActual,
        valorActual,
        ganancia,
        porcentajeGanancia
      };
    });
  }, [prices, inversiones, inversionesFiltradas]);

  // Callback memorizado para evitar re-renders innecesarios
  const handleTotalChange = useCallback((total, cantidad, filtradas) => {
    setTotalFiltrado(total);
    setCantidadFiltrada(cantidad);
    setInversionesFiltradas(filtradas);
  }, []);

  // Calcular totales de rendimiento
  const totalValorActual = inversionesConRendimiento.reduce((sum, inv) => sum + inv.valorActual, 0);
  const totalGanancia = totalValorActual - totalInversiones;
  const porcentajeTotalGanancia = totalInversiones > 0 ? (totalGanancia / totalInversiones) * 100 : 0;

  return (
    <main className="wrapper">
      <CardResumen 
        tipo="inversiones"
        total={totalInversiones}
        cantidad={cantidadInversiones}
        mensaje="Diversificar es multiplicar posibilidades 🌍✨"
        mostrarFormulario={mostrarFormulario}
        onToggleFormulario={() => setMostrarFormulario(!mostrarFormulario)}
        esPeriodoFiltrado={totalFiltrado !== null}
        imagenQuantum={quantumInvest}
      />
      
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Precios en Tiempo Real</h1>

      {/* Formulario (condicional) */}
      {mostrarFormulario && (
        <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Nueva Inversión</h3>

              {/* Activo */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Activo *
                </label>
                <select
                  value={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.value })}
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
                >
                  <option value="">Selecciona un activo</option>
                  <option value="bitcoin">₿ Bitcoin</option>
                  <option value="ethereum">Ξ Ethereum</option>
                  <option value="oro">🪙 Oro</option>
                  <option value="sp500">📈 S&P 500</option>
                </select>
              </div>

              {/* Cantidad */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Cantidad *
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  placeholder="Ej: 0.5 BTC"
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
                />
              </div>

              {/* Precio de Compra */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Precio de Compra (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precioCompra}
                  onChange={(e) => setFormData({ ...formData, precioCompra: e.target.value })}
                  placeholder="Ej: 50000"
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
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                💾 Guardar Inversión
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
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
            Cargando precios en tiempo real...
          </p>
        </div>
      )}

      {error && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#EF4444', fontSize: '18px' }}>{error}</p>
        </div>
      )}

      {marketData && !loading && (
        <>
          {/* Resumen de Rendimiento */}
          {inversionesConRendimiento.length > 0 && (
            <div style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px' }}>💎</span>
                  <h2 style={{ margin: 0 }}>Rendimiento de tus Inversiones</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Total invertido:</p>
                    <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                      €{totalInversiones.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Valor actual:</p>
                    <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                      €{totalValorActual.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Ganancia/Pérdida:</p>
                    <p style={{ 
                      fontSize: '28px', 
                      fontWeight: '800', 
                      color: totalGanancia >= 0 ? '#4ADE80' : '#EF4444',
                      margin: 0
                    }}>
                      {totalGanancia >= 0 ? '+' : ''}€{totalGanancia.toFixed(2)}
                    </p>
                    <p style={{ 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      color: totalGanancia >= 0 ? '#4ADE80' : '#EF4444',
                      margin: '4px 0 0'
                    }}>
                      ({totalGanancia >= 0 ? '+' : ''}{porcentajeTotalGanancia.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
      
          {/* Tabla de precios en tiempo real */}
          <div style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
            {/* Cabecera - Solo desktop */}
            <div 
              className="investments-header"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr', 
                gap: '16px',
                padding: '16px',
                borderBottom: '1px solid rgba(255,255,255,.1)',
                fontWeight: '700',
                color: 'var(--text-secondary)'
              }}>
              <div>Activo</div>
              <div>Precio actual</div>
              <div>Variación 24h</div>
            </div>

            {marketData.map((asset, index) => (
              <div key={index} className="card investment-card" style={{ marginBottom: '12px' }}>
                {/* Desktop layout */}
                <div 
                  className="investment-row-desktop"
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr', 
                    gap: '16px',
                    alignItems: 'center'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{asset.icon}</span>
                    <span style={{ fontWeight: '700' }}>{asset.name}</span>
                  </div>
                  <div style={{ fontWeight: '600', color: 'var(--cyan-accent)' }}>
                    €{asset.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ 
                    color: asset.change >= 0 ? '#4ADE80' : '#EF4444',
                    fontWeight: '700'
                  }}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="investment-row-mobile" style={{ display: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '32px' }}>{asset.icon}</span>
                    <span style={{ fontWeight: '700', fontSize: '20px' }}>{asset.name}</span>
                  </div>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Precio actual:</span>
                      <span style={{ fontWeight: '600', color: 'var(--cyan-accent)' }}>
                        €{asset.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Variación 24h:</span>
                      <span style={{ 
                        fontWeight: '700',
                        fontSize: '18px',
                        color: asset.change >= 0 ? '#4ADE80' : '#EF4444'
                      }}>
                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Historial con gráfica */}
          <HistorialFiltrado 
            type="investment" 
            onDelete={abrirModalEliminar}
            data={inversiones}
            onTotalChange={handleTotalChange}
          />

          {/* Disclaimer de CoinGecko */}
          <div style={{ 
            maxWidth: '800px',
            margin: '40px auto 0',
            padding: '24px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              lineHeight: '1.6'
            }}>
              📊 Datos de mercado en tiempo real proporcionados por{' '}
              <a 
                href="https://www.coingecko.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'var(--cyan-accent)', 
                  textDecoration: 'none',
                  fontWeight: '700'
                }}
              >
                CoinGecko API
              </a>
            </p>
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)',
              margin: 0,
              opacity: 0.7
            }}>
              S&P 500 es un valor de referencia
            </p>
          </div>
        </>
      )}

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        mensaje="Esta inversión se eliminará permanentemente."
      />
    </main>
  );
}

export default Inversiones;