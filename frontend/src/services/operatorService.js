import { apiService } from './apiService';

export const operatorService = {
  async getOperators() {
    const response = await apiService.get('/operators/');
    return response.data;
  },

  async getOperator(id) {
    const response = await apiService.get(`/operators/${id}/`);
    return response.data;
  },

  async createOperator(operatorData) {
    const response = await apiService.post('/operators/', operatorData);
    return response.data;
  },

  async updateOperator(id, operatorData) {
    const response = await apiService.put(`/operators/${id}/`, operatorData);
    return response.data;
  },

  async deleteOperator(id) {
    await apiService.delete(`/operators/${id}/`);
  }
};