import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as MainApi from '../utils/MainApi';

const TransactionsContext = createContext();

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions debe usarse dentro de TransactionsProvider');
  }
  return context;
}

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar transacciones del backend
  const loadTransactions = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await MainApi.getTransactions(token);
      const sorted = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setTransactions(sorted);
    } catch (err) {
      console.error('Error cargando transacciones:', err);
      setError(err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const createTransaction = async (transactionData) => {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('No hay sesión activa');

    const newTransaction = await MainApi.createTransaction(token, transactionData);
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const updateTransaction = async (id, transactionData) => {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('No hay sesión activa');

    const updated = await MainApi.updateTransaction(token, id, transactionData);
    setTransactions(prev => 
      prev.map(t => t._id === id ? updated : t)
    );
    return updated;
  };

  const deleteTransaction = async (id) => {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('No hay sesión activa');

    await MainApi.deleteTransaction(token, id);
    setTransactions(prev => prev.filter(t => t._id !== id));
  };

  const getByType = useCallback((tipo) => {
    return transactions.filter(t => t.tipo === tipo);
  }, [transactions]);

  const gastos = useCallback(() => getByType('gasto'), [getByType]);
  const ingresos = useCallback(() => getByType('ingreso'), [getByType]);
  const ahorros = useCallback(() => getByType('ahorro'), [getByType]);
  const inversiones = useCallback(() => getByType('inversion'), [getByType]);

  const getTotalByType = useCallback((tipo) => {
    return getByType(tipo).reduce((sum, t) => sum + t.monto, 0);
  }, [getByType]);

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        isLoading,
        error,
        loadTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        getByType,
        gastos,
        ingresos,
        ahorros,
        inversiones,
        getTotalByType
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}