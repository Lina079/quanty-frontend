import { createContext, useState, useContext } from 'react';
import Toast from '../components/Toast/Toast';

// Crear el contexto
const ToastContext = createContext();

// Hook personalizado para usar el toast fácilmente
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}

// Provider del contexto
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  /**
   * Muestra un toast
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo: 'success', 'error', 'info'
   */
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  /**
   * Cierra el toast actual
   */
  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Renderizar el toast si existe */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}