import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import quantumImg from '../images/quantum_half_fade_256x256.png';
import iconoGastos from '../images/Icono_caja_gastos.png';
import iconoIngresos from '../images/ingresos_moneda_256x256.png';
import iconoAhorro from '../images/ahorro_caja_fuerte_256x256.png';
import iconoInversion from '../images/inversion_planta_256x256.png';

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Marí Carmen");
  const [periodo, setPeriodo] = useState('mes'); // 'mes' o 'año'
  
  // Cargar nombre desde localStorage y escuchar cambios
useEffect(() => {
  const nombreGuardado = localStorage.getItem('userName');
  if (nombreGuardado) {
    setUserName(nombreGuardado);
  }

  // Escuchar cambios de nombre desde otros componentes
  const handleUserNameChange = () => {
    const nuevoNombre = localStorage.getItem('userName');
    if (nuevoNombre) {
      setUserName(nuevoNombre);
    }
  };

  window.addEventListener('userNameChanged', handleUserNameChange);

  // Cleanup al desmontar componente
  return () => {
    window.removeEventListener('userNameChanged', handleUserNameChange);
  };
}, []);

  // Función para filtrar transacciones por período
  const filtrarPorPeriodo = (transacciones) => {
  const ahora = new Date();
  const mesActual = ahora.getMonth(); // 0-11
  const añoActual = ahora.getFullYear();

  return transacciones.filter(transaccion => {
    const fecha = new Date(transaccion.fecha);
    
    if (periodo === 'mes') {
      // Filtrar por mes y año actual
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    } else {
      // Filtrar solo por año actual
      return fecha.getFullYear() === añoActual;
    }
  });
};

  // Calcular totales dinámicos desde localStorage
  const calcularTotalGastos = () => {
  const gastosGuardados = JSON.parse(localStorage.getItem('gastos') || '[]');
  const gastosFiltrados = filtrarPorPeriodo(gastosGuardados);
  return gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0);
};

const calcularTotalIngresos = () => {
  const ingresosGuardados = JSON.parse(localStorage.getItem('ingresos') || '[]');
  const ingresosFiltrados = filtrarPorPeriodo(ingresosGuardados);
  return ingresosFiltrados.reduce((sum, ingreso) => sum + ingreso.monto, 0);
};

const calcularTotalAhorros = () => {
  const ahorrosGuardados = JSON.parse(localStorage.getItem('ahorros') || '[]');
  const ahorrosFiltrados = filtrarPorPeriodo(ahorrosGuardados);
  return ahorrosFiltrados.reduce((sum, ahorro) => sum + ahorro.monto, 0);
};

const calcularTotalInversiones = () => {
  const inversionesGuardadas = JSON.parse(localStorage.getItem('inversiones') || '[]');
  const inversionesFiltradas = filtrarPorPeriodo(inversionesGuardadas);
  return inversionesFiltradas.reduce((sum, inversion) => sum + inversion.monto, 0);
};

const financialData = {
  gastos: { 
    porcentaje: 60, 
    monto: calcularTotalGastos()
  },
  ingresos: { 
    monto: calcularTotalIngresos()
  },
  ahorro: { 
    monto: calcularTotalAhorros()
  },
  inversion: { 
    monto: calcularTotalInversiones()
  }
};

  return (
  <main className="wrapper">
    {/* Quantum + Mensaje (Layout horizontal) */}
  <div className="dashboard-welcome" style={{ 
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
  maxWidth: '760px',
  margin: '0 auto 20px auto'
  }}>
  {/* Quantum a la izquierda */}
  <div style={{ 
    flexShrink: 0,
    width: '100px'
    }}>
    <img 
      src={quantumImg} 
      alt="Quantum - Tu asistente financiero"
      style={{ width: '100%', height: 'auto' }}
    />
  </div>

    {/* Textos a la derecha */}
  <div style={{ flex: 1 }}>
    <h1 style={{ margin: '0 0 12px', fontSize: '28px' }}>
      Bienvenid@ a Quanty, {userName}
    </h1>
    <p className="subtitle" style={{ margin: 0, fontSize: '16px', lineHeight: '1.5' }}>
      Yo soy Quantum y estoy aquí para que juntos llevemos tus finanzas a un nivel cuántico! ✨
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
    📅 Mes actual
  </button>
  
  <button
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
       📊 Año actual
    </button>
    </div>

      {/* Botón FAB - Centrado después del subtítulo */}
      <button 
        className="fab" 
        aria-label="Ver transacciones"
        onClick={() => navigate('/transacciones')}
      >
        +
      </button>

      {/* Grid de 4 tarjetas */}
      <section className="cards">
      {/* Card Ingresos - CLICKEABLE */}
      <div 
          className="card"
          onClick={() => navigate('/ingresos')}
          style={{ cursor: 'pointer' }}
      >
      <div className="card__icon">
          <img src={iconoIngresos} alt="Ingresos" />
      </div>
        <h3>Ingreso</h3>
          <p style={{ fontSize: '32px', fontWeight: '800', color: 'var(--cyan-accent)', marginTop: '12px' }}>
            €{financialData.ingresos.monto.toFixed(2)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            👉 Click para gestionar
          </p>
      </div>

      {/* Card Inversión - CLICKEABLE */}
        <div 
          className="card" 
          onClick={() => navigate('/inversiones')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card__icon">
            <img src={iconoInversion} alt="Inversión" />
          </div>
          <h3>Inversión</h3>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#8B5CF6', marginTop: '12px' }}>
              €{financialData.inversion.monto.toFixed(2)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            👉 Click para gestionar
          </p>
        </div>

       {/* Card Gastos - CLICKEABLE */}
        <div 
          className="card"
          onClick={() => navigate('/gastos')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card__icon">
            <img src={iconoGastos} alt="Gastos" />
          </div>
          <h3>Gastos</h3>
          <p style={{ fontSize: '32px', fontWeight: '800', color: '#EF4444', marginTop: '12px' }}>
            €{financialData.gastos.monto.toFixed(2)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            👉 Click para gestionar
          </p>
        </div>      

      {/* Card Ahorro - CLICKEABLE */}
        <div 
          className="card"
          onClick={() => navigate('/ahorros')}
          style={{ cursor: 'pointer' }}
        >
          <div className="card__icon">
            <img src={iconoAhorro} alt="Ahorro" />
          </div>
          <h3>Ahorro</h3>
          <p style={{ fontSize: '32px', fontWeight: '800', color: 'var(--cyan-accent)', marginTop: '12px' }}>
            €{financialData.ahorro.monto.toFixed(2)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            👉 Click para gestionar
          </p>
        </div> 
      </section>
    </main>
  );
}

export default Dashboard;