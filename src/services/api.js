import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true 
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // 401: NÃO AUTENTICADO / SESSÃO EXPIRADA
      if (status === 401) {
        // Em vez de 404, mandamos para o login (ou apenas rejeitamos para o AuthContext agir)
        // Se você usa cookies HttpOnly, o back-end geralmente limpa o cookie no 401
        window.location.href = '/'; 
        return Promise.reject(error);
      }

      // 403: AUTENTICADO, MAS SEM PERMISSÃO (FORBIDDEN)
      if (status === 403) {
        // Aqui sim, o usuário está logado mas tentou acessar algo que não pode
        window.location.href = '/404';
        return Promise.reject(error);
      }

            // 403: AUTENTICADO, MAS SEM PERMISSÃO (FORBIDDEN)
      if (status === 404) {
        // Aqui sim, o usuário está logado mas tentou acessar algo que não pode
        window.location.href = '/404';
        return Promise.reject(error);
      }

            // 500: ERRO NO SERVIDOR
      if (status === 500) {
        // Aqui sim, o usuário está logado mas tentou acessar algo que não pode
        window.location.href = '/500';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;