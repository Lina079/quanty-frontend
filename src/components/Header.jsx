import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const userName = "Marí Carmen";
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
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
        
        <span style={{
          color: 'var(--cyan-accent)',
          fontWeight: '700',
          marginLeft: '16px'
        }}>
          {userName}
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
          gap: '20',
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
        
        <div style={{
          padding: '16px 0',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
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
            margin: '8px 0 0'
          }}>
            {userName}
          </p>
        </div>
      </nav>
    </header>
  );
}

export default Header;