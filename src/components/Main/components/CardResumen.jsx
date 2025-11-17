import quantumHalfDefault from '../../../images/quantum_half_fade_256x256.png';

function CardResumen({ 
  tipo, 
  total, 
  cantidad, 
  mensaje, 
  mostrarFormulario, 
  onToggleFormulario,
  esPeriodoFiltrado = false,
  imagenQuantum = quantumHalfDefault
}) {
  
  // Configuración según el tipo
  const config = {
    ingresos: {
      color: '#4ADE80',
      gradiente: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
      colorCancelado: 'rgba(74, 222, 128, 0.2)',
      singular: 'ingreso',
      plural: 'ingresos',
      textoBoton: 'Agregar Ingreso'
    },
    gastos: {
      color: '#EF4444',
      gradiente: 'linear-gradient(180deg, #2BE3FF 0%, #12B4D6 100%)',
      colorCancelado: 'rgba(239, 68, 68, 0.2)',
      singular: 'gasto',
      plural: 'gastos',
      textoBoton: 'Agregar Gasto'
    },
    ahorros: {
      color: 'var(--cyan-accent)',
      gradiente: 'linear-gradient(180deg, #38E1FF 0%, #12B4D6 100%)',
      colorCancelado: 'rgba(56, 225, 255, 0.2)',
      singular: 'ahorro',
      plural: 'ahorros',
      textoBoton: 'Agregar Ahorro'
    },
    inversiones: {
      color: '#8B5CF6',
      gradiente: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
      colorCancelado: 'rgba(139, 92, 246, 0.2)',
      singular: 'inversión',
      plural: 'inversiones',
      textoBoton: 'Agregar Inversión'
    }
  };

  const currentConfig = config[tipo];

  return (
    <>
      {/* Quantum con mensaje */}
      <div style={{ 
        position: 'relative',
        maxWidth: '800px',
        margin: '0 auto 32px'
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
            src={imagenQuantum} 
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
            {mensaje}
          </p>
        </div>
      </div>

      {/* Resumen + Botón Agregar */}
      <div style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
        <div className="card" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>
              Total {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </h3>
            <p style={{ 
              fontSize: '36px', 
              fontWeight: '800', 
              color: currentConfig.color, 
              margin: 0 
            }}>
              €{total.toFixed(2)}
            </p>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginTop: '4px', 
              fontSize: '14px' 
            }}>
              {cantidad} {cantidad === 1 ? currentConfig.singular : currentConfig.plural} {esPeriodoFiltrado ? 'en este período' : 'registrados'}
            </p>
          </div>
          <button
            onClick={onToggleFormulario}
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              border: 'none',
              background: mostrarFormulario 
                ? currentConfig.colorCancelado
                : currentConfig.gradiente,
              color: mostrarFormulario 
                ? currentConfig.color 
                : (tipo === 'inversiones' ? '#FFFFFF' : '#00222F'),
              fontSize: '16px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
          >
            {mostrarFormulario ? '✕ Cancelar' : `+ ${currentConfig.textoBoton}`}
          </button>
        </div>
      </div>
    </>
  );
}

export default CardResumen;