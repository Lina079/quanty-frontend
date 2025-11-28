import es from './es.json';
import en from './en.json';

// Objeto con todos los idiomas disponibles
const translations = {
    es,
    en
};

// idiomas soportados
export const LANGUAGES = {
    es: { code: 'es', name: 'Español', flag: '🇪🇸' },
    en: { code: 'en', name: 'English', flag: '🇺🇸' }
};

/** Obtiene una traducción por su clave
 * @param {string} key - Clave de traducción (ej: 'nav.daschboard')
 * @param {string} language - Código de idioma ('es' o 'en')
 * @returns {string} - Texto traducido o la clave si no existe
 */
export const getTranslation = (key, language = 'es') => {
    const keys = key.split('.');
    let result = translations[language];

    for (const k of keys) {
        if (result && result[k]) {
            result = result[k];
        } else {
            //si no encuentra la traducción, devuelve la clave
            console.warn(`Traslation missing: ${key} for language: ${language}`);
            return key;
        }
    }

    return result;
};

/**
 * obtiene un tip aleatorio traducido
 * @param {string} language - Código de idioma
 * @returns {string} - Tip financiero aleatorio
 */
export const getRandomTip = (language = 'es') => {
    const tips = translations[language]?.tips;
    if (!tips) return '';

    const tipKeys = Object.keys(tips);
    const randomIndex = Math.floor(Math.random() * tipKeys.length);
    return tips[tipKeys[randomIndex]];
};

export default translations;