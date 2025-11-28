import { useSettings } from '../../../contexts/SettingsContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import quantumHalfDefault from '../../../images/quantum_half_fade_256x256.png';
import quantumHalfLight from '../../../images/theme-light-images/quantum-halfbody2-light.png';
import quantumInvestLight from '../../../images/theme-light-images/quantum-investment-light.png';

function CardResumen({ 
  tipo, 
  total, 
  cantidad, 
  mensaje, 
  mostrarFormulario, 
  onToggleFormulario,
  esPeriodoFiltrado = false,
  imagenQuantum = quantumHalfDefault,
  formatCurrency
  }) {

  const { theme } = useSettings();
  const { t } = useLanguage();
  
  // Configuración según el tipo
  const config = {
    ingresos: {
      color: '#4ADE80',
      gradiente: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
      colorCancelado: 'rgba(74, 222, 128, 0.2)',
      totalLabel: t('income.totalIncome'),
      periodoText: t('income.inPeriod'),
      registeredText: t('income.registered'),
      textoBoton: t('income.addIncome')
    },
    gastos: {
      color: '#EF4444',
      gradiente: 'linear-gradient(180deg, #2BE3FF 0%, #12B4D6 100%)',
      colorCancelado: 'rgba(239, 68, 68, 0.2)',
      totalLabel: t('expenses.totalExpenses'),
      periodoText: t('expenses.inPeriod'),
      registeredText: t('expenses.registered'),
      textoBoton: t('expenses.addExpense')
    },
    ahorros: {
      color: 'var(--cyan-accent)',
      gradiente: 'linear-gradient(180deg, #38E1FF 0%, #12B4D6 100%)',
      colorCancelado: 'rgba(56, 225, 255, 0.2)',
      totalLabel: t('saving.totalSavings'),
      periodoText: t('saving.inPeriod'),
      registeredText: t('savings.registered'),
      textoBoton: t('savings.addSaving')
    },
    inversiones: {
      color: '#8B5CF6',
      gradiente: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
      colorCancelado: 'rgba(139, 92, 246, 0.2)',
      totalLabel: t('investments.totalInvestments'),
      periodoText: t('investments.inPeriod'),
      registeredText: t('investments.registered'),
      textoBoton: t('investments.addInvestment')
    }
  };

  const currentConfig = config[tipo];

  // Determinar qué imagen usar según tema
  const getQuantumImage = () => {
  if (theme === 'light') {
    // Retornar imagen del prop si existe, sino la por defecto
    if (tipo === 'inversiones'){
    return quantumInvestLight;
  }
  return quantumHalfLight;
  }
  return imagenQuantum;
  };

  return (
    <>
      {/* Quantum con mensaje */}
      <div style={{ 
        position: 'relative',
        maxWidth: '800px',
        margin: '0 auto 32px'
      }}>
        <div className="quantum-message-box" style={{ 
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
            src={getQuantumImage()} 
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
              {currentConfig.totalLabel}
            </h3>
            <p style={{ 
              fontSize: 'clamp(18px, 5vw, 36px)', 
              fontWeight: '800', 
              color: currentConfig.color, 
              margin: 0 
            }}>
              {formatCurrency(total)}
            </p>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginTop: '4px', 
              fontSize: '14px' 
            }}>
              {cantidad} {esPeriodoFiltrado ? currentConfig.periodoText : currentConfig.registeredText}
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
            {mostrarFormulario ? `x ${t('common.cancel')}` : `+ ${currentConfig.textoBoton}`}
          </button>
        </div>
      </div>
    </>
  );
}

export default CardResumen;