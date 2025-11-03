import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error.response?.data || error)
  }
)

export const api = {
  // Health check
  checkHealth: () => apiClient.get('/health'),
  
  // Generic CRUD operations
  getAll: (resource) => apiClient.get(`/api/${resource}`),
  getById: (resource, id) => apiClient.get(`/api/${resource}/${id}`),
  create: (resource, data) => apiClient.post(`/api/${resource}`, data),
  update: (resource, id, data) => apiClient.put(`/api/${resource}/${id}`, data),
  delete: (resource, id) => apiClient.delete(`/api/${resource}/${id}`)
}

export default apiClient
