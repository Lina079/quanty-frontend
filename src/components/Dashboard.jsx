import { useNavigate } from 'react-router-dom';
import { useState, useContext, useMemo } from 'react';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTransactions } from '../contexts/TransactionsContext';
import quantumImg from '../images/Quantum-allBody.png';
import quantumImgLight from '../images/theme-light-images/quantum-fullbody-theme-light.png';
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

    const totalIngresos = ingresosFiltrados.reduce((sum, i) => sum + i.monto, 0);
    const totalGastos = gastosFiltrados.reduce((sum, g) => sum + g.monto, 0);
    const totalAhorros = ahorrosFiltrados.reduce((sum, a) => sum + a.monto, 0);
    const totalInversiones = inversionesFiltradas.reduce((sum, inv) => sum + inv.monto, 0);

    // Balance disponible = Ingresos - Gastos - Ahorros - Inversiones
    const disponible = totalIngresos - totalGastos - totalAhorros - totalInversiones;

    return {
      gastos: { monto: totalGastos },
      ingresos: { monto: totalIngresos },
      ahorro: { monto: totalAhorros },
      inversion: { monto: totalInversiones },
      disponible: disponible 
    };
    }, [gastos, ingresos, ahorros, inversiones, periodo]);

    // Obtener mensajes y color de Quantum según el balance disponible
    const getQuantumMessage = () => {
      const disponible = financialData.disponible;

      if (disponible > 0) {
        return {
          color: '#4ADE80', // Verde
          mensaje: t('dashboard.balancePositive'),
          balance: `+${formatCurrency(disponible)}`
        };
      } else if (disponible === 0) {
        return {
          color: '#FBBF24', // Amarillo
          mensaje: t('dashboard.balanceZero'),
          balance: formatCurrency(0)
        };
      } else {
        return {
          color: '#EF4444', // Rojo
          mensaje: t('dashboard.balanceNegative'),
          balance: formatCurrency(disponible)
        };
      }
    };

    const quantumData = getQuantumMessage();

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
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto 32px auto'
      }}>
      {/* Título de bienvenida */}
      <h1 style={{ margin: '0 0 20px', fontSize: '28px' }}>
        {t('dashboard.welcome')}, {currentUser?.name || t('common.user')}
      </h1>

      {/* Tarjeta de Balance - Estilo Kakeibo */}
      <div className="kakeibo-balance-box" style={{
        background:'linear-gradient(160deg, var(--card-bg-start) 0%, var(--card-bg-end) 100%)',
        border: '1px solid rgba(255,255,255,.1)',
        borderRadius: '20px',
        padding: '20px 24px',
        marginBottom: '12px',
        width: '100%',
        maxWidth: '800px'
      }}>
        {/* Trabajando para ti (Ahorro + Inversión) */}
      <div style={{ marginBottom: '16px' }}>
      <p style={{ 
        margin: 0, 
        fontSize: '14px', 
        color: 'var(--text-secondary)' 
      }}>
         {t('dashboard.workingForYou')} 🌱
      </p>
      <p style={{ 
        margin: '4px 0 0', 
        fontSize: '24px', 
        fontWeight: '800',
        color: '#4ADE80'
      }}>
        {formatCurrency(financialData.ahorro.monto + financialData.inversion.monto)}
      </p>
      <p style={{ 
        margin: '4px 0 0', 
        fontSize: '12px', 
        color: 'var(--text-secondary)' 
      }}>
        ({t('nav.savings')} {formatCurrency(financialData.ahorro.monto)} + {t('nav.investments')} {formatCurrency(financialData.inversion.monto)})
      </p>
    </div>

        {/* Separador */}
      <div style={{ 
        borderTop: '1px solid rgba(255,255,255,.1)', 
        margin: '16px 0' 
        }}></div>

        {/* Libre para gastar */}
      <div>
      <p style={{ 
        margin: 0, 
        fontSize: '14px', 
        color: 'var(--text-secondary)' 
      }}>
         {t('dashboard.freeToSpend')} 💳
      </p>
      <p style={{ 
        margin: '4px 0 0', 
        fontSize: '28px', 
        fontWeight: '800',
        color: quantumData.color
      }}>
        {quantumData.balance}
      </p>
      <p style={{ 
        margin: '8px 0 0', 
        fontSize: '14px', 
        color: 'var(--text-secondary)' 
      }}>
        {quantumData.mensaje}
      </p>
      </div>
      </div>
    
        {/* Quantum flotante */}
        <img 
        src={theme === 'light' ? quantumImgLight : quantumImg} 
        alt="Quantum - Tu asistente financiero"
        style={{ 
        width: '120px', 
        height: '120px',
        animation: 'float 3s ease-in-out infinite'
        }}
        />
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