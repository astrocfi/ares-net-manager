import { apiService } from './apiService';

export const tCardService = {
  async getColumns(eventId) {
    console.log("getColumns", eventId);
    const response = await apiService.get(`/t-card-columns/?event_id=${eventId}`);
    return response.data;
  },

  async createColumn(eventId, title, position) {
    console.log("createColumn", eventId, title, position);
    const response = await apiService.post('/t-card-columns/', {
      event_id: parseInt(eventId),
      title: title,
      position: position
    });
    return response.data;
  },

  async updateColumn(eventId, columnId, title, position) {
    console.log("updateColumn", eventId, columnId, title, position);
    const response = await apiService.put(`/t-card-columns/${columnId}/?event_id=${eventId}`, {
      event_id: parseInt(eventId),
      title: title,
      position: position
    });
    return response.data;
  },

  async deleteColumn(eventId, columnId) {
    console.log("deleteColumn", eventId, columnId);
    await apiService.delete(`/t-card-columns/${columnId}/?event_id=${eventId}`);
  },

  async reorderColumns(eventId, columns) {
    // Update positions for all columns in sequence
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      await this.updateColumn(eventId, column.id, column.title, i);
    }
  },

  // Card-related functions
  async getCards(eventId) {
    const response = await apiService.get(`/t-cards/?event_id=${eventId}`);
    return response.data;
  },

  async createCard(cardData) {
    const response = await apiService.post('/t-cards/', cardData);
    return response.data;
  },

  async updateCard(cardId, cardData) {
    const response = await apiService.put(`/t-cards/${cardId}/`, cardData);
    return response.data;
  },

  async deleteCard(cardId) {
    await apiService.delete(`/t-cards/${cardId}/`);
  },

  async moveCard(cardId, columnId, position) {
    const response = await apiService.patch(`/t-cards/${cardId}/`, {
      column: columnId,
      position: position
    });
    return response.data;
  }
};