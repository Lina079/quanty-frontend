const BASE_URL = 'https://api.myquanty.com';

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    return Promise.reject(data.message || 'Error en la solicitud');
  }
  return data;
};

// Registro de usuario
export const signup = async (email, password, name) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse(response);
};

// Inicio de sesión
export const signin = async (email, password) => {
  const response = await fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

// Verificar token
export const checkToken = async (token) => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Obtener usuario actual
export const getCurrentUser = async (token) => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Actualizar usuario
export const updateUser = async (token, userData) => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// Obtener transacciones
export const getTransactions = async (token) => {
  const response = await fetch(`${BASE_URL}/transactions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Crear transacción
export const createTransaction = async (token, transactionData) => {
  const response = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(transactionData),
  });
  return handleResponse(response);
};

// Actualizar transacción
export const updateTransaction = async (token, transactionId, transactionData) => {
  const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(transactionData),
  });
  return handleResponse(response);
};

// Eliminar transacción
export const deleteTransaction = async (token, transactionId) => {
  const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export default {
  signup,
  signin,
  checkToken,
  getCurrentUser,
  updateUser,
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};