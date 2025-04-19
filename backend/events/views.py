import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from core.models import ActivityLog
from .models import Event, TCardColumn, Network, EventOperator, TCard, TCardActivity
from .serializers import EventSerializer, TCardColumnSerializer, NetworkSerializer, EventOperatorSerializer, TCardSerializer, TCardActivitySerializer
from django.db import transaction
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from core.models import Operator

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
        event_id = self.request.query_params.get('event_id', None)
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
        logger.debug("TCardColumnViewSet::get_queryset - Received request data: %s",
                     self.request.query_params)
        queryset = TCardColumn.objects.all()
        event_id = self.request.query_params.get('event_id', None)
        if event_id is None:
            raise serializers.ValidationError({'event_id': 'This field is required.'})
        queryset = queryset.filter(event_id=event_id)
        return queryset.order_by('position')

    def create(self, request, *args, **kwargs):
        logger.debug("TCardColumnViewSet::create - Received request data: %s", request.data)
        logger.debug("TCardColumnViewSet::create - Request method: %s", request.method)
        logger.debug("TCardColumnViewSet::create - Request content type: %s", request.content_type)

        serializer = self.get_serializer(data=request.data)
        logger.debug("TCardColumnViewSet::create - Serializer data: %s", serializer.initial_data)

        try:
            is_valid = serializer.is_valid()
            logger.debug("TCardColumnViewSet::create - Is valid: %s", is_valid)
            if not is_valid:
                logger.error("TCardColumnViewSet::create - Validation errors: %s", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error("TCardColumnViewSet::create - Error in create: %s", str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        event_id = self.request.data.get('event_id')
        logger.debug("TCardColumnViewSet::perform_create - Event ID from request: %s", event_id)

        if not event_id:
            raise serializers.ValidationError({'event_id': 'This field is required.'})

        try:
            event = Event.objects.get(id=event_id)
            logger.debug("TCardColumnViewSet::perform_create - Found event: %s", event)
        except Event.DoesNotExist:
            logger.error("TCardColumnViewSet::perform_create - Event with id %s does not exist", event_id)
            raise serializers.ValidationError({'event_id': f'Event with id {event_id} does not exist.'})

        try:
            instance = serializer.save(event_id=event_id)
            logger.debug("TCardColumnViewSet::perform_create - Successfully saved column")
        except Exception as e:
            logger.error("TCardColumnViewSet::perform_create - Error saving column: %s", str(e))
            raise

        # Log the activity
        ActivityLog.objects.create(
            event=instance.event,
            action='ADD_COLUMN',
            details=f'Added T Card column: {instance.title}'
        )

    def perform_update(self, serializer):
        logger.debug("TCardColumnViewSet::perform_update - Updated instance: %s", serializer.initial_data)
        instance = serializer.save()
        logger.debug("TCardColumnViewSet::perform_update - Updated instance: %s", instance)
        # Log the activity
        ActivityLog.objects.create(
            event=instance.event,
            action='UPDATE_COLUMN',
            details=f'Updated T Card column: {instance.title}'
        )

    def perform_destroy(self, instance):
        logger.debug("TCardColumnViewSet::perform_destroy - Deleting instance: %s", instance)
        # Log the activity before deletion
        ActivityLog.objects.create(
            event=instance.event,
            action='DELETE_COLUMN',
            details=f'Deleted T Card column: {instance.title}'
        )
        instance.delete()

    @action(detail=True, methods=['post'])
    def reorder(self, request, pk=None):
        column = self.get_object()
        new_position = request.data.get('position')

        if new_position is not None:
            # Get all columns for this event
            columns = TCardColumn.objects.filter(event=column.event).order_by('position')

            # Update positions
            for col in columns:
                if col == column:
                    col.position = new_position
                elif col.position >= new_position and col.position < column.position:
                    col.position += 1
                elif col.position <= new_position and col.position > column.position:
                    col.position -= 1
                col.save()

        return Response(self.get_serializer(column).data)

class NetworkViewSet(viewsets.ModelViewSet):
    queryset = Network.objects.all()
    serializer_class = NetworkSerializer

    def get_queryset(self):
        event_id = self.request.query_params.get('event_id', None)
        if event_id:
            return Network.objects.filter(event_id=event_id)
        return Network.objects.all()

class TCardViewSet(viewsets.ModelViewSet):
    queryset = TCard.objects.all()
    serializer_class = TCardSerializer

    def get_queryset(self):
        queryset = TCard.objects.all()
        event_id = self.request.query_params.get('event_id', None)
        if event_id is not None:
            queryset = queryset.filter(event_id=event_id)
        return queryset.order_by('position')

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        t_card = self.get_object()
        new_column_id = request.data.get('column_id')
        new_position = request.data.get('position')

        if new_column_id is not None:
            try:
                new_column = TCardColumn.objects.get(id=new_column_id)
                t_card.column = new_column
            except TCardColumn.DoesNotExist:
                return Response({'error': 'Column not found'}, status=status.HTTP_404_NOT_FOUND)

        if new_position is not None:
            t_card.position = new_position

        t_card.save()
        return Response(self.get_serializer(t_card).data)

class TCardActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TCardActivity.objects.all()
    serializer_class = TCardActivitySerializer

    def get_queryset(self):
        queryset = TCardActivity.objects.all()
        t_card_id = self.request.query_params.get('t_card_id', None)
        if t_card_id is not None:
            queryset = queryset.filter(t_card_id=t_card_id)
        return queryset.order_by('-created_at')
