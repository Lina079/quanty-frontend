const BASE_URL = 'https://api.myquanty.com';

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      return Promise.reject('Error en la solicitud');
    }
    return {};
  }
  
  if (!response.ok) {
    return Promise.reject(data.message || 'Error en la solicitud');
  }
  return data;
};

// Obtener todos los presupuestos
export const getBudgets = async (token) => {
  const response = await fetch(`${BASE_URL}/budgets`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Crear presupuesto
export const createBudget = async (token, budgetData) => {
  const response = await fetch(`${BASE_URL}/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(budgetData),
  });
  return handleResponse(response);
};

// Actualizar presupuesto
export const updateBudget = async (token, budgetId, budgetData) => {
  const response = await fetch(`${BASE_URL}/budgets/${budgetId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(budgetData),
  });
  return handleResponse(response);
};

// Eliminar presupuesto
export const deleteBudget = async (token, budgetId) => {
  const response = await fetch(`${BASE_URL}/budgets/${budgetId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export default {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};