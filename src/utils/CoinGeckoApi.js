// CoinGecko API - obtener precios de criptomonedas y oro
import { API_BASE_URL } from './constants.js';

// API gratuita para tasas de cambio
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';

/**
 * Monedas soportadas directamente por CoinGecko
 */
const COINGECKO_SUPPORTED = ['eur', 'usd', 'gbp', 'jpy', 'mxn'];

/**
 * Mapea las monedas de Quanty a los códigos de CoinGecko
 */
const mapCurrencyToAPI = (currency) => {
  const currencyMap = {
    'EUR': 'eur',
    'USD': 'usd',
    'GBP': 'gbp',
    'JPY': 'jpy',
    'MXN': 'mxn',
    'COP': 'usd' // Obtenemos en USD y convertimos a COP
  };
  
  return currencyMap[currency] || 'eur'; // EUR por defecto
};

/**
 * Obtener la tasa de cambio de USD a la moneda especificada
 */
const getExchangeRate = async (targetCurrency) => {
  try {
    const response = await fetch(EXCHANGE_RATE_API);
    if (!response.ok) {
      throw new Error('Error al obtener tasa de cambio');
    }
    const data = await response.json();
    return data.rates[targetCurrency] || 1;
  } catch (error) {
    console.error('Error obteniendo tasa de cambio:', error);
    return 1; // Fallback: sin conversión
  }
};

/**
 * Obtener precios de criptomonedas y oro en la moneda especificada
 * @param {string} currency - Código de moneda (EUR, USD, COP, etc)
 * @returns {Promise} - Objeto con precios y cambios 24h
 */
export const getCryptoPrices = async (currency = 'EUR') => {
  try {
    const apiCurrency = mapCurrencyToAPI(currency);
    const needsConversion = !COINGECKO_SUPPORTED.includes(currency.toLowerCase());

    const response = await fetch(
      `${API_BASE_URL}/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=${apiCurrency}&include_24hr_change=true`
    );
    
    if(!response.ok) {
      throw new Error('Error al obtener precios');
    }

    const data = await response.json();

    // Si la moneda no está soportada por CoinGecko, convertimos
    let exchangeRate = 1;
    if (needsConversion) {
      exchangeRate = await getExchangeRate(currency);
    }

    // Formatear datos aplicando conversión si es necesario
    return {
      bitcoin: {
        price: data.bitcoin[apiCurrency] * exchangeRate,
        change24h: data.bitcoin[`${apiCurrency}_24h_change`]
      },
      ethereum: {
        price: data.ethereum[apiCurrency] * exchangeRate,
        change24h: data.ethereum[`${apiCurrency}_24h_change`]
      },
      gold: {
        price: data['pax-gold'][apiCurrency] * exchangeRate,
        change24h: data['pax-gold'][`${apiCurrency}_24h_change`]
      },
      // Incluimos la tasa de cambio por si se necesita en otros cálculos
      _meta: {
        baseCurrency: apiCurrency.toUpperCase(),
        targetCurrency: currency,
        exchangeRate: exchangeRate,
        needsConversion: needsConversion
      }
    };
  } catch (error) {
    console.error('Error en CoinGecko API:', error);
    throw error;
  }
};