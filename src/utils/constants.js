// URLs de API
export const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Portfolio inicial (montos invertidos en €)
export const INITIAL_PORTFOLIO = {
  bitcoin: 200,
  ethereum: 200,
  gold: 200,
  sp500: 200
};

// Precio hardcoded S&P 500
export const SP500_PRICE = 5234.50;

// Porcentaje de cambio S&P 500
export const SP500_CHANGE_PERCENT = 0.012; // +1.2%

// Colores para gráfica de rendimiento
export const CHART_COLORS = {
  GOLD: '#FFD700',     // >= 10%
  CYAN: '#38E1FF',     // >= 5%
  GREEN: '#4ADE80',    // >= 0%
  RED: '#EF4444'       // < 0%
};

// Mensajes de error
export const ERROR_MESSAGES = {
  FETCH_PRICES: 'No se pudieron cargar los precios. Intenta más tarde.',
  API_ERROR: 'Lo sentimos, algo ha salido mal durante la solicitud. Es posible que haya un problema de conexión o que el servidor no funcione. Por favor, inténtalo más tarde.',
  NO_RESULTS: 'No se ha encontrado nada'
};