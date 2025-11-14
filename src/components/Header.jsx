import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ModalEditarNombre from './ModalEditarNombre';
import editIcon from '../images/lapiz_edit_name.png';

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalNombreOpen, setModalNombreOpen] = useState(false);
  const [userName, setUserName] = useState("Marí Carmen");

   
  // Cargar nombre desde localStorage al montar
useEffect(() => {
  const nombreGuardado = localStorage.getItem('userName');
  if (nombreGuardado) {
    setUserName(nombreGuardado);
  }
}, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleAbrirModalNombre = () => {
    setModalNombreOpen(true);
  };

  const handleGuardarNombre = (nuevoNombre) => {
  setUserName(nuevoNombre);
  localStorage.setItem('userName', nuevoNombre);
  setModalNombreOpen(false);
  
  // Disparar evento para actualizar otros componentes
  window.dispatchEvent(new Event('userNameChanged'));

  };

  return (
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px clamp(16px, 4vw, 40px)',
        maxWidth: '1080px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Logo - CLICKEABLE */}
        <h2 
          onClick={() => {
            navigate('/');
            closeMenu();
          }}
          style={{ 
            fontSize: '24px', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #38E1FF 0%, #2BE3FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            cursor: 'pointer'
          }}>
          QUANTY
        </h2>

        {/* Botón Hamburguesa - Solo móvil */}
        <button
          onClick={toggleMenu}
          className="hamburger-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '38px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '8px 12px',
            zIndex: 1001,
            minWidth: '48px',
            minHeight: '48px'
          }}
          aria-label="Menú"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Navegación Desktop */}
        <nav 
          className="desktop-nav"
          style={{ 
            display: 'flex', 
            gap: '24px', 
            alignItems: 'center' 
          }}
        >
          <Link 
            to="/" 
            style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
          >
            Inicio
          </Link>
          
          {/* Nombre clickeable con lápiz */}
          <span 
            onClick={handleAbrirModalNombre}
            style={{
              color: 'var(--cyan-accent)',
              fontWeight: '700',
              marginLeft: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(56, 225, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {userName}
            <img src={editIcon} alt="Editar" style={{ width: '22px', height: '22px', opacity: 0.8 }} />
          </span>
        </nav>

        {/* Navegación Mobile - Menú desplegable */}
        {menuOpen && (
          <div 
            className="mobile-menu-overlay"
            onClick={closeMenu}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 999,
              display: 'none'
            }}
          />
        )}

        <nav 
          className="mobile-nav"
          style={{
            position: 'fixed',
            top: 0,
            right: menuOpen ? 0 : '-100%',
            width: '70%',
            maxWidth: '300px',
            height: '100vh',
            background: 'linear-gradient(180deg, var(--bg-2) 0%, var(--bg-1) 100%)',
            padding: '80px 32px 32px',
            display: 'none',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
            zIndex: 1000,
            transition: 'right 0.3s ease'
          }}
        >
          <Link 
            to="/" 
            onClick={closeMenu}
            style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '18px',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              transition: 'color 0.2s'
            }}
          >
            Inicio
          </Link>
          
          {/* Nombre clickeable en móvil */}
          <div 
            onClick={handleAbrirModalNombre}
            style={{
              padding: '16px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}
          >
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              Usuario
            </span>
            <p style={{
              color: 'var(--cyan-accent)',
              fontWeight: '700',
              fontSize: '16px',
              margin: '8px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {userName}
              <img src={editIcon} alt="Editar" style={{ width: '16px', height: '16px', opacity: 0.8 }} />
            </p>
          </div>
        </nav>
      </header>

      {/* Modal para editar nombre */}
      <ModalEditarNombre
        isOpen={modalNombreOpen}
        onClose={() => setModalNombreOpen(false)}
        onSave={handleGuardarNombre}
        nombreActual={userName}
      />
    </>
  );
}

export default Header;