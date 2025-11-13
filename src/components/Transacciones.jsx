import { useNavigate } from 'react-router-dom';
import quantumHalf from '../images/quantum_half_fade_256x256.png';

function Transacciones() {
  const navigate = useNavigate();

  // Calcular totales desde localStorage
  const calcularTotales = () => {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);

    return {
      gastos: totalGastos,
      ingresos: 2500, // Hardcodeado por ahora
      ahorro: 500,
      inversion: 800
    };
  };

  const totales = calcularTotales();

  return (
    <div className="wrapper">
      <h1 style={{ textAlign: 'center' }}>Transacciones</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Resumen completo de tus finanzas
      </p>

      {/* Quantum con mensaje */}
    <div style={{ 
      position: 'relative',
      maxWidth: '800px',
      margin: '0 auto 40px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        background: 'linear-gradient(160deg, rgba(14,49,71,.85) 0%, rgba(11,36,54,.85) 100%)',
        padding: '20px 24px',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,.08)',
        position: 'relative'
      }}>
        <img 
          src={quantumHalf} 
          alt="Quantum" 
          style={{ 
            width: '80px', 
            height: '80px',
            flexShrink: 0
          }} 
        />
        <p style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: 0,
          lineHeight: '1.4'
        }}>
          🌟 Tu panorama financiero en una vista. ¡El conocimiento es poder!
        </p>
      </div>
    </div>

      <div className="cards" style={{ marginTop: '40px' }}>
      </div>

      <div className="cards" style={{ marginTop: '40px' }}>
        {/* Card Gastos */}
        <div 
          className="card"
          onClick={() => navigate('/detalle-gastos')}
          style={{ cursor: 'pointer' }}
        >
          <h3>💸 Gastos Totales</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#EF4444', marginTop: '16px' }}>
            €{totales.gastos.toFixed(2)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            👉 Ver detalle
          </p>
        </div>

        {/* Card Ingresos */}
        <div className="card">
          <h3>💰 Ingresos Totales</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#4ADE80', marginTop: '16px' }}>
            €{totales.ingresos.toFixed(2)}
          </p>
        </div>

        {/* Card Ahorro */}
        <div className="card">
          <h3>🏦 Ahorro Total</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', color: 'var(--cyan-accent)', marginTop: '16px' }}>
            €{totales.ahorro.toFixed(2)}
          </p>
        </div>

        {/* Card Inversión */}
        <div 
          className="card"
          onClick={() => navigate('/inversiones')}
          style={{ cursor: 'pointer' }}
        >
          <h3>📈 Inversión Total</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#FFD700', marginTop: '16px' }}>
            €{totales.inversion.toFixed(2)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            👉 Ver portfolio
          </p>
        </div>
      </div>
    </div>
  );
}

export default Transacciones;