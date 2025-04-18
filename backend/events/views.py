import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from core.models import ActivityLog
from .models import Event, TCardColumn, Network, EventOperator
from .serializers import EventSerializer, TCardColumnSerializer, NetworkSerializer, EventOperatorSerializer
from django.db import transaction
from rest_framework import serializers
from django.shortcuts import get_object_or_404

logger = logging.getLogger('events')

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.filter(is_active=True)
    serializer_class = EventSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            event = serializer.save()

            # Create default columns
            default_columns = [
                {'title': 'Resource', 'position': 0},
                {'title': 'Staging', 'position': 1},
                {'title': 'Command', 'position': 2},
                {'title': 'Message', 'position': 3},
                {'title': 'Shadow', 'position': 4}
            ]

            for column_data in default_columns:
                TCardColumn.objects.create(
                    event=event,
                    title=column_data['title'],
                    position=column_data['position']
                )
                print(column_data)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        include_archived = self.request.query_params.get('include_archived', 'false').lower() == 'true'
        if include_archived:
            return Event.objects.all()
        return Event.objects.filter(is_active=True)

    def get_object(self):
        # Override get_object to find events regardless of active status
        queryset = Event.objects.all()
        filter_kwargs = {'pk': self.kwargs['pk']}
        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=False, methods=['get'])
    def inactive(self, request):
        inactive_events = Event.objects.filter(is_active=False)
        serializer = self.get_serializer(inactive_events, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        event = self.get_object()
        event.active = False
        event.save()
        return Response({'status': 'event deactivated'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        event = self.get_object()
        event.active = True
        event.save()
        return Response({'status': 'event activated'})

class EventOperatorViewSet(viewsets.ModelViewSet):
    queryset = EventOperator.objects.all()
    serializer_class = EventOperatorSerializer

    def get_queryset(self):
        event_id = self.request.query_params.get('event', None)
        if event_id:
            return EventOperator.objects.filter(event_id=event_id)
        return EventOperator.objects.all()

    @action(detail=True, methods=['post'])
    def mark_heard(self, request, pk=None):
        event_operator = self.get_object()
        event_operator.last_heard = timezone.now()
        event_operator.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        event_operator = self.get_object()
        event_operator.checked_out = timezone.now()
        event_operator.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TCardColumnViewSet(viewsets.ModelViewSet):
    queryset = TCardColumn.objects.all()
    serializer_class = TCardColumnSerializer

    def get_queryset(self):
        queryset = TCardColumn.objects.all()
        event_id = self.request.query_params.get('event', None)
        if event_id is not None:
            queryset = queryset.filter(event_id=event_id)
        return queryset.order_by('position')

    def create(self, request, *args, **kwargs):
        logger.debug("Received request data: %s", request.data)
        logger.debug("Request method: %s", request.method)
        logger.debug("Request content type: %s", request.content_type)

        serializer = self.get_serializer(data=request.data)
        logger.debug("Serializer data: %s", serializer.initial_data)

        try:
            is_valid = serializer.is_valid()
            logger.debug("Is valid: %s", is_valid)
            if not is_valid:
                logger.error("Validation errors: %s", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error("Error in create: %s", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        logger.debug("Event ID from request: %s", event_id)

        if not event_id:
            raise serializers.ValidationError({'event': 'This field is required.'})

        try:
            event = Event.objects.get(id=event_id)
            logger.debug("Found event: %s", event)
        except Event.DoesNotExist:
            logger.error("Event with id %s does not exist", event_id)
            raise serializers.ValidationError({'event': f'Event with id {event_id} does not exist.'})

        try:
            instance = serializer.save(event_id=event_id)
            logger.debug("Successfully saved column")
        except Exception as e:
            logger.error("Error saving column: %s", str(e))
            raise

        # Log the activity
        ActivityLog.objects.create(
            event=instance.event,
            action='ADD_COLUMN',
            details=f'Added T Card column: {instance.title}'
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        # Log the activity
        ActivityLog.objects.create(
            event=instance.event,
            action='UPDATE_COLUMN',
            details=f'Updated T Card column: {instance.title}'
        )

    def perform_destroy(self, instance):
        # Log the activity before deletion
        ActivityLog.objects.create(
            event=instance.event,
            action='DELETE_COLUMN',
            details=f'Deleted T Card column: {instance.title}'
        )
        instance.delete()


class NetworkViewSet(viewsets.ModelViewSet):
    queryset = Network.objects.all()
    serializer_class = NetworkSerializer

    def get_queryset(self):
        event_id = self.request.query_params.get('event', None)
        if event_id:
            return Network.objects.filter(event_id=event_id)
        return Network.objects.all()
