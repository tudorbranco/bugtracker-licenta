import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Adaugă token-ul JWT automat la cereri dacă există
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser = (userData) => API.post('/register', userData);
export const loginUser = (credentials) => API.post('/login', credentials);
export const getPendingUsers = () => API.get('/admin/pending-users');
export const approveUser = (id) => API.put(`/admin/approve-user/${id}`);

// ... păstrează ce aveai deja (registerUser, loginUser, getPendingUsers, approveUser) și adaugă:

export const getTickets = () => API.get('/tickets');
export const createTicket = (ticketData) => API.post('/tickets', ticketData);
export const updateTicketStatus = (id, status) => API.put(`/tickets/${id}/status`, { status });
export const assignTicket = (id, assignee) => API.put(`/tickets/${id}/assign`, { assignee });
export const deleteTicket = (id) => API.delete(`/tickets/${id}`);
export const getTicketLogs = (id) => API.get(`/tickets/${id}/logs`);
export const addTicketLog = (id, logData) => API.post(`/tickets/${id}/logs`, logData);