import ReconnectingWebSocket from 'reconnecting-websocket';
import { useStore } from '../store';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.eventId = null;
    this.listeners = new Map();
  }

  connect(eventId) {
    if (this.ws) {
      this.disconnect();
    }

    this.eventId = eventId;
    const wsUrl = `ws://localhost:8000/ws/events/${eventId}/`;
    this.ws = new ReconnectingWebSocket(wsUrl);

    this.ws.onopen = () => {
      useStore.getState().setWsConnected(true);
    };

    this.ws.onclose = () => {
      useStore.getState().setWsConnected(false);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const listeners = this.listeners.get(data.type) || [];
      listeners.forEach((listener) => listener(data.data));
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.eventId = null;
      useStore.getState().setWsConnected(false);
    }
  }

  addListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  removeListener(type, callback) {
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type);
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }
}

export default new WebSocketService();