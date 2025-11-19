import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CurrentUserProvider } from './contexts/CurrentUserContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Dashboard from './components/Dashboard';
import Inversiones from './components/Main/Inversiones';
import Transacciones from './components/Main/Transacciones';
import Gastos from './components/Main/Gastos';
import Ingresos from './components/Main/Ingresos';
import Ahorros from './components/Main/Ahorros';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './App.css';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleEsc);

  return () => {
    window.removeEventListener('keydown', handleEsc);
  };
}, [navigate]);

 return (
    <Routes>
      {/* Rutas públicas (sin Header/Footer) */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas protegidas (con Header/Footer) */}
      <Route path="/dashboard" element={
        <>
          <Header />
          <Dashboard />
          <Footer />
        </>
      } />
      <Route path="/inversiones" element={
        <>
          <Header />
          <Inversiones />
          <Footer />
        </>
      } />
      <Route path="/transacciones" element={
        <>
          <Header />
          <Transacciones />
          <Footer />
        </>
      } />
      <Route path="/gastos" element={
        <>
          <Header />
          <Gastos />
          <Footer />
        </>
      } />
      <Route path="/ingresos" element={
        <>
          <Header />
          <Ingresos />
          <Footer />
        </>
      } />
      <Route path="/ahorros" element={
        <>
          <Header />
          <Ahorros />
          <Footer />
        </>
      } />
    </Routes>
  ); 
}

function App () {
  return (
    <BrowserRouter>
    <CurrentUserProvider>
    <AppContent />
    </CurrentUserProvider> 
    </BrowserRouter>
  );
}


export default App;