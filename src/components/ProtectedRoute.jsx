import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

/**
 * ProtectedRoute - Protege rutas que requieren autenticación
 * Si hay sesión activa → Muestra el componente
 * Si NO hay sesión → Redirige al login
 */
function ProtectedRoute({ children }) {
  const { currentUser, isCheckingToken } = useContext(CurrentUserContext);

  // Mientras verifica el token, mostrar loading
  if (isCheckingToken) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(160deg, #001F2F 0%, #00222F 100%)',
        color: 'var(--cyan-accent)',
        fontSize: '20px',
        fontWeight: '700'
      }}>
        Verificando sesión...
      </div>
    );
  }

  // Si no hay usuario logueado, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, mostrar el contenido protegido
  return children;
}

export default ProtectedRoute;