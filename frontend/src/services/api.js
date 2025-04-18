import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event endpoints
export const getEvents = (showInactive = false) =>
  api.get(`/events/?show_inactive=${showInactive}`);

export const getEvent = (id) => api.get(`/events/${id}/`);

export const createEvent = (data) => api.post('/events/', data);

export const updateEvent = (id, data) => api.put(`/events/${id}/`, data);

export const deactivateEvent = (id) => api.post(`/events/${id}/deactivate/`);

// Network endpoints
export const getNetworks = (eventId) =>
  api.get(`/networks/?event_id=${eventId}`);

export const createNetwork = (data) => api.post('/networks/', data);

export const updateNetwork = (id, data) => api.put(`/networks/${id}/`, data);

export const deleteNetwork = (id) => api.delete(`/networks/${id}/`);

// Operator endpoints
export const getOperators = () => api.get('/operators/');

export const getOperator = (id) => api.get(`/operators/${id}/`);

export const createOperator = (data) => api.post('/operators/', data);

export const updateOperator = (id, data) => api.put(`/operators/${id}/`, data);

export const addOperatorCredential = (id, credential) =>
  api.post(`/operators/${id}/add_credential/`, { credential });

export const removeOperatorCredential = (id, credential) =>
  api.post(`/operators/${id}/remove_credential/`, { credential });

// Event Operator endpoints
export const getEventOperators = (eventId) =>
  api.get(`/event-operators/?event_id=${eventId}`);

export const createEventOperator = (data) => api.post('/event-operators/', data);

export const updateEventOperator = (id, data) =>
  api.put(`/event-operators/${id}/`, data);

export const checkOutOperator = (id) =>
  api.post(`/event-operators/${id}/check_out/`);

export const updateLastHeard = (id) =>
  api.post(`/event-operators/${id}/update_last_heard/`);

// Activity Log endpoints
export const getActivityLogs = (eventId) =>
  api.get(`/activity-logs/?event_id=${eventId}`);

export default api;