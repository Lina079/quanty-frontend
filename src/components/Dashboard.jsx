import { useNavigate } from 'react-router-dom';
import { useState, useContext, useMemo } from 'react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTransactions } from '../contexts/TransactionsContext';
import quantumImg from '../images/quantum_half_fade_256x256.png';
import quantumImgLight from '../images/theme-light-images/quantum-halfbody2-light.png';
import iconoGastos from '../images/Icono_caja_gastos.png';
import iconoIngresos from '../images/ingresos_moneda_256x256.png';
import iconoAhorro from '../images/ahorro_caja_fuerte_256x256.png';
import iconoInversion from '../images/inversion_planta_256x256.png';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useContext(CurrentUserContext);
  const { formatCurrency, theme } = useSettings();
  const { t } = useLanguage();
  const { gastos, ingresos, ahorros, inversiones, isLoading } = useTransactions();
  const [periodo, setPeriodo] = useState('mes');

  // Función para filtrar transacciones por período
  const filtrarPorPeriodo = (transacciones) => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    return transacciones.filter(transaccion => {
      const fecha = new Date(transaccion.fecha);
      
      if (periodo === 'mes') {
        return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
      } else {
        return fecha.getFullYear() === añoActual;
      }
    });
  };

  // Calcular totales desde el contexto
  const financialData = useMemo(() => {
    const gastosFiltrados = filtrarPorPeriodo(gastos());
    const ingresosFiltrados = filtrarPorPeriodo(ingresos());
    const ahorrosFiltrados = filtrarPorPeriodo(ahorros());
    const inversionesFiltradas = filtrarPorPeriodo(inversiones());

    return {
      gastos: { 
        monto: gastosFiltrados.reduce((sum, g) => sum + g.monto, 0)
      },
      ingresos: { 
        monto: ingresosFiltrados.reduce((sum, i) => sum + i.monto, 0)
      },
      ahorro: { 
        monto: ahorrosFiltrados.reduce((sum, a) => sum + a.monto, 0)
      },
      inversion: { 
        monto: inversionesFiltradas.reduce((sum, inv) => sum + inv.monto, 0)
      }
    };
  }, [gastos, ingresos, ahorros, inversiones, periodo]);

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
      {/* Quantum + Mensaje */}
      <div className="dashboard-welcome" style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        maxWidth: '760px',
        margin: '0 auto 20px auto'
      }}>
        <div style={{ 
          flexShrink: 0,
          width: '100px'
        }}>
          <img 
            src={theme === 'light' ? quantumImgLight : quantumImg} 
            alt="Quantum - Tu asistente financiero"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 12px', fontSize: '28px' }}>
            {t('dashboard.welcome')}, {currentUser?.name || t('common.user')}
          </h1>
          <p className="subtitle" style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>
            {t('dashboard.subtitle')} ✨
          </p>
        </div>
      </div>
      
      {/* Selector de período */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        marginBottom: '16px'
      }}>
        <button
          className="periodo-btn"
          onClick={() => setPeriodo('mes')}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            border: periodo === 'mes' 
              ? '2px solid var(--cyan-accent)' 
              : '1px solid rgba(255,255,255,.2)',
            background: periodo === 'mes' 
              ? 'rgba(56, 225, 255, 0.2)' 
              : 'rgba(14,49,71,.5)',
            color: periodo === 'mes' ? 'var(--cyan-accent)' : 'var(--text-primary)',
            fontSize: '15px',
            fontWeight: periodo === 'mes' ? '700' : '500',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s'
          }}
        >
          📅 {t('dashboard.currentMonth')}
        </button>
        
        <button
          className="periodo-btn"
          onClick={() => setPeriodo('año')}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            border: periodo === 'año' 
              ? '2px solid var(--cyan-accent)' 
              : '1px solid rgba(255,255,255,.2)',
            background: periodo === 'año' 
              ? 'rgba(56, 225, 255, 0.2)' 
              : 'rgba(14,49,71,.5)',
            color: periodo === 'año' ? 'var(--cyan-accent)' : 'var(--text-primary)',
            fontSize: '15px',
            fontWeight: periodo === 'año' ? '700' : '500',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s'
          }}
        >
          📊 {t('dashboard.currentYear')}
        </button>
      </div>

      {/* Botón FAB */}
      <button 
        className="fab" 
        aria-label="Ver transacciones"
        onClick={() => navigate('/transacciones')}
      >
        +
      </button>

      {/* Grid de 4 tarjetas */}
      <section className="cards">
        {/* Card Ingresos */}
        <div 
          className="card"
          onClick={() => navigate('/ingresos')}
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          <div className="card__icon">
            <img src={iconoIngresos} alt="Ingresos" />
          </div>
          <h3>{t('dashboard.income')}</h3>
          <p style={{ fontSize: 'clamp(18px, 5vw, 32px)', fontWeight: '800', color: 'var(--cyan-accent)', marginTop: '12px' }}>
            {formatCurrency(financialData.ingresos.monto)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            👉 {t('dashboard.clickToManage')}
          </p>
        </div>

        {/* Card Inversión */}
        <div 
          className="card" 
          onClick={() => navigate('/inversiones')}
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          <div className="card__icon">
            <img src={iconoInversion} alt="Inversión" />
          </div>
          <h3>{t('dashboard.investment')}</h3>
          <p style={{ fontSize: 'clamp(18px, 5vw, 32px)', fontWeight: '800', color: '#8B5CF6', marginTop: '12px' }}>
            {formatCurrency(financialData.inversion.monto)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            👉 {t('dashboard.clickToManage')}
          </p>
        </div>

        {/* Card Gastos */}
        <div 
          className="card"
          onClick={() => navigate('/gastos')}
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          <div className="card__icon">
            <img src={iconoGastos} alt="Gastos" />
          </div>
          <h3>{t('dashboard.expenses')}</h3>
          <p style={{ fontSize: 'clamp(18px, 5vw, 32px)', fontWeight: '800', color: '#EF4444', marginTop: '12px' }}>
            {formatCurrency(financialData.gastos.monto)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            👉 {t('dashboard.clickToManage')}
          </p>
        </div>      

        {/* Card Ahorro */}
        <div 
          className="card"
          onClick={() => navigate('/ahorros')}
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          <div className="card__icon">
            <img src={iconoAhorro} alt="Ahorro" />
          </div>
          <h3>{t('dashboard.savings')}</h3>
          <p style={{ fontSize: 'clamp(18px, 5vw, 32px)', fontWeight: '800', color: 'var(--cyan-accent)', marginTop: '12px' }}>
            {formatCurrency(financialData.ahorro.monto)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            👉 {t('dashboard.clickToManage')}
          </p>
        </div> 
      </section>
    </main>
  );
}

export default Dashboard;