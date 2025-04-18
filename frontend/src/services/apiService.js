import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
console.log('API Service initialized with URL:', API_BASE_URL);

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ApiService {
  async get(endpoint) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making GET request to:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('GET request failed:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response data:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('GET response data:', data);
    return { data };
  }

  async post(endpoint, data) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making POST request to:', url, 'with data:', data);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error('POST request failed:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    const responseData = await response.json();
    console.log('POST response:', responseData);
    return responseData;
  }

  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return null;
  }
}

export { apiService };