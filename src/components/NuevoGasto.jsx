import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NuevoGasto() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const categoriasBase = [
    { value: 'compra', label: '🛒 La compra', icon: '🛒' },
    { value: 'alquiler', label: '🏠 Alquiler', icon: '🏠' },
    { value: 'suministros', label: '💡 Suministros', icon: '💡' },
    { value: 'transporte', label: '🚗 Transporte', icon: '🚗' },
    { value: 'gimnasio', label: '💪 Gimnasio', icon: '💪' },
    { value: 'salud', label: '🏥 Salud', icon: '🏥' },
    { value: 'viajes', label: '✈️ Viajes', icon: '✈️' },
    { value: 'ocio', label: '🎉 Ocio', icon: '🎉' },
    { value: 'otro', label: '📝 Otro', icon: '📝' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación
    if (!formData.categoria || !formData.monto) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    // Obtener gastos existentes
    const gastosGuardados = JSON.parse(localStorage.getItem('gastos') || '[]');
    
    // Crear nuevo gasto
    const nuevoGasto = {
      id: Date.now(),
      ...formData,
      tipo: 'gasto',
      monto: parseFloat(formData.monto)
    };

    // Guardar
    gastosGuardados.push(nuevoGasto);
    localStorage.setItem('gastos', JSON.stringify(gastosGuardados));

    // Mensaje y volver
    alert('¡Gasto registrado exitosamente!');
    navigate('/');
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      setFormData({ ...formData, categoria: customCategory });
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  return (
    <div className="wrapper">
      <h1 style={{ textAlign: 'center' }}>Nuevo Gasto</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Registra tus gastos para llevar un mejor control
      </p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card">
          {/* Categoría */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '700',
              fontSize: '16px'
            }}>
              Categoría *
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomCategory(true);
                } else {
                  setFormData({ ...formData, categoria: e.target.value });
                }
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(14,49,71,.5)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontFamily: 'inherit'
              }}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categoriasBase.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
              <option value="custom">➕ Agregar categoría personalizada</option>
            </select>
          </div>

          {/* Modal para categoría personalizada */}
          {showCustomCategory && (
            <div style={{ 
              marginBottom: '24px', 
              padding: '16px',
              background: 'rgba(56, 225, 255, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 225, 255, 0.3)'
            }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600'
              }}>
                Nueva categoría
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Ej: Mascotas, Educación..."
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,.2)',
                    background: 'rgba(14,49,71,.5)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'var(--cyan-accent)',
                    color: '#00222F',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          {/* Monto */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '700',
              fontSize: '16px'
            }}>
              Monto (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(14,49,71,.5)',
                color: 'var(--text-primary)',
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '700',
              fontSize: '16px'
            }}>
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Ej: Compra semanal en Mercadona"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(14,49,71,.5)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Fecha */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '700',
              fontSize: '16px'
            }}>
              Fecha
            </label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(14,49,71,.5)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '14px',
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
              type="submit"
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(180deg, #2BE3FF 0%, #12B4D6 100%)',
                color: '#00222F',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Guardar Gasto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default NuevoGasto;