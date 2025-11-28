import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { CurrentUserContext } from '../../contexts/CurrentUserContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ModalEditarNombre from './ModalEditarNombre';
import editIcon from '../../images/lapiz_edit_name.png';
import editIconLight from '../../images/theme-light-images/quanty_edit_pencil_light.png';
import logo from '../../images/quanty-logo-gold.png';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useContext(CurrentUserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalNombreOpen, setModalNombreOpen] = useState(false);
  const { theme } = useSettings();
  const { t } = useLanguage();
  
  
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
    // TODO: Cuando conectemos backend, actualizar nombre en el servidor
    // const updatedUser = { ...currentUser, name: nuevoNombre };
    // await MainApi.updateUser(updatedUser);
    
    // Por ahora, actualizar solo en localStorage
    const updatedUserData = { ...currentUser, name: nuevoNombre };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    
    // Recargar para que el contexto cargue el nombre actualizado
    window.location.reload();
    
    setModalNombreOpen(false);
  };

  const handleCerrarSesion = () => {
    logout();
  };

  // Helper para saber si un link está activo
  const isActive = (path) => location.pathname === path;

  const navLinks = [
  { path: '/dashboard', label: t('nav.dashboard') },
  { path: '/ingresos', label: t('nav.income') },
  { path: '/gastos', label: t('nav.expenses') },
  { path: '/ahorros', label: t('nav.savings') },
  { path: '/inversiones', label: t('nav.investments') }
  ];

  return (
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px clamp(16px, 4vw, 40px)',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Logo + Texto QUANTY - CLICKEABLE */}
        <div 
          onClick={() => {
            navigate('/');
            closeMenu();
          }}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            cursor: 'pointer'
          }}
        >
          <img 
            src={logo} 
            alt="Quanty Logo" 
            style={{ 
              width: '32px', 
              height: '32px',
              filter: 'drop-shadow(0 2px 8px rgba(56, 225, 255, 0.3))'
            }} 
          />
          <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '800',
              ...(theme === 'light' 
              ? { color: '#1E3A5F' }
              : {
                  background: 'linear-gradient(135deg, #38E1FF 0%, #2BE3FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }
              ),
              margin: 0
            }}>
              QUANTY
          </h2>
        </div>

        {/* Botón Hamburguesa - Solo móvil */}
        <button
          type="button"
          className="header__burger"
          aria-label="Abrir menú"
          aria-controls="header-mobile"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navegación Desktop */}
        <nav 
          className="desktop-nav"
          style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center' 
          }}
        >
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path}
              style={{
                color: isActive(link.path) ? 'var(--cyan-accent)' : 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: isActive(link.path) ? '700' : '600',
                transition: 'color 0.2s',
                position: 'relative',
                paddingBottom: '4px',
                borderBottom: isActive(link.path) ? '2px solid var(--cyan-accent)' : '2px solid transparent'
              }}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Botón Settings */}
          <Link 
            to="/settings"
            style={{
            color: isActive('/settings') ? 'var(--cyan-accent)' : 'var(--text-primary)',
            textDecoration: 'none',
            fontWeight: isActive('/settings') ? '700' : '600',
            transition: 'color 0.2s',
            position: 'relative',
            paddingBottom: '4px',
            borderBottom: isActive('/settings') ? '2px solid var(--cyan-accent)' : '2px solid transparent',
            fontSize: '20px'
          }}
          title={t('nav.settings')}
          >
            ⚙️
          </Link>

          {/* Separador */}
          <div style={{ 
            width: '1px', 
            height: '24px', 
            background: 'rgba(255,255,255,0.2)',
            margin: '0 8px'
          }} />
          
          {/* Nombre clickeable con lápiz */}
          <span 
            onClick={handleAbrirModalNombre}
            style={{
              color: 'var(--cyan-accent)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
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
            {currentUser?.name || 'Usuario'}
            <img 
              src={theme === 'light' ? editIconLight : editIcon} 
              alt="Editar" 
              style={{ width: '18px', height: '18px', opacity: 0.8 }} 
            />
          </span>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleCerrarSesion}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            {t('nav.logout')}
          </button>
        </nav>

        {/* Navegación Mobile - Overlay */}
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

        {/* Navegación Mobile - Menú desplegable */}
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
          {navLinks.map(link => (
            <Link 
              key={link.path}
              to={link.path}
              onClick={closeMenu}
              style={{
                color: isActive(link.path) ? 'var(--cyan-accent)' : 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: isActive(link.path) ? '700' : '600',
                fontSize: '18px',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                transition: 'color 0.2s'
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Settings en móvil */}
            <Link 
              to="/settings"
              onClick={closeMenu}
              style={{
              color: isActive('/settings') ? 'var(--cyan-accent)' : 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: isActive('/settings') ? '700' : '600',
              fontSize: '18px',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              transition: 'color 0.2s',
            }}
            >
            ⚙️ {t('nav.settings')}
            </Link>
          
          {/* Nombre clickeable en móvil */}
          <div 
            onClick={handleAbrirModalNombre}
            style={{
              padding: '16px 0',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              {t('common.user')}
            </span>
            <p style={{
              color: 'var(--cyan-accent)',
              fontWeight: '700',
              fontSize: '16px',
              margin: '8px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              {currentUser?.name || 'Usuario'}
              <img 
                src={theme === 'light' ? editIconLight : editIcon} 
                alt="Editar" 
                style={{ width: '16px', height: '16px', opacity: 0.8 }} 
              />
            </p>
          </div>

          {/* Botón Cerrar Sesión en móvil */}
          <button
            className="btn-logout"
            onClick={() => {
              closeMenu();
              handleCerrarSesion();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {t('nav.logout')}
          </button>
        </nav>
      </header>

      {/* Modal para editar nombre */}
      <ModalEditarNombre
        isOpen={modalNombreOpen}
        onClose={() => setModalNombreOpen(false)}
        onSave={handleGuardarNombre}
        nombreActual={currentUser?.name || 'Usuario'}
      />
    </>
  );
}

export default Header;