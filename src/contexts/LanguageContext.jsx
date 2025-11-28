import { createContext, useState, useContext, useCallback } from 'react';
import { getTranslation, getRandomTip, LANGUAGES } from '../i18n';

// Crear el contexto
const LanguageContext = createContext();

// Hook personalizado para usar el idioma fácilmente
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage debe usarse dentro de LanguageProvider');
    }
    return context;
}

// Componente provider
export function LanguageProvider({ children }) {
    // inicializar idioma desde localStorage o usar español por defecto
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('language');
        return saved && LANGUAGES[saved] ? saved : 'es';
    });

    /**
     * Cambia el idioma de la aplicación
     * @param {string} newLanguage - Código del idioma ('es' o 'en')
     */
    const changeLanguage = useCallback((newLanguage) => {
        if (LANGUAGES[newLanguage]) {
            setLanguage(newLanguage);
            localStorage.setItem('language', newLanguage);
        }
    }, []);

    /**
     * Función de traducción
     * @param {string} key - Clave de traducción (ej: 'nav.dashboard)
     * @returns {string} - Texto traducido
     */
    const t = useCallback((key) => {
        return getTranslation(key, language);
    }, [language]);

    /**
     * Obtiene un tip aleatorio en el idioma actual
     * @returns {string} - Tip financiero
     */
    const randomTip = useCallback(() => {
        return getRandomTip(language);
    }, [language]);
    
    return (
        <LanguageContext.Provider
            value={{
                language,
                changeLanguage,
                t,
                randomTip,
                languages: LANGUAGES
            }}
        >
            {children}
        </LanguageContext.Provider>    
    );
}