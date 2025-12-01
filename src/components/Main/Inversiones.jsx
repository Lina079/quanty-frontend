import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTransactions } from '../../contexts/TransactionsContext';
import { useToast } from '../../contexts/ToastContext';
import ModalConfirmacion from './components/ModalConfirmacion';
import CardResumen from './components/CardResumen';
import HistorialFiltrado from './components/HistorialFiltrado';
import { getCryptoPrices } from '../../utils/CoinGeckoApi';
import quantumInvest from '../../images/quantum_invest_256x256.png';
import { SP500_PRICE, SP500_CHANGE_PERCENT, ERROR_MESSAGES } from '../../utils/constants';

function Inversiones() {
  const { inversiones, createTransaction, deleteTransaction, isLoading } = useTransactions();
  const { showToast } = useToast();
  const [prices, setPrices] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [inversionAEliminar, setInversionAEliminar] = useState(null);
  const [totalFiltrado, setTotalFiltrado] = useState(null);
  const [cantidadFiltrada, setCantidadFiltrada] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formatCurrency, getCurrencySymbol, currency } = useSettings();
  const { t } = useLanguage();

  // Usar ref para evitar loop infinito
  const inversionesFiltradasRef = useRef([]);

  // Obtener inversiones del contexto
  const inversionesData = inversiones();

  // Form state
  const [formData, setFormData] = useState({
    activo: '',
    cantidad: '',
    precioCompra: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.activo || !formData.cantidad || !formData.precioCompra) {
      showToast((t('form.requiredFields')), 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const cantidad = parseFloat(formData.cantidad);
      const precioCompra = parseFloat(formData.precioCompra);
      const monto = cantidad * precioCompra;

      await createTransaction({
        tipo: 'inversion',
        categoria: formData.activo,
        monto: monto,
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        activo: formData.activo,
        cantidad: cantidad,
        precioCompra: precioCompra
      });

      showToast(t('toast.savedSuccess'), 'success');
      
      setFormData({
        activo: '',
        cantidad: '',
        precioCompra: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al guardar inversión:', error);
      showToast(error || t('toast.errorSaving'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const abrirModalEliminar = (inversion) => {
    setInversionAEliminar(inversion);
    setModalOpen(true);
  };

  const confirmarEliminar = async () => {
    try {
      await deleteTransaction(inversionAEliminar._id);
      showToast(t('toast.deletedSuccess'), 'success');
    } catch (error) {
      console.error('Error al eliminar inversión:', error);
      showToast(error || t('toast.errorDeleting'), 'error');
    } finally {
      setModalOpen(false);
      setInversionAEliminar(null);
    }
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoadingPrices(true);
        const data = await getCryptoPrices(currency);
        setPrices(data);
        setError(null);
      } catch (err) {
        setError(ERROR_MESSAGES.FETCH_PRICES);
        console.error(err);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
  }, [currency]);

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
        name: t('categoryLabels.oro'),
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
    : inversionesData.reduce((sum, inv) => sum + inv.monto, 0);
  const cantidadInversiones = cantidadFiltrada !== null 
    ? cantidadFiltrada 
    : inversionesData.length;

  // Calcular rendimiento usando el ref
  const inversionesConRendimiento = useMemo(() => {
    const inversionesParaCalcular = inversionesFiltradasRef.current.length > 0 
      ? inversionesFiltradasRef.current 
      : inversionesData;
    
    if (!prices || inversionesParaCalcular.length === 0) return [];
    
    return inversionesParaCalcular.map(inversion => {
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
      const activo = inversion.activo || inversion.categoria;
      
      if (activo === 'bitcoin') {
        precioActual = prices.bitcoin.price;
      } else if (activo === 'ethereum') {
        precioActual = prices.ethereum.price;
      } else if (activo === 'oro') {
        precioActual = prices.gold.price;
      } else if (activo === 'sp500') {
        precioActual = SP500_PRICE;
      }

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
  }, [prices, inversionesData]);

  // Callback que no causa re-renders
  const handleTotalChange = useCallback((total, cantidad, filtradas) => {
    setTotalFiltrado(total);
    setCantidadFiltrada(cantidad);
    inversionesFiltradasRef.current = filtradas || [];
  }, []);

  // Calcular totales de rendimiento
  const totalValorActual = inversionesConRendimiento.reduce((sum, inv) => sum + inv.valorActual, 0);
  const totalGanancia = totalValorActual - totalInversiones;
  const porcentajeTotalGanancia = totalInversiones > 0 ? (totalGanancia / totalInversiones) * 100 : 0;

  if (isLoading) {
    return (
      <main className="wrapper">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid rgba(139, 92, 246, 0.2)',
            borderTop: '4px solid #8B5CF6',
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
      <CardResumen 
        tipo="inversiones"
        total={totalInversiones}
        cantidad={cantidadInversiones}
        mensaje={t('investments.quantumMessage')}
        mostrarFormulario={mostrarFormulario}
        onToggleFormulario={() => setMostrarFormulario(!mostrarFormulario)}
        esPeriodoFiltrado={totalFiltrado !== null}
        imagenQuantum={quantumInvest}
        formatCurrency={formatCurrency}
      />
      
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>{t('investments.title')}</h1>

      {/* Formulario */}
      {mostrarFormulario && (
        <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>{t('investments.newInvestment')}</h3>

              {/* Activo */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  {t('investments.asset')} *
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
                  disabled={isSubmitting}
                >
                  <option value="">{t('form.selectAsset')}</option>
                  <option value="bitcoin">₿ Bitcoin</option>
                  <option value="ethereum">Ξ Ethereum</option>
                  <option value="oro">🪙 {t('categoryLabels.oro')}</option>
                  <option value="sp500">📈 S&P 500</option>
                </select>
              </div>

              {/* Cantidad */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  {t('investments.quantity')} *
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
                  disabled={isSubmitting}
                />
              </div>

              {/* Precio de Compra */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  {t('investments.purchasePrice')} ({getCurrencySymbol()}) *
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
                    ? 'rgba(139, 92, 246, 0.5)' 
                    : 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {isSubmitting ? `${t('common.loading')}...` : `💾 ${t('investments.addInvestment')}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {loadingPrices && (
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
            {t('investments.loadingPrices')}
          </p>
        </div>
      )}

      {error && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#EF4444', fontSize: '18px' }}>{error}</p>
        </div>
      )}

      {marketData && !loadingPrices && (
        <>
          {/* Resumen de Rendimiento */}
          {inversionesConRendimiento.length > 0 && (
            <div style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '32px' }}>💎</span>
                  <h2 style={{ margin: 0 }}>{t('investments.performance')}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>{t('investments.totalInvested')}:</p>
                    <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                      {formatCurrency(totalInversiones)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>{t('investments.currentValue')}</p>
                    <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                      {formatCurrency(totalValorActual)}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>{t('investments.gainLoss')}</p>
                    <p style={{ 
                      fontSize: '28px', 
                      fontWeight: '800', 
                      color: totalGanancia >= 0 ? '#4ADE80' : '#EF4444',
                      margin: 0
                    }}>
                      {totalGanancia >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalGanancia))}
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
              <div>{t('investments.asset')}</div>
              <div>{t('investments.currentPrice')}</div>
              <div>{t('investments.variation24h')}</div>
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
                    {formatCurrency(asset.price)}
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
                      <span style={{ color: 'var(--text-secondary)' }}>{t('investments.currentPrice')}:</span>
                      <span style={{ fontWeight: '600', color: 'var(--cyan-accent)' }}>
                        {formatCurrency(asset.price)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{t('investments.variation24h')}:</span>
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
            data={inversionesData}
            onTotalChange={handleTotalChange}
            formatCurrency={formatCurrency}
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
              📊 {t('investments.marketDataBy')}{' '}
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
              {t('investments.referenceValue')}
            </p>
          </div>
        </>
      )}

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        mensaje={t('modal.permanentDelete')}
      />
    </main>
  );
}

export default Inversiones;