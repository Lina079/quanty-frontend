import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import quantumHalf from '../../images/quantum_half_fade_256x256.png';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function Transacciones() {
  const navigate = useNavigate();

// Estados para selector de periodo
const fechaActual = new Date();
const [mesSeleccionado, setMesSeleccionado] = useState (fechaActual.getMonth());
const [añoSeleccionado, setAñoSeleccionado] = useState(fechaActual.getFullYear());
const [tipoVista, setTipoVista] = useState('mes');
const { formatCurrency } = useSettings();

//función para filtrar transacciones por mes y año específicos
const filtrarPorPeriodo = (transacciones) => {
  return transacciones.filter(transaccion => {
    const fecha = new Date(transaccion.fecha);
    if (tipoVista === 'mes') {
      return fecha.getMonth() === mesSeleccionado &&
             fecha.getFullYear() === añoSeleccionado;
    } else {
      return fecha.getFullYear() === añoSeleccionado;
    }  
  });
};

  // Calcular totales desde localStorage
  const calcularTotales = () => {
    const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');
    const ingresos = JSON.parse(localStorage.getItem('ingresos') || '[]');
    const ahorros = JSON.parse(localStorage.getItem('ahorros') || '[]');
    const inversiones = JSON.parse(localStorage.getItem('inversiones') || '[]');

    //Filtrar por periodo seleccionado
    const gastosFiltrados = filtrarPorPeriodo(gastos);
    const ingresosFiltrados = filtrarPorPeriodo(ingresos);
    const ahorrosFiltrados = filtrarPorPeriodo(ahorros);
    const inversionesFiltradas = filtrarPorPeriodo(inversiones);

    //Calcular totales
    const totalGastos = gastosFiltrados.reduce((sum, g) => sum + g.monto, 0);
    const totalIngresos = ingresosFiltrados.reduce((sum, i) => sum + i.monto, 0);
    const totalAhorros = ahorrosFiltrados.reduce((sum, a) => sum + a.monto, 0);
    const totalInversiones = inversionesFiltradas.reduce((sum, inv) => sum + inv.monto, 0);

    return {
      gastos: totalGastos,
      ingresos: totalIngresos,
      ahorro: totalAhorros,
      inversion: totalInversiones
    };
  };

  const totales = calcularTotales();

  // Calcular datos para la gráfica dona
const calcularDatosGrafica = () => {
  const totalIngresos = totales.ingresos;
  
  // Si no hay ingresos, retornar array vacío
  if (totalIngresos === 0) {
    return [];
  }
  
  // Calcular porcentajes
  const porcentajeGastos = (totales.gastos / totalIngresos) * 100;
  const porcentajeAhorros = (totales.ahorro / totalIngresos) * 100;
  const porcentajeInversiones = (totales.inversion / totalIngresos) * 100;
  
  return [
    {
      name: 'Gastos',
      value: totales.gastos,
      porcentaje: porcentajeGastos,
      color: '#EF4444'
    },
    {
      name: 'Ahorros',
      value: totales.ahorro,
      porcentaje: porcentajeAhorros,
      color: '#38E1FF'
    },
    {
      name: 'Inversiones',
      value: totales.inversion,
      porcentaje: porcentajeInversiones,
      color: '#8B5CF6'
    }
  ];
};

  const datosGrafica = calcularDatosGrafica();

  return (
    <main className="wrapper">
      <h1 style={{ textAlign: 'center' }}>🔍 Panorama Financiero</h1>
      <p className="subtitle" style={{ textAlign: 'center' }}>
        Visualiza y analiza tus finanzas en detalle
      </p>

      {/* Quantum con mensaje */}
      <div style={{ 
        position: 'relative',
        maxWidth: '800px',
        margin: '0 auto 40px'
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
            🌟 Tu panorama financiero en una vista. ¡El conocimiento es poder!
          </p>
        </div>
      </div>

    {/* Selector de período - Mes y Año */}
    <div className="periodo-selector" style={{
    maxWidth: '800px',
    margin: '0 auto 40px',
    padding: '24px',
    background: 'linear-gradient(160deg, rgba(14,49,71,.85) 0%, rgba(11,36,54,.85) 100%)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,.08)'
  }}>
  <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
    📅 Selecciona el período a visualizar
  </h3>
  {/* Botones de tipo de vista */}
<div className="tipo-vista-selector" style={{
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginBottom: '24px'
}}>
  <button
    onClick={() => setTipoVista('mes')}
    style={{
      padding: '10px 24px',
      borderRadius: '10px',
      border: tipoVista === 'mes' 
        ? '2px solid var(--cyan-accent)' 
        : '1px solid rgba(255,255,255,.2)',
      background: tipoVista === 'mes' 
        ? 'rgba(56, 225, 255, 0.2)' 
        : 'rgba(14,49,71,.5)',
      color: tipoVista === 'mes' ? 'var(--cyan-accent)' : 'var(--text-primary)',
      fontSize: '15px',
      fontWeight: tipoVista === 'mes' ? '700' : '500',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s'
    }}
  >
    📅 Mes específico
  </button>  
  <button
    onClick={() => setTipoVista('año')}
    style={{
      padding: '10px 24px',
      borderRadius: '10px',
      border: tipoVista === 'año' 
        ? '2px solid var(--cyan-accent)' 
        : '1px solid rgba(255,255,255,.2)',
      background: tipoVista === 'año' 
        ? 'rgba(56, 225, 255, 0.2)' 
        : 'rgba(14,49,71,.5)',
      color: tipoVista === 'año' ? 'var(--cyan-accent)' : 'var(--text-primary)',
      fontSize: '15px',
      fontWeight: tipoVista === 'año' ? '700' : '500',
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: 'all 0.2s'
    }}
  >
    📊 Año completo
  </button>
</div>
  
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  }}>
    {/* Selector de Mes - Solo visible si tipo de vista es 'mes' */}
    {tipoVista === 'mes' && (
    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: '600',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        Mes:
      </label>
      <select
        className="selector-mes"
        value={mesSeleccionado}
        onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,.2)',
          background: 'rgba(14,49,71,.5)',
          color: 'var(--text-primary)',
          fontSize: '16px',
          fontWeight: '600',
          fontFamily: 'inherit',
          cursor: 'pointer'
        }}
      >
        <option value={0}>Enero</option>
        <option value={1}>Febrero</option>
        <option value={2}>Marzo</option>
        <option value={3}>Abril</option>
        <option value={4}>Mayo</option>
        <option value={5}>Junio</option>
        <option value={6}>Julio</option>
        <option value={7}>Agosto</option>
        <option value={8}>Septiembre</option>
        <option value={9}>Octubre</option>
        <option value={10}>Noviembre</option>
        <option value={11}>Diciembre</option>
      </select>
    </div>
    )}

    {/* Selector de Año */}
    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: '600',
        fontSize: '14px',
        color: 'var(--text-secondary)'
      }}>
        Año:
      </label>
      <select
        className="selector-año"
        value={añoSeleccionado}
        onChange={(e) => setAñoSeleccionado(parseInt(e.target.value))}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,.2)',
          background: 'rgba(14,49,71,.5)',
          color: 'var(--text-primary)',
          fontSize: '16px',
          fontWeight: '600',
          fontFamily: 'inherit',
          cursor: 'pointer'
        }}
      >
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
        <option value={2026}>2026</option>
      </select>
      </div>
      </div>
      </div>

      <div className="cards" style={{ marginTop: '40px' }}>
        {/* Card Gastos */}
        <div 
          className="card"
          onClick={() => navigate('/gastos')}
          style={{ cursor: 'pointer' }}
        >
          <h3>💸 Gastos Totales</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#EF4444', marginTop: '16px' }}>
            {formatCurrency(totales.gastos)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            👉 Ver detalle
          </p>
        </div>

        {/* Card Ingresos */}
        <div 
          className="card"
          onClick={() => navigate('/ingresos')}
          style={{ cursor: 'pointer' }}
        >
          <h3>💰 Ingresos Totales</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#4ADE80', marginTop: '16px' }}>
            {formatCurrency(totales.ingresos)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            👉 Ver detalle
          </p>
        </div>

        {/* Card Ahorro */}
        <div 
          className="card"
          onClick={() => navigate('/ahorros')}
          style={{ cursor: 'pointer' }}
        >
          <h3>🏦 Ahorro Total</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', color: 'var(--cyan-accent)', marginTop: '16px' }}>
            {formatCurrency(totales.ahorro)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            👉 Ver detalle
          </p>
        </div>

        {/* Card Inversión */}
        <div 
          className="card"
          onClick={() => navigate('/inversiones')}
          style={{ cursor: 'pointer' }}
        >
          <h3>📈 Inversión Total</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#FFD700', marginTop: '16px' }}>
            {formatCurrency(totales.inversion)}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            👉 Ver portfolio
          </p>
        </div>
      </div>
        {/* Gráfica Dona - Distribución de Ingresos */}
{datosGrafica.length > 0 && (
  <div className="grafica-dona-container" style={{
    maxWidth: '800px',
    margin: '40px auto 0',
    padding: '32px 24px',
    background: 'linear-gradient(160deg, rgba(14,49,71,.85) 0%, rgba(11,36,54,.85) 100%)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,.08)'
  }}>
    <h3 style={{ 
      textAlign: 'center', 
      marginBottom: '24px',
      fontSize: '22px'
    }}>
      📊 ¿Cómo usas tus ingresos?
    </h3>
    
    {/* Dona */}
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={datosGrafica}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {datosGrafica.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: '#0B2436',
            border: '2px solid var(--cyan-accent)',
            borderRadius: '12px',
            padding: '12px'
          }}
          labelStyle={{
          color: '#FFFFFF',
          fontWeight: '700'
          }}
          itemStyle={{
          color: 'var(--cyan-accent)',
          fontWeight: '600'
          }}
          formatter={(value) => formatCurrency(value)}
        />
      </PieChart>
    </ResponsiveContainer>

    {/* Tabla de datos - Visible siempre */}
    <div className="tabla-distribucion" style={{
      marginTop: '32px',
      display: 'grid',
      gap: '12px'
    }}>
      {datosGrafica.map((item, index) => (
        <div 
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: 'rgba(14,49,71,.5)',
            borderRadius: '12px',
            borderLeft: `4px solid ${item.color}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: item.color
            }}></div>
            <span style={{ fontWeight: '700', fontSize: '16px' }}>
              {item.name}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '800',
              color: item.color
            }}>
              {formatCurrency(item.value)}
            </div>
            <div style={{ 
              fontSize: '18px',
              fontWeith: '700',
              color: 'var(--text-secondary)',
              marginTop: '4px'
            }}>
              {item.porcentaje.toFixed(1)}% del ingreso
            </div>
            </div>
            </div>
            ))}
          </div>
          </div>
            )}
      </main>
  );
}

export default Transacciones;