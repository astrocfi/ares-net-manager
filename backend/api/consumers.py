import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from core.models import Event

class EventConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.event_id = self.scope['url_route']['kwargs']['event_id']
        self.event_group_name = f'event_{self.event_id}'

        # Join event group
        await self.channel_layer.group_add(
            self.event_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave event group
        await self.channel_layer.group_discard(
            self.event_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']
        data = text_data_json['data']

        # Send message to event group
        await self.channel_layer.group_send(
            self.event_group_name,
            {
                'type': message_type,
                'data': data
            }
        )

    # Receive message from event group
    async def event_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'event_update',
            'data': event['data']
        }))

    async def operator_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'operator_update',
            'data': event['data']
        }))

    async def network_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'network_update',
            'data': event['data']
        }))

    async def activity_log_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'activity_log_update',
            'data': event['data']
        }))