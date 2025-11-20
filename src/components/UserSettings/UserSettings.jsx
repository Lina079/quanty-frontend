import { useSettings } from '../../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import './../../blocks/userSettings.css';

function UserSettings() {
  const navigate = useNavigate();
  const { currency, theme, changeCurrency, changeTheme } = useSettings();

  // Opciones de moneda disponibles
  const currencies = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'JPY', name: 'Yen Japonés', symbol: '¥' }
  ];

  // Manejador para cambiar moneda
  const handleChangeCurrency = (newCurrency) => {
    changeCurrency(newCurrency);
    const currencyName = currencies.find(c => c.code === newCurrency)?.name;
    showToast(`Moneda cambiada a ${currencyName}`, 'success');
  };

  // Manejador para cambiar tema
  const handleChangeTheme = (newTheme) => {
    changeTheme(newTheme);
    const themeName = newTheme === 'dark' ? 'Oscuro' : 'Claro';
    showToast(`Tema cambiado a ${themeName}`, 'success');
  };

  return (
    <main div className="user-settings-page">
      <div className="user-settings-container">
        
        {/* Título */}
        <h1 className="user-settings-title">⚙️ Configuración</h1>
        <p className="user-settings-subtitle">
          Personaliza tu experiencia en Quanty
        </p>

        {/* Sección: Moneda */}
        <section className="settings-section">
          <h2 className="settings-section-title">💰 Moneda</h2>
          <p className="settings-section-description">
            Selecciona la moneda que usarás en la aplicación
          </p>
          
          <div className="currency-grid">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleChangeCurrency(curr.code)}
                className={`currency-option ${currency === curr.code ? 'active' : ''}`}
              >
                <span className="currency-symbol">{curr.symbol}</span>
                <span className="currency-code">{curr.code}</span>
                <span className="currency-name">{curr.name}</span>
                {currency === curr.code && (
                  <span className="currency-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Sección Tema */}
        <section className="settings-section">
          <h2 className="settings-section-title">🎨 Tema</h2>
          <p className="settings-section-description">
            Elige entre modo claro u oscuro
          </p>
          
          <div className="theme-options">
            <button
              onClick={() => handleChangeTheme('dark')}
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            >
              <span className="theme-icon">🌙</span>
              <span className="theme-name">Modo Oscuro</span>
              {theme === 'dark' && (
                <span className="theme-check">✓</span>
              )}
            </button>

            <button
              onClick={() => handleChangeTheme('light')}
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            >
              <span className="theme-icon">☀️</span>
              <span className="theme-name">Modo Claro</span>
              {theme === 'light' && (
                <span className="theme-check">✓</span>
              )}
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}

export default UserSettings;