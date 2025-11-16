import { useState, useEffect } from 'react';
import ModalConfirmacion from './ModalConfirmacion';
import HistorialFiltrado from './HistorialFiltrado';
import quantumHalf from '../images/quantum_half_fade_256x256.png';

function Ahorros() {
  const [ahorros, setAhorros] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ahorroAEliminar, setAhorroAEliminar] = useState(null);
  const [totalFiltrado, setTotalFiltrado] = useState(null);
  const [cantidadFiltrada, setCantidadFiltrada] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    categoria: '',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const categoriasBase = [
    { value: 'tranquilidad', label: '🛡️ Ahorro de tranquilidad' },
    { value: 'invertir', label: '📈 Ahorro para invertir' },
    { value: 'viajar', label: '✈️ Ahorro para viajar' },
    { value: 'casa', label: '🏠 Ahorro comprar casa' },
    { value: 'carro', label: '🚗 Ahorro comprar carro' },
    { value: 'otro', label: '📝 Otro' }
  ];

  // Estado para categorías dinámicas
  const [categorias, setCategorias] = useState(categoriasBase);

  const cargarAhorros = () => {
    const ahorrosGuardados = JSON.parse(localStorage.getItem('ahorros') || '[]');
    const ahorrosOrdenados = ahorrosGuardados.sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    setAhorros(ahorrosOrdenados);
  };

  useEffect(() => {
    cargarAhorros();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.categoria || !formData.monto) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const ahorrosGuardados = JSON.parse(localStorage.getItem('ahorros') || '[]');
    const nuevoAhorro = {
      id: Date.now(),
      ...formData,
      tipo: 'ahorro',
      monto: parseFloat(formData.monto)
    };

    ahorrosGuardados.push(nuevoAhorro);
    localStorage.setItem('ahorros', JSON.stringify(ahorrosGuardados));
    
    // Reset form
    setFormData({
      categoria: '',
      monto: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setMostrarFormulario(false);
    cargarAhorros();
  };

  const abrirModalEliminar = (ahorro) => {
    setAhorroAEliminar(ahorro);
    setModalOpen(true);
  };

  const confirmarEliminar = () => {
    const ahorrosActualizados = ahorros.filter(a => a.id !== ahorroAEliminar.id);
    localStorage.setItem('ahorros', JSON.stringify(ahorrosActualizados));
    setAhorros(ahorrosActualizados);
    setModalOpen(false);
    setAhorroAEliminar(null);
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      // Agregar la nueva categoría a la lista
      const nuevaCategoria = {
        value: customCategory.toLowerCase().replace(/\s+/g, '-'),
        label: `✨ ${customCategory}`
      };
      setCategorias([...categoriasBase, nuevaCategoria]);
      
      // Seleccionar la nueva categoría
      setFormData({ ...formData, categoria: customCategory });
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  const getCategoriaEmoji = (categoria) => {
    const emojis = {
      'tranquilidad': '🛡️',
      'invertir': '📈',
      'viajar': '✈️',
      'casa': '🏠',
      'carro': '🚗',
      'otro': '📝'
    };
    return emojis[categoria] || '💰';
  };

  const totalAhorros = totalFiltrado !== null ? totalFiltrado : ahorros.reduce((sum, ahorro) => sum + ahorro.monto, 0);
  const cantidadAhorros = cantidadFiltrada !== null ? cantidadFiltrada : ahorros.length;

  return (
    <main className="wrapper">
      <h1 style={{ textAlign: 'center' }}>Gestión de Ahorros</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Construye tu futuro financiero
      </p>

      {/* Quantum con mensaje */}
      <div style={{ 
        position: 'relative',
        maxWidth: '800px',
        margin: '0 auto 32px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          background: 'linear-gradient(160deg, rgba(14,49,71,.85) 0%, rgba(11,36,54,.85) 100%)',
          padding: '20px 24px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,.08)',
          position: 'relative'
        }}>
          <img 
            src={quantumHalf} 
            alt="Quantum" 
            style={{ 
              width: '80px', 
              height: '80px',
              flexShrink: 0
            }} 
          />
          <p style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            margin: 0,
            lineHeight: '1.4'
          }}>
            💎 Ahorrar es plantar semillas para tu futuro. ¡Cada euro cuenta!
          </p>
        </div>
      </div>

      {/* Resumen + Botón Agregar */}
      <div style={{ maxWidth: '800px', margin: '0 auto 32px' }}>
        <div className="card" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Total Ahorros</h3>
            <p style={{ fontSize: '36px', fontWeight: '800', color: 'var(--cyan-accent)', margin: 0 }}>
              €{totalAhorros.toFixed(2)}
            </p>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
              {cantidadAhorros} {cantidadAhorros === 1 ? 'ahorro' : 'ahorros'} {totalFiltrado !== null ? 'en este período' : 'registrados'}
            </p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              border: 'none',
              background: mostrarFormulario 
                ? 'rgba(56, 225, 255, 0.2)' 
                : 'linear-gradient(180deg, #38E1FF 0%, #12B4D6 100%)',
              color: mostrarFormulario ? 'var(--cyan-accent)' : '#00222F',
              fontSize: '16px',
              fontWeight: '800',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
          >
            {mostrarFormulario ? '✕ Cancelar' : '+ Agregar Ahorro'}
          </button>
        </div>
      </div>

      {/* Formulario (condicional) */}
      {mostrarFormulario && (
        <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Nuevo Ahorro</h3>

              {/* Categoría */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
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
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                  <option value="custom">➕ Agregar categoría personalizada</option>
                </select>
              </div>

              {showCustomCategory && (
                <div style={{ 
                  marginBottom: '20px', 
                  padding: '16px',
                  background: 'rgba(56, 225, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Nueva categoría..."
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
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* Monto */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
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
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Opcional"
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
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

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(180deg, #38E1FF 0%, #12B4D6 100%)',
                  color: '#00222F',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                💾 Guardar Ahorro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial con gráfica */}
      <HistorialFiltrado 
        type="saving" 
        onDelete={abrirModalEliminar}
        data={ahorros}
        onTotalChange={(total, cantidad) => {
          setTotalFiltrado(total);
          setCantidadFiltrada(cantidad);
        }}
      />

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        mensaje="Este ahorro se eliminará permanentemente."
      />

    </main>
  );
}

export default Ahorros;