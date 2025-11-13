import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Inversiones from './components/Inversiones';
import Transacciones from './components/Transacciones';
import Gastos from './components/Gastos';
import Ingresos from './components/Ingresos';
import Ahorros from './components/Ahorros';
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