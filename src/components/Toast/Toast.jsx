import { useEffect } from 'react';
import './../../blocks/toast.css';

/**
 * Toast Component - Notificación personalizada
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 * @param {function} onClose - Función que se ejecuta al cerrar
 */
function Toast({ message, type = 'info', onClose }) {
  
  // Cerrar automáticamente después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Limpiar el timer si el componente se desmonta
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {/* Icono según el tipo */}
        <span className="toast-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'info' && 'i'}
        </span>
        
        {/* Mensaje */}
        <p className="toast-message">{message}</p>
      </div>
    </div>
  );
}

export default Toast;
