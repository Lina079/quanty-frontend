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
  // Estados para moneda y tema
  const [currency, setCurrency] = useState(DEFAULT_SETTINGS.currency);
  const [theme, setTheme] = useState(DEFAULT_SETTINGS.theme);

  /**
   * Cargar settings desde localStorage al montar el componente
   */
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setCurrency(parsed.currency || DEFAULT_SETTINGS.currency);
        setTheme(parsed.theme || DEFAULT_SETTINGS.theme);
      } catch (error) {
        console.error('Error cargando settings:', error);
      }
    }
  }, []);

  /**
   * Guardar settings en localStorage cada vez que cambien
   */
  useEffect(() => {
    const settings = { currency, theme };
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [currency, theme]);

  /**
   * Cambia la moneda
   * @param {string} newCurrency - Nueva moneda (EUR, USD, COP, etc.)
   */
  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  /**
   * Cambia el tema
   * @param {string} newTheme - Nuevo tema (dark, light)
   */
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    
    // Aplicar tema al documento
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  };

  /**
   * Formatea un número con la moneda actual
   * @param {number} amount - Cantidad a formatear
   * @returns {string} - Cantidad formateada con símbolo de moneda
   */
  const formatCurrency = (amount) => {
    const symbols = {
      EUR: '€',
      USD: '$',
      COP: '$',
      MXN: '$',
      GBP: '£',
      JPY: '¥'
    };
    
    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Aplicar tema al montar
  useEffect(() => {
    changeTheme(theme);
  }, []);

  // Proveer el contexto a los componentes hijos
  return (
    <SettingsContext.Provider
      value={{
        currency,
        theme,
        changeCurrency,
        changeTheme,
        formatCurrency
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}