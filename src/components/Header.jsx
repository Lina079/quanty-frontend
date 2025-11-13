import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const userName = "Marí Carmen"; // Hardcodeado por ahora

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px clamp(16px, 4vw, 40px)',
      maxWidth: '1080px',
      margin: '0 auto'
    }}>
      {/* Logo - clickeable */}
      <h2 
        onClick={() => navigate('/')}
        style={{ 
        fontSize: '24px', 
        fontWeight: '800',
        background: 'linear-gradient(135deg, #38E1FF 0%, #2BE3FF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0,
        cursor: 'pointer' //agregado
      }}>
        QUANTY
      </h2>

      {/* Navegación */}
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/" style={{
          color: 'var(--text-primary)',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'color 0.2s'
        }}>
          Inicio
        </Link>

        {/* Nombre de usuario */}
        <span style={{
          color: 'var(--cyan-accent)',
          fontWeight: '700',
          marginLeft: '16px'
        }}>
          {userName}
        </span>
      </nav>
    </header>
  );
}

export default Header;