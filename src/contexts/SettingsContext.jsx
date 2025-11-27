import { createContext, useState, useContext, useEffect } from 'react';

//crear el contexto
const SettingsContext = createContext();

// Hook personalizado para usar settings fácilmente
export function useSettings(){
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings debe usarse dentro de SettingsProvider');        
    }
    return context; 
}

//Configuración por defecto
const DEFAULT_SETTINGS = {
    currency: 'EUR', //moneda por defecto
    theme: 'dark' //tema por defecto
};

// Componente Provider
export function SettingsProvider({ children }) {
  // Inicializar estados leyendo de localStorage INMEDIATAMENTE
  const [currency, setCurrency] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return parsed.currency || DEFAULT_SETTINGS.currency;
      } catch {
        return DEFAULT_SETTINGS.currency;
      }
    }
    return DEFAULT_SETTINGS.currency;
  });

  const [theme, setTheme] = useState(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return parsed.theme || DEFAULT_SETTINGS.theme;
      } catch {
        return DEFAULT_SETTINGS.theme;
      }
    }
    return DEFAULT_SETTINGS.theme;
  });

  /**
   * Guardar settings en localStorage cada vez que cambien
   */
  useEffect(() => {
    const settings = { currency, theme };
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [currency, theme]);

  /**
   * Aplicar tema al documento cada vez que cambie
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /**
   * Cambia la moneda
   */
  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  /**
   * Cambia el tema
   */
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  /**
   * Formatea un número con la moneda actual
   */
  const formatCurrency = (amount) => {
  const config = {
    EUR: { locale: 'es-ES', symbol: '€' },
    USD: { locale: 'en-US', symbol: '$' },
    COP: { locale: 'es-CO', symbol: '$' },
    MXN: { locale: 'es-MX', symbol: '$' },
    GBP: { locale: 'en-GB', symbol: '£' },
    JPY: { locale: 'ja-JP', symbol: '¥' }
  };
  
  const { locale, symbol } = config[currency] || { locale: 'en-US', symbol: currency };
  
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${symbol}${formatted}`;
  };

  /**
   * Devuelve solo el símbolo de la moneda actual
   */
  const getCurrencySymbol = () => {
    const symbols = {
      EUR: '€',
      USD: '$',
      COP: '$',
      MXN: '$',
      GBP: '£',
      JPY: '¥'
    };
    return symbols[currency] || currency;
  };

  return (
    <SettingsContext.Provider
      value={{
        currency,
        theme,
        changeCurrency,
        changeTheme,
        formatCurrency,
        getCurrencySymbol
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}