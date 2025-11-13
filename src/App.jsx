import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Inversiones from './components/Inversiones';
import Transacciones from './components/Transacciones';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inversiones" element={<Inversiones />} />
        <Route path="/transacciones" element={<Transacciones />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
