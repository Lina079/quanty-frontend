import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as BudgetApi from '../utils/budgetApi';

const BudgetsContext = createContext();

export function useBudgets() {
  const context = useContext(BudgetsContext);
  if (!context) {
    throw new Error('useBudgets debe usarse dentro de BudgetsProvider');
  }
  return context;
}

export function BudgetsProvider({ children }) {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar presupuestos del backend
  const loadBudgets = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setBudgets([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await BudgetApi.getBudgets(token);
      setBudgets(data);
    } catch (err) {
      console.error('Error cargando presupuestos:', err);
      setError(err);
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const createBudget = async (budgetData) => {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('No hay sesión activa');

    const newBudget = await BudgetApi.createBudget(token, budgetData);
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  };

  const updateBudget = async (id, budgetData) => {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('No hay sesión activa');

    const updated = await BudgetApi.updateBudget(token, id, budgetData);
    setBudgets(prev => 
      prev.map(b => b._id === id ? updated : b)
    );
    return updated;
  };

  const deleteBudget = async (id) => {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('No hay sesión activa');

    await BudgetApi.deleteBudget(token, id);
    setBudgets(prev => prev.filter(b => b._id !== id));
  };

  // Filtrar por tipo (gasto o ingreso)
  const getBudgetsByType = useCallback((tipo) => {
    return budgets.filter(b => b.tipo === tipo && b.activo);
  }, [budgets]);

  // Obtener presupuesto de una categoría específica
  const getBudgetByCategory = useCallback((categoria, tipo) => {
    return budgets.find(b => 
      b.categoria.toLowerCase() === categoria.toLowerCase() && 
      b.tipo === tipo && 
      b.activo
    );
  }, [budgets]);

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        isLoading,
        error,
        loadBudgets,
        createBudget,
        updateBudget,
        deleteBudget,
        getBudgetsByType,
        getBudgetByCategory
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
}