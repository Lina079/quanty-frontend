// CoinGecko API - obtener precios de criptomonedas y oro
import { API_BASE_URL } from './constants.js';

/**
 * Mapea las monedas de Quanty a los códigos de CoinGecko
 * @param {string} currency - Código de moneda de Quanty (EUR, USD, COP, etc)
 * @returns {string} - Código de moneda para CoinGecko API
 */
const mapCurrencyToAPI = (currency) => {
  const currencyMap = {
    'EUR': 'eur',
    'USD': 'usd',
    'GBP': 'gbp',
    'JPY': 'jpy',
    'MXN': 'mxn',
    'COP': 'usd' // CoinGecko no soporta COP directamente, usamos USD
  };
  
  return currencyMap[currency] || 'eur'; // EUR por defecto
};

/**
 * Obtener precios de criptomonedas y oro en la moneda especificada
 * @param {string} currency - Código de moneda (EUR, USD, COP, etc)
 * @returns {Promise} - Objeto con precios y cambios 24h
 */
export const getCryptoPrices = async (currency = 'EUR') => {
  try {
    const apiCurrency = mapCurrencyToAPI(currency);
    
    const response = await fetch(
      `${API_BASE_URL}/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=${apiCurrency}&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error('Error al obtener precios');
    }

    const data = await response.json();
    
    // Formatear datos usando la moneda de la API
    return {
      bitcoin: {
        price: data.bitcoin[apiCurrency],
        change24h: data.bitcoin[`${apiCurrency}_24h_change`]
      },
      ethereum: {
        price: data.ethereum[apiCurrency],
        change24h: data.ethereum[`${apiCurrency}_24h_change`]
      },
      gold: {
        price: data['pax-gold'][apiCurrency],
        change24h: data['pax-gold'][`${apiCurrency}_24h_change`]
      }
    };
  } catch (error) {
    console.error('Error en CoinGecko API:', error);
    throw error;
  }
};