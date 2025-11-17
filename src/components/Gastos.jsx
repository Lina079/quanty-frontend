import { useState, useEffect } from 'react';
import ModalConfirmacion from './ModalConfirmacion';
import CardResumen from './CardResumen';
import HistorialFiltrado from './HistorialFiltrado';


function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
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
    { value: 'compra', label: '🏠 Alquiler' },
    { value: 'compra', label: '🏠 Hipoteca' },
    { value: 'alquiler', label: '🛒 La compra' },
    { value: 'suministros', label: '💡 Suministros' },
    { value: 'transporte', label: '🚗 Transporte' },
    { value: 'Tarjeta de credito', label: '💳 Tarjeta de credito'},
    { value: 'gimnasio', label: '💪 Gimnasio' },
    { value: 'salud', label: '🏥 Salud' },
    { value: 'viajes', label: '✈️ Viajes' },
    { value: 'ocio', label: '🎉 Ocio' },
    { value: 'otro', label: '📝 Otro' }
  ];

  // Estado para categorías dinámicas
  const [categorias, setCategorias] = useState(categoriasBase);

  const cargarGastos = () => {
    const gastosGuardados = JSON.parse(localStorage.getItem('gastos') || '[]');
    const gastosOrdenados = gastosGuardados.sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    setGastos(gastosOrdenados);
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.categoria || !formData.monto) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const gastosGuardados = JSON.parse(localStorage.getItem('gastos') || '[]');
    const nuevoGasto = {
      id: Date.now(),
      ...formData,
      tipo: 'gasto',
      monto: parseFloat(formData.monto)
    };

    gastosGuardados.push(nuevoGasto);
    localStorage.setItem('gastos', JSON.stringify(gastosGuardados));
    
    // Reset form
    setFormData({
      categoria: '',
      monto: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setMostrarFormulario(false);
    cargarGastos();
  };

  const abrirModalEliminar = (gasto) => {
    setGastoAEliminar(gasto);
    setModalOpen(true);
  };

  const confirmarEliminar = () => {
    const gastosActualizados = gastos.filter(g => g.id !== gastoAEliminar.id);
    localStorage.setItem('gastos', JSON.stringify(gastosActualizados));
    setGastos(gastosActualizados);
    setModalOpen(false);
    setGastoAEliminar(null);
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

  const totalGastos = totalFiltrado !== null ? totalFiltrado : gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const cantidadGastos = cantidadFiltrada !== null ? cantidadFiltrada : gastos.length;

  return (
    <main className="wrapper">
      <h1 style={{ textAlign: 'center' }}>Gestión de Gastos</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Controla tus gastos de manera efectiva
      </p>

      <CardResumen 
        tipo="gastos"
        total={totalGastos}
        cantidad={cantidadGastos}
        mensaje="✨ Registra tu movimiento, pequeño impulso = gran cambio."
        mostrarFormulario={mostrarFormulario}
        onToggleFormulario={() => setMostrarFormulario(!mostrarFormulario)}
        esPeriodoFiltrado={totalFiltrado !== null}
      />

      {/* Formulario (condicional) */}
      {mostrarFormulario && (
        <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Nuevo Gasto</h3>

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
                    fontSize: '22px',
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
                  background: 'linear-gradient(180deg, #2BE3FF 0%, #12B4D6 100%)',
                  color: '#00222F',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                💾 Guardar Gasto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial con gráfica */}
      <HistorialFiltrado 
        type="expense" 
        onDelete={abrirModalEliminar}
        data={gastos}
        onTotalChange={(total, cantidad) => {
          setTotalFiltrado(total);
          setCantidadFiltrada(cantidad);
        }}
      />

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        mensaje="Este gasto se eliminará permanentemente."
      />
    </main>
  );
}

export default Gastos;