import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useContext } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { CurrentUserContext } from '../../contexts/CurrentUserContext';
import './../../blocks/login.css';
import quantumFull from '../../images/Quantum-allBody.png';
import quantumHalfLight from '../../images/theme-light-images/quantum-fullbody-theme-light.png';
import logoQuanty from '../../images/quanty-logo-gold.png';
import * as MainApi from '../../utils/MainApi';

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login } = useContext(CurrentUserContext);
  const { theme } = useSettings();
  const { t, randomTip } = useLanguage();

  // ========== ESTADOS DEL FORMULARIO ==========
  // Estados para los valores de los campos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  // Estados para los mensajes de error de cada campo
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  // Estado de carga mientras se registra
  const [isLoading, setIsLoading] = useState(false);

  // Error del servidor (ej: "Email ya registrado")
  const [serverError, setServerError] = useState('');

  // ========== TIPS FINANCIEROS ALEATORIOS ==========
  // Array de consejos que Quantum mostrará
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
    if (password.length < 8) return false;
    const tieneLetras = /[a-zA-Z]/.test(password);
    const tieneNumeros = /[0-9]/.test(password);
    return tieneLetras && tieneNumeros;
  };

  /**
   * Valida que el nombre tenga entre 2 y 30 caracteres
   * @param {string} name - Nombre a validar
   * @returns {boolean} - true si es válido, false si no
   */
  const validarNombre = (name) => {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 30;
  };

  /**
   * Valida que las dos contraseñas coincidan
   * @param {string} password - Contraseña original
   * @param {string} confirm - Confirmación de contraseña
   * @returns {boolean} - true si coinciden, false si no
   */
  const validarPasswordsCoinciden = (password, confirm) => {
    return password === confirm && password.length > 0;
  };

  // ========== MANEJADORES DE EVENTOS ==========

  /**
   * Se ejecuta cuando el usuario escribe en el campo de email
   * Valida formato en tiempo real
   */
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
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
   * Se ejecuta cuando el usuario escribe en el campo de contraseña
   * Valida que sea alfanumérica en tiempo real
   */
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value.length > 0) {
      if (!validarPasswordAlfanumerica(value)) {
        setPasswordError(t('validation.passwordRequirements'));
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
    
    // Si ya escribió en confirmar password, revalidar coincidencia
    if (confirmPassword.length > 0) {
      if (!validarPasswordsCoinciden(value, confirmPassword)) {
        setConfirmPasswordError(t('validation.passwordsNotMatch'));
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  /**
   * Se ejecuta cuando el usuario escribe en confirmar contraseña
   * Valida que coincida con la contraseña original
   */
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value.length > 0) {
      if (!validarPasswordsCoinciden(password, value)) {
        setConfirmPasswordError(t('validation.passwordsNotMatch'));
      } else {
        setConfirmPasswordError('');
      }
    } else {
      setConfirmPasswordError('');
    }
  };

  /**
   * Se ejecuta cuando el usuario escribe en el campo de nombre
   * Valida que tenga entre 2 y 30 caracteres
   */
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    
    if (value.length > 0) {
      if (!validarNombre(value)) {
        setNameError(t('validation.nameLength'));
      } else {
        setNameError('');
      }
    } else {
      setNameError('');
    }
  };

  /**
   * Determina si el botón "Registrarse" debe estar habilitado
   * Verifica que TODOS los campos sean válidos
   * @returns {boolean} - true si todo es válido, false si no
   */
  const isFormValid = () => {
    return (
      email.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      name.length > 0 &&
      validarEmail(email) &&
      validarPasswordAlfanumerica(password) &&
      validarPasswordsCoinciden(password, confirmPassword) &&
      validarNombre(name) &&
      !emailError &&
      !passwordError &&
      !confirmPasswordError &&
      !nameError
    );
  };

  /**
   * Se ejecuta cuando el usuario hace click en "Registrarse"
   * Envía los datos al servidor (cuando conectemos el backend)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) return;

    setIsLoading(true);
    setServerError('');

    try {
      //Registrar usuario en el backend
      await MainApi.signup(email, password, name);

      //Hacer login automático después del registro
      const response = await MainApi.signin(email, password);

      //Guardar token en localStorage
      localStorage.setItem('jwt', response.token);

      //Obtoner datos del usuario
      const userData = await MainApi.getCurrentUser(response.token);

      showToast(`${t('auth.welcome')}, ${name}!`, 'success');

      setTimeout(() => {
        login(userData, response.token);
      }, 1000);
    } catch (error) {
      console.error ('Error en registro:', error);
      setServerError(error || t('auth.emailAlreadyExists'));
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RENDER DEL COMPONENTE ==========
  return (
    <div className="login-page" data-theme="dark">
      <div className="login-container">
        
        {/* Header: Logo + QUANTY */}
        <div className="login-header">
          <img src={logoQuanty} alt="Quanty logo" className="login-header-logo" />
          <h1 className="login-header-title">QUANTY</h1>
        </div>

        {/* Título del registro */}
        <h2 className="login-subtitle">{t('auth.joinQuanty')}</h2>

        {/* Layout: Quantum (secundario) + Formulario (protagonista) */}
        <div className="login-main-layout">
          
          {/* Quantum con tip (lado izquierdo, secundario) */}
          <div className="login-quantum-side">
            <div className="login-tip-bubble">
              <p>{tipActual}</p>
            </div>
            <img 
              src={theme === 'light' ? quantumHalfLight : quantumFull} 
              alt="Quantum" 
              className="login-quantum-character"
            />
          </div>

          {/* Formulario (lado derecho, protagonista) */}
          <div className="login-form-side">
        
            {/* Formulario de registro */}
            <form className="login-form" onSubmit={handleSubmit}>
              
              {/* Campo de Nombre */}
              <div className="login-form-group">
                <label htmlFor="name" className="login-label">
                  {t('auth.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  className={`login-input ${nameError ? 'login-input-error' : ''}`}
                  value={name}
                  onChange={handleNameChange}
                  placeholder={t('auth.namePlaceholder')}
                  disabled={isLoading}
                />
                {nameError && (
                  <span className="login-error-message">{nameError}</span>
                )}
              </div>

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
                {passwordError && (
                  <span className="login-error-message">{passwordError}</span>
                )}
              </div>

              {/* Campo de Confirmar Contraseña */}
              <div className="login-form-group">
                <label htmlFor="confirmPassword" className="login-label">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={`login-input ${confirmPasswordError ? 'login-input-error' : ''}`}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  disabled={isLoading}
                />
                {confirmPasswordError && (
                  <span className="login-error-message">{confirmPasswordError}</span>
                )}
              </div>

              {/* Mostrar error del servidor si existe */}
              {serverError && (
                <div className="login-server-error">
                  {serverError}
                </div>
              )}

              {/* Botón de Registrarse */}
              <button
                type="submit"
                className="login-button"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? `${t('common.loading')}...` : t('auth.registerButton')}
              </button>

            </form>

            {/* Links de navegación */}
            <div className="login-links">
              <p>
                {t('auth.haveAccount')}{' '}
                <span 
                  className="login-link"
                  onClick={() => navigate('/login')}
                >
                  {t('auth.login')}
                </span>
              </p>
            </div>
            
          </div> {/* Cierra login-form-side */}
        </div> {/* Cierra login-main-layout */}
        
      </div> {/* Cierra login-container */}
    </div> 
  );
}

export default Register;