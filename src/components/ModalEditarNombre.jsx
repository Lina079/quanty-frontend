import { useState } from 'react';
import editIcon from '../images/lapiz_edit_name.png';

function ModalEditarNombre({ isOpen, onClose, onSave, nombreActual }) {
  const [nombre, setNombre] = useState(nombreActual);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validarNombre = (valor) => {
    // Solo letras, espacios y tildes
    const soloLetras = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]*$/;
    
    if (!valor.trim()) {
      return 'El nombre no puede estar vacío';
    }
    
    if (!soloLetras.test(valor)) {
      return 'Solo se permiten letras (sin números ni caracteres especiales)';
    }
    
    if (valor.trim().length < 2) {
      return 'El nombre debe tener al menos 2 letras';
    }
    
    if (valor.trim().length > 30) {
      return 'El nombre no puede tener más de 30 letras';
    }
    
    return '';
  };

  const handleChange = (e) => {
    const valor = e.target.value;
    setNombre(valor);
    setError(validarNombre(valor));
  };

  const handleGuardar = () => {
    const errorValidacion = validarNombre(nombre);
    
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    
    onSave(nombre.trim());
    setError('');
  };

  const handleCancelar = () => {
    setNombre(nombreActual);
    setError('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGuardar();
    } else if (e.key === 'Escape') {
      handleCancelar();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={handleCancelar}
    >
      <div 
        className="card" 
        style={{ 
          maxWidth: '450px', 
          width: '100%',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <img src={editIcon} alt="Editar" style={{ width: '24px', height: '24px' }} />
            Editar nombre
        </h3>
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}>
          Personaliza tu experiencia en Quanty
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="nombre-input"
            style={{ 
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Tu nombre o apodo
          </label>
          <input
            id="nombre-input"
            type="text"
            value={nombre}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="Ej: María Carmen"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: error ? '2px solid #EF4444' : '1px solid rgba(255,255,255,.2)',
              background: 'rgba(255,255,255,.05)',
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border 0.2s'
            }}
          />
          {error && (
            <p style={{
              marginTop: '8px',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </p>
          )}
          <p style={{
            marginTop: '8px',
            color: 'var(--text-secondary)',
            fontSize: '12px'
          }}>
            {nombre.trim().length}/30 caracteres
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCancelar}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,.2)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!!error || !nombre.trim()}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: error || !nombre.trim() ? 'rgba(56, 225, 255, 0.3)' : 'var(--cyan-accent)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '800',
              cursor: error || !nombre.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: error || !nombre.trim() ? 0.5 : 1
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEditarNombre;