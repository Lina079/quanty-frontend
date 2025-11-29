import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useContext } from 'react';
import { CurrentUserContext } from '../../contexts/CurrentUserContext';
import './../../blocks/login.css';
import quantumHalf from '../../images/Quantum-allBody.png';
import quantumHalfLight from '../../images/theme-light-images/quantum-fullbody-theme-light.png';
import logoQuanty from '../../images/quanty-logo-gold.png';
import * as MainApi from '../../utils/MainApi';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';

function Login() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { login } = useContext(CurrentUserContext);
    const { theme } = useSettings();
    const { t, randomTip } = useLanguage();

// ========== ESTADOS DEL FORMULARIO ==========
  // Estos estados guardan lo que el usuario escribe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estos estados guardan los mensajes de error
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Este estado indica si estamos esperando respuesta del servidor
  const [isLoading, setIsLoading] = useState(false);

  // Este estado guarda errores que vienen del servidor (ej: credenciales incorrectas)
  const [serverError, setServerError] = useState('');

  // ========== TIPS FINANCIEROS ALEATORIOS ==========
  const [tipActual] = useState(() => randomTip());

  // ========== FUNCIONES DE VALIDACIÓN ==========
  
  /**
   * Valida que el email tenga formato correcto
   * @param {string} email - Email a validar
   * @returns {boolean} - true si es válido, false si no
   */
  const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Valida que la contraseña sea alfanumérica
   * Debe contener al menos 8 caracteres, letras Y números
   * @param {string} password - Contraseña a validar
   * @returns {boolean} - true si es válida, false si no
   */
  const validarPasswordAlfanumerica = (password) => {
    // Verificar longitud mínima
    if (password.length < 8) return false;
    
    // Verificar que tenga al menos una letra
    const tieneLetras = /[a-zA-Z]/.test(password);
    
    // Verificar que tenga al menos un número
    const tieneNumeros = /[0-9]/.test(password);
    
    // Debe cumplir ambas condiciones
    return tieneLetras && tieneNumeros;
  };

  // ========== MANEJADORES DE EVENTOS ==========

  /**
   * Se ejecuta cada vez que el usuario escribe en el campo de email
   * Actualiza el estado y valida en tiempo real
   */
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Validar solo si el usuario ha empezado a escribir
    if (value.length > 0) {
      if (!validarEmail(value)) {
        setEmailError(t('validation.invalidEmail'));
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  };

  /**
   * Se ejecuta cada vez que el usuario escribe en el campo de contraseña
   * Actualiza el estado y valida en tiempo real
   */
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Validar solo si el usuario ha empezado a escribir
    if (value.length > 0) {
      if (!validarPasswordAlfanumerica(value)) {
        setPasswordError(t('validation.passwordRequirements'));
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  };

  /**
   * Determina si el botón "Entrar" debe estar habilitado
   * Verifica que todos los campos sean válidos
   * @returns {boolean} - true si todo es válido, false si no
   */
  const isFormValid = () => {
    return (
      email.length > 0 &&
      password.length > 0 &&
      validarEmail(email) &&
      validarPasswordAlfanumerica(password) &&
      !emailError &&
      !passwordError
    );
  };

  /**
   * Se ejecuta cuando el usuario hace click en "Entrar"
   * Envía los datos al servidor (cuando conectemos el backend)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar validez antes de enviar
    if (!isFormValid()) return;
    
    setIsLoading(true);
    setServerError('');
    
    try {
     //llamar al backend real
      const response = await MainApi.signin(email, password);

      //Guardar token en localStorage
      localStorage.setItem('jwt', response.token);

      const userData = await MainApi.getCurrentUser(response.token);

      showToast((t('auth.loginSuccess')), 'success');
      
      setTimeout(() => {
        login(userData, response.token);
      }, 1000);

    } catch(error) {
      console.error('Error en login:', error);
      setServerError(error || t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RENDER DEL COMPONENTE ==========
  return (
    <div className="login-page" data-theme={theme}>
      <div className="login-container">
        
        {/* Logo de Quanty */}
        <div className="login-header">
          <img src={logoQuanty} alt="Quanty logo" className="login-header-logo" />
          <h1 className="login-header-title">QUANTY</h1>
        </div>

        {/* Saludo */}
        <h2 className="login-subtitle">{t('auth.welcomeBack')}</h2>

        {/* Layout: Quantum (secundario) + Formulario (protagonista) */}
        <div className="login-main-layout">
          
          {/* Quantum con tip (lado izquierdo, secundario) */}
          <div className="login-quantum-side">
            <div className="login-tip-bubble">
              <p>{tipActual}</p>
            </div>
            <img 
              src={theme === 'light' ? quantumHalfLight : quantumHalf} 
              alt="Quantum" 
              className="login-quantum-character"
            />
          </div>
        {/*formulario (lado derecho, protagonista)*/}
        <div className="login-form-side">
        {/* Formulario de login */}
        <form className="login-form" onSubmit={handleSubmit}>
          
          {/* Campo de Correo Electrónico */}
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              className={`login-input ${emailError ? 'login-input-error' : ''}`}
              value={email}
              onChange={handleEmailChange}
              placeholder={t('auth.emailPlaceholder')}
              disabled={isLoading}
            />
            {/* Mostrar error de email si existe */}
            {emailError && (
              <span className="login-error-message">{emailError}</span>
            )}
          </div>

          {/* Campo de Contraseña */}
          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              className={`login-input ${passwordError ? 'login-input-error' : ''}`}
              value={password}
              onChange={handlePasswordChange}
              placeholder={t('auth.passwordPlaceholder')}
              disabled={isLoading}
            />
            {/* Mostrar error de contraseña si existe */}
            {passwordError && (
              <span className="login-error-message">{passwordError}</span>
            )}
          </div>

          {/* Mostrar error del servidor si existe */}
          {serverError && (
            <div className="login-server-error">
              {serverError}
            </div>
          )}

          {/* Botón de Entrar */}
          <button
            type="submit"
            className="login-button"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? `${t('common.loading')}...` : t('auth.loginButton')}
          </button>
        </form>
        {/* Links de navegación */}
        <div className="login-links">
          <p>
            {t('auth.noAccount')}{' '}
            <span 
              className="login-link"
              onClick={() => navigate('/register')}
            >
              {t('auth.register')}
            </span>
          </p>
          <p>
            <span 
              className="login-link"
              onClick={() => navigate('/recuperar-cuenta')}
            >
              {t('auth.recoverAccount')}
            </span>
          </p>
        </div>
    </div>
    </div>
    </div>
    </div>
  );
}

export default Login;



