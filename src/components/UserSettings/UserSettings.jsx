import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import './../../blocks/userSettings.css';

function UserSettings() {
  const navigate = useNavigate();
  const { currency, theme, changeCurrency, changeTheme } = useSettings();
  const { showToast } = useToast();
  const { language, changeLanguage, languages, t } = useLanguage();

  // Opciones de moneda disponibles
  const currencies = [
  { code: 'USD', name: t('settings.currencies.USD'), symbol: '$' },
  { code: 'COP', name: t('settings.currencies.COP'), symbol: '$' },
  { code: 'MXN', name: t('settings.currencies.MXN'), symbol: '$' },
  { code: 'GBP', name: t('settings.currencies.GBP'), symbol: '£' },
  { code: 'JPY', name: t('settings.currencies.JPY'), symbol: '¥' }
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

  // Manejador para cambiar idioma
  const handleChangeLanguage = (newLanguage) => {
    changeLanguage(newLanguage);
    const langName = languages[newLanguage]?.name;
    showToast(`${t('toast.languageChanged')} ${langName}`, 'success');
  };

  return (
    <main className="user-settings-page">
      <div className="user-settings-container">
        
        {/* Título */}
        <h1 className="user-settings-title">⚙️ {t('settings.title')}</h1>
        <p className="user-settings-subtitle">
          {t('settings.subtitle')}
        </p>

        {/* Sección: Moneda */}
        <section className="settings-section">
          <h2 className="settings-section-title">💰 {t('settings.currency')}</h2>
          <p className="settings-section-description">
            {t('settings.currencyDescription')}
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
          <h2 className="settings-section-title">🎨 {t('settings.theme')}</h2>
          <p className="settings-section-description">
            {t('settings.themeDescription')}
          </p>
          
          <div className="theme-options">
            <button
              onClick={() => handleChangeTheme('dark')}
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            >
              <span className="theme-icon">🌙</span>
              <span className="theme-name">{t('settings.darkMode')}</span>
              {theme === 'dark' && (
                <span className="theme-check">✓</span>
              )}
            </button>

            <button
              onClick={() => handleChangeTheme('light')}
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            >
              <span className="theme-icon">☀️</span>
              <span className="theme-name">{t('settings.lightMode')}</span>
              {theme === 'light' && (
                <span className="theme-check">✓</span>
              )}
            </button>
          </div>
        </section>

        {/* Sección Idioma */}
        <section className="settings-section">
          <h2 className="settings-section-tittle">🌐 {t('settings.language')}</h2>
          <p className="settings-section-description">
            {t('settings.languageDescription')}
          </p>

          <div className="theme-options">
            {Object.values(languages).map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChangeLanguage(lang.code)}
                className={`theme-option ${language === lang.code ? 'active' : ''}`}
                >
                  <span className="theme-icon">{lang.flag}</span>
                  <span className="theme-name">{lang.name}</span>
                  {language === lang.code && (
                    <span className="theme-check">✓</span>
                  )}
                </button>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

export default UserSettings;