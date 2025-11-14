import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCryptoPrices } from '../utils/CoinGeckoApi';
import quantumInvest from '../images/quantum_invest_256x256.png';
import { INITIAL_PORTFOLIO, SP500_PRICE, SP500_CHANGE_PERCENT, CHART_COLORS, ERROR_MESSAGES } from '../utils/constants';

function Inversiones() {
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Portfolio hardcodeado (cuánto invertiste)
  const portfolio = INITIAL_PORTFOLIO;

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

  // Calcular valores actuales y rendimiento
  const calculatePortfolio = () => {
    if (!prices) return null;

    const btcChange = prices.bitcoin.change24h / 100;
    const ethChange = prices.ethereum.change24h / 100;
    const goldChange = prices.gold.change24h / 100;
    const sp500Change = SP500_CHANGE_PERCENT; // Hardcodeado +1.2%

    const btcValue = portfolio.bitcoin * (1 + btcChange);
    const ethValue = portfolio.ethereum * (1 + ethChange);
    const goldValue = portfolio.gold * (1 + goldChange);
    const sp500Value = portfolio.sp500 * (1 + sp500Change);

    const totalInvested = portfolio.bitcoin + portfolio.ethereum + portfolio.gold + portfolio.sp500;
    const totalCurrent = btcValue + ethValue + goldValue + sp500Value;
    const totalGain = totalCurrent - totalInvested;
    const totalGainPercent = ((totalGain / totalInvested) * 100);

    return {
      totalInvested,
      totalCurrent,
      totalGain,
      totalGainPercent,
      assets: [
    {
      name: 'BTC',
      invested: portfolio.bitcoin,
      current: btcValue,
      change: prices.bitcoin.change24h,
      price: prices.bitcoin.price,
      icon: '₿'
    },
    {
      name: 'ETH',
      invested: portfolio.ethereum,
      current: ethValue,
      change: prices.ethereum.change24h,
      price: prices.ethereum.price,
      icon: 'Ξ'
    },
    {
      name: 'ORO',
      invested: portfolio.gold,
      current: goldValue,
      change: prices.gold.change24h,
      price: prices.gold.price,
      icon: '🪙'
    },
    {
      name: 'S&P 500',
      invested: portfolio.sp500,
      current: sp500Value,
      change: sp500Change * 100,
      price: SP500_PRICE, // Hardcoded
      icon: '📈'
    }
      ]
    };
  };

  const portfolioData = prices ? calculatePortfolio() : null;

  // Datos para la gráfica
  const chartData = portfolioData ? portfolioData.assets.map(asset => ({
    name: asset.name,
    rendimiento: asset.change
  })) : [];

  const getBarColor = (value) => {
    if (value >= 10) return CHART_COLORS.GOLD;
    if (value >= 5) return CHART_COLORS.CYAN;
    if (value >= 0) return CHART_COLORS.GREEN;
    return CHART_COLORS.RED;
  };

  return (
    <main className="wrapper">
      {/* Quantum + Mensaje */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        marginBottom: '32px',
        background: 'linear-gradient(160deg, rgba(14,49,71,.85) 0%, rgba(11,36,54,.85) 100%)',
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,.08)'
      }}>
        <img src={quantumInvest} alt="Quantum" style={{ width: '80px', height: '80px' }} />
        <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
          Diversificar es multiplicar posibilidades 🌍✨
        </p>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Tus inversiones</h1>

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
            Cargando tu portfolio...
          </p>
        </div>
      )}

      {error && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#EF4444', fontSize: '18px' }}>{error}</p>
        </div>
      )}

      {portfolioData && !loading && (
        <>
          {/* Balance General */}
          <div className="card" style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '32px' }}>💰</span>
              <h2 style={{ margin: 0 }}>Balance General</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Invertido total:</p>
                <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                  €{portfolioData.totalInvested}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Valor actual:</p>
                <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                  €{portfolioData.totalCurrent.toFixed(0)}
                </p>
              </div>
            </div>

            <div style={{ 
              marginTop: '20px', 
              paddingTop: '20px', 
              borderTop: '1px solid rgba(255,255,255,.1)' 
            }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Resultado:</p>
              <p style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: portfolioData.totalGain >= 0 ? '#4ADE80' : '#EF4444',
                margin: 0
              }}>
                {portfolioData.totalGain >= 0 ? '+' : ''}€{portfolioData.totalGain.toFixed(0)} 
                ({portfolioData.totalGain >= 0 ? '+' : ''}{portfolioData.totalGainPercent.toFixed(1)}%)
              </p>
            </div>
          </div>

          {/* Gráfica de Barras */}
          <div style={{ maxWidth: '800px', margin: '0 auto 40px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(11, 36, 54, 0.95)', 
                    border: '1px solid rgba(255,255,255,.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `${value.toFixed(2)}%`}
                />
                <Bar dataKey="rendimiento" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rendimiento)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

    {/* Tabla de activos */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Cabecera - Solo desktop */}
      <div 
        className="investments-header"
        style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
        gap: '16px',
        padding: '16px',
        borderBottom: '1px solid rgba(255,255,255,.1)',
        fontWeight: '700',
        color: 'var(--text-secondary)'
        }}>
      <div>Activo</div>
      <div>Precio actual</div>
      <div>Invertido</div>
      <div>Valor</div>
      <div>Variación</div>
    </div>

      {portfolioData.assets.map((asset, index) => (
        <div key={index} className="card investment-card" style={{ marginBottom: '12px' }}>
          {/* Desktop layout */}
        <div 
          className="investment-row-desktop"
          style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
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
        <div>€{asset.invested}</div>
        <div>€{asset.current.toFixed(0)}</div>
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Invertido:</span>
            <span style={{ fontWeight: '600' }}>€{asset.invested}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Valor actual:</span>
            <span style={{ fontWeight: '600' }}>€{asset.current.toFixed(0)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Variación:</span>
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
    </main>
  );
}

export default Inversiones;