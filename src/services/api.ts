import axios from 'axios';

// ============================================================================
// CONFIGURAÇÃO BASE DO AXIOS
// ============================================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5217/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================================================
// INTERCEPTOR DE REQUISIÇÃO - Adicionar Token
// ============================================================================

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// ============================================================================
// INTERCEPTOR DE RESPOSTA - Tratar Erros
// ============================================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (Token expirado/inválido)
    if (error.response?.status === 401) {
      console.warn('Token expirado ou inválido');
      
      // Limpar tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Redirecionar para login
      window.location.href = '/login';
    }
    
    // Se receber 500 (Erro do servidor)
    if (error.response?.status === 500) {
      console.error('Erro no servidor:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;