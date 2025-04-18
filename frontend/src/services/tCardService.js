import { apiService } from './apiService';

export const tCardService = {
  async getColumns(eventId) {
    const response = await apiService.get(`/t-card-columns/?event=${eventId}`);
    return response.data;
  },

  async createColumn(eventId, title, position) {
    const response = await apiService.post('/t-card-columns/', {
      event: parseInt(eventId),
      title: title,
      position: position
    });
    return response.data;
  },

  async updateColumn(columnId, title, position, eventId) {
    const response = await apiService.put(`/t-card-columns/${columnId}/`, {
      event: parseInt(eventId),
      title: title,
      position: position
    });
    return response.data;
  },

  async deleteColumn(columnId) {
    await apiService.delete(`/t-card-columns/${columnId}/`);
  },

  async reorderColumns(eventId, columns) {
    // Update positions for all columns in sequence
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      await this.updateColumn(column.id, column.title, i, eventId);
    }
  }
};