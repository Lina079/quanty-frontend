import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Crear el contexto
export const CurrentUserContext = createContext();

// Componente Provider que envuelve la app y provee el contexto
export function CurrentUserProvider({ children }) {
  const navigate = useNavigate();
  
  // Estado del usuario actual (null = no hay sesión)
  const [currentUser, setCurrentUser] = useState(null);
  
  // Estado de carga (mientras verifica token)
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // ========== FUNCIONES DEL CONTEXTO ==========

  /**
   * Guarda el usuario y el token al hacer login
   * @param {object} userData - Datos del usuario { name, email, id }
   * @param {string} token - Token JWT del backend
   */
  const login = (userData, token) => {
    // Guardar token en localStorage (persiste aunque cierres el navegador)
    localStorage.setItem('jwt', token);
    
    // Guardar usuario en el estado
    setCurrentUser(userData);
    
    // Redirigir al dashboard
    navigate('/dashboard');
  };

  /**
   * Cierra la sesión del usuario
   */
  const logout = () => {
    // Borrar token del localStorage
    localStorage.removeItem('jwt');
    
    // Borrar usuario del estado
    setCurrentUser(null);
    
    // Redirigir al login
    navigate('/login');
  };

  /**
   * Verifica si hay un token guardado al cargar la app
   * Si hay token válido, carga los datos del usuario
   */
  const checkToken = async () => {
    // Buscar token en localStorage
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      // No hay token → no hay sesión
      setIsCheckingToken(false);
      return;
    }

    try {
      // TODO: Cuando conectemos backend, verificar token con el servidor
      // const response = await MainApi.checkToken(token);
      // setCurrentUser(response.user);
      
      // ===== SIMULACIÓN TEMPORAL (borrar cuando conectemos backend) =====
      // Simular que el token es válido
      setCurrentUser({
        name: 'Usuario Demo',
        email: 'demo@quanty.com',
        id: '123'
      });
      
    } catch (error) {
      // Token inválido o expirado → borrar
      console.error('Token inválido:', error);
      localStorage.removeItem('jwt');
    } finally {
      // Terminar verificación
      setIsCheckingToken(false);
    }
  };
  // Verificar token cuando se carga la app
  useEffect(() => {
    checkToken();
  }, []);

  // Si está verificando token, mostrar pantalla de carga
  if (isCheckingToken) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(160deg, #001F2F 0%, #00222F 100%)',
        color: 'var(--cyan-accent)',
        fontSize: '24px',
        fontWeight: '700'
      }}>
        Cargando...
      </div>
    );
  }

  // Proveer el contexto a los componentes hijos
  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isLoggedIn: currentUser !== null
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}
