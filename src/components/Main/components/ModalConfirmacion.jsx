function ModalConfirmacion({ isOpen, onClose, onConfirm, mensaje }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
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
    }}>
      <div className="card" style={{ 
        maxWidth: '400px', 
        width: '100%',
        animation: 'fadeIn 0.2s ease'
      }}>
        <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>
          ⚠️ Confirmar eliminación
        </h3>
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '24px',
          color: 'var(--text-secondary)'
        }}>
          {mensaje || '¿Estás seguro de que quieres eliminar este elemento?'}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
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
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: '#EF4444',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacion;