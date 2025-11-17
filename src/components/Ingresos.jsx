import { useState, useEffect } from 'react';
import ModalConfirmacion from './ModalConfirmacion';
import CardResumen from './CardResumen';
import HistorialFiltrado from './HistorialFiltrado';


function Ingresos() {
  const [ingresos, setIngresos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [ingresoAEliminar, setIngresoAEliminar] = useState(null);
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
    { value: 'sueldo', label: '💼 Sueldo' },
    { value: 'freelance', label: '💻 Freelance' },
    { value: 'comisiones', label: '💰 Comisiones' },
    { value: 'dividendos', label: '📈 Dividendos' },
    { value: 'otro', label: '📝 Otro' }
  ];

  // Estado para categorías dinámicas
  const [categorias, setCategorias] = useState(categoriasBase);

  const cargarIngresos = () => {
    const ingresosGuardados = JSON.parse(localStorage.getItem('ingresos') || '[]');
    const ingresosOrdenados = ingresosGuardados.sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
    setIngresos(ingresosOrdenados);
  };

  useEffect(() => {
    cargarIngresos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.categoria || !formData.monto) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const ingresosGuardados = JSON.parse(localStorage.getItem('ingresos') || '[]');
    const nuevoIngreso = {
      id: Date.now(),
      ...formData,
      tipo: 'ingreso',
      monto: parseFloat(formData.monto)
    };

    ingresosGuardados.push(nuevoIngreso);
    localStorage.setItem('ingresos', JSON.stringify(ingresosGuardados));
    
    // Reset form
    setFormData({
      categoria: '',
      monto: '',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setMostrarFormulario(false);
    cargarIngresos();
  };

  const abrirModalEliminar = (ingreso) => {
    setIngresoAEliminar(ingreso);
    setModalOpen(true);
  };

  const confirmarEliminar = () => {
    const ingresosActualizados = ingresos.filter(i => i.id !== ingresoAEliminar.id);
    localStorage.setItem('ingresos', JSON.stringify(ingresosActualizados));
    setIngresos(ingresosActualizados);
    setModalOpen(false);
    setIngresoAEliminar(null);
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      // Agregar la nueva categoría a la lista
      const nuevaCategoria = {
        value: customCategory.toLowerCase().replace(/\s+/g, '-'),
        label: `✨ ${customCategory}`
      };
      setCategorias([...categorias, nuevaCategoria]);
      
      // Seleccionar la nueva categoría
      setFormData({ ...formData, categoria: customCategory });
      setShowCustomCategory(false);
      setCustomCategory('');
    }
  };

  const getCategoriaEmoji = (categoria) => {
    const emojis = {
      'sueldo': '💼',
      'freelance': '💻',
      'comisiones': '💰',
      'dividendos': '📈',
      'otro': '📝'
    };
    return emojis[categoria] || '💵';
  };

  const totalIngresos = totalFiltrado !== null 
  ? totalFiltrado 
  : ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
  const cantidadIngresos = cantidadFiltrada !== null ? cantidadFiltrada : ingresos.length;


  return (
    <main className="wrapper">
      <h1 style={{ textAlign: 'center' }}>Gestión de Ingresos</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Registra tus fuentes de ingreso
      </p>

  <CardResumen 
    tipo="ingresos"
    total={totalIngresos}
    cantidad={cantidadIngresos}
    mensaje="💚 Cada ingreso es un paso hacia la abundancia. ¡Celebra tus logros!"
    mostrarFormulario={mostrarFormulario}
    onToggleFormulario={() => setMostrarFormulario(!mostrarFormulario)}
    esPeriodoFiltrado={totalFiltrado !== null}
  />

      {/* Formulario (condicional) */}
      {mostrarFormulario && (
        <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Nuevo Ingreso</h3>

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
                  background: 'rgba(74, 222, 128, 0.1)',
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
                        background: '#4ADE80',
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
                  background: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
                  color: '#00222F',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                💾 Guardar Ingreso
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Historial con gráfica */}
      <HistorialFiltrado 
        type="income" 
        onDelete={abrirModalEliminar}
        data={ingresos}
        onTotalChange={(total, cantidad) => {
          setTotalFiltrado(total);
          setCantidadFiltrada(cantidad);
        }}
      />

      <ModalConfirmacion
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmarEliminar}
        mensaje="Este ingreso se eliminará permanentemente."
      />
    </main>
  );
}

export default Ingresos;