import quantumImg from '../images/Quantum-allBody.png';
import iconoGastos from '../images/Icono_caja_gastos.png';
import iconoIngresos from '../images/ingresos_moneda_256x256.png';
import iconoAhorro from '../images/ahorro_caja_fuerte_256x256.png';
import iconoInversion from '../images/inversion_planta_256x256.png';

function Dashboard() {
  // Datos hardcodeados por ahora
  const userName = "Marí Carmen";
  const financialData = {
    gastos: { porcentaje: 60, monto: 1800 },
    ingresos: { monto: 2500 },
    ahorro: { monto: 500 },
    inversion: { porcentaje: 5.4 }
  };

  return (
    <div className="wrapper">
      {/* Robot Quantum */}
      <div className="quantum">
        <img src={quantumImg} alt="Quantum - Tu asistente financiero" />
      </div>

      {/* Mensaje de bienvenida */}
      <h1 style={{ textAlign: 'center' }}>
        ¡Bienvenid@ a Quanty! {userName}
      </h1>
      <p className="subtitle" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
        Yo soy Quantum y estoy aquí para que juntos llevemos tus finanzas a un nivel Qántico! ✨
      </p>

      {/* Grid de 4 tarjetas */}
      <div className="cards">
        {/* Card Gastos */}
        <div className="card">
          <div className="card__icon">
            <img src={iconoGastos} alt="Gastos" />
          </div>
          <h3>Gastos</h3>
          <p>Has usado {financialData.gastos.porcentaje}%</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px' }}>
            €{financialData.gastos.monto}
          </p>
        </div>

        {/* Card Ingresos */}
        <div className="card">
          <div className="card__icon">
            <img src={iconoIngresos} alt="Ingresos" />
          </div>
          <h3>Ingreso</h3>
          <p style={{ fontSize: '32px', fontWeight: '800', color: 'var(--cyan-accent)', marginTop: '12px' }}>
            €{financialData.ingresos.monto}
          </p>
        </div>

        {/* Card Ahorro */}
        <div className="card">
          <div className="card__icon">
            <img src={iconoAhorro} alt="Ahorro" />
          </div>
          <h3>Ahorro</h3>
          <p style={{ fontSize: '32px', fontWeight: '800', color: 'var(--cyan-accent)', marginTop: '12px' }}>
            €{financialData.ahorro.monto}
          </p>
        </div>

        {/* Card Inversión */}
        <div className="card">
          <div className="card__icon">
            <img src={iconoInversion} alt="Inversión" />
          </div>
          <h3>Inversión</h3>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#4ADE80', marginTop: '12px' }}>
            +{financialData.inversion.porcentaje}%
          </p>
          <p>este mes</p>
        </div>
      </div>

      {/* Botón FAB */}
      <button className="fab" aria-label="Agregar transacción">
        +
      </button>
    </div>
  );
}

export default Dashboard;