// CoinGecko API - obtener precios de criptomonedas y oro
const BASE_URL = 'https://api.coingecko.com/api/v3';

// Obtener precios en euros (BTC, ETH, Oro)
export const getCryptoPrices = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=eur&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error('Error al obtener precios');
    }

    const data = await response.json();
    
    // Formatear datos
    return {
      bitcoin: {
        price: data.bitcoin.eur,
        change24h: data.bitcoin.eur_24h_change
      },
      ethereum: {
        price: data.ethereum.eur,
        change24h: data.ethereum.eur_24h_change
      },
      gold: {
        price: data['pax-gold'].eur,
        change24h: data['pax-gold'].eur_24h_change
      }
    };
  } catch (error) {
    console.error('Error en CoinGecko API:', error);
    throw error;
  }
};