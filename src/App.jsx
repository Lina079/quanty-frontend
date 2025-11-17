import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Dashboard from './components/Dashboard';
import Inversiones from './components/Main/Inversiones';
import Transacciones from './components/Main/Transacciones';
import Gastos from './components/Main/Gastos';
import Ingresos from './components/Main/Ingresos';
import Ahorros from './components/Main/Ahorros';
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
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inversiones" element={<Inversiones />} />
        <Route path="/transacciones" element={<Transacciones />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/ingresos" element={<Ingresos />} />
        <Route path="/ahorros" element={<Ahorros />} />
      </Routes>
      <Footer />
    </>
  );
}

function App () {
  return (
    <BrowserRouter>
    <AppContent />
    </BrowserRouter>
  );
}


export default App;