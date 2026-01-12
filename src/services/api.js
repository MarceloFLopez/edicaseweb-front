import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // OBRIGATÓRIO para funcionar com seus HttpOnly Cookies
});

export default api;