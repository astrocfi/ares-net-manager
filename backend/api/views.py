from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from core.models import (
    Operator, OperatorCredential, Event, Network,
    EventOperator, ActivityLog
)
from .serializers import (
    OperatorSerializer, EventSerializer, NetworkSerializer,
    EventOperatorSerializer, ActivityLogSerializer
)

class OperatorViewSet(viewsets.ModelViewSet):
    queryset = Operator.objects.all()
    serializer_class = OperatorSerializer

    @action(detail=True, methods=['get'])
    def credentials(self, request, pk=None):
        operator = self.get_object()
        credentials = operator.credentials.all()
        return Response([cred.credential for cred in credentials])

    @action(detail=True, methods=['post'])
    def add_credential(self, request, pk=None):
        operator = self.get_object()
        credential = request.data.get('credential')
        if not credential:
            return Response({'error': 'Credential is required'}, status=status.HTTP_400_BAD_REQUEST)
        OperatorCredential.objects.create(operator=operator, credential=credential)
        return Response(status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def remove_credential(self, request, pk=None):
        operator = self.get_object()
        credential = request.data.get('credential')
        if not credential:
            return Response({'error': 'Credential is required'}, status=status.HTTP_400_BAD_REQUEST)
        OperatorCredential.objects.filter(operator=operator, credential=credential).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.filter(is_active=True)
    serializer_class = EventSerializer

    @action(detail=False, methods=['get'])
    def inactive(self, request):
        inactive_events = Event.objects.filter(is_active=False)
        serializer = self.get_serializer(inactive_events, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        event = self.get_object()
        event.is_active = False
        event.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class NetworkViewSet(viewsets.ModelViewSet):
    queryset = Network.objects.all()
    serializer_class = NetworkSerializer

    def get_queryset(self):
        event_id = self.request.query_params.get('event', None)
        if event_id:
            return Network.objects.filter(event_id=event_id)
        return Network.objects.all()

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

class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    http_method_names = ['get', 'post']  # Only allow read and create operations

    def get_queryset(self):
        event_id = self.request.query_params.get('event', None)
        if event_id:
            return ActivityLog.objects.filter(event_id=event_id)
        return ActivityLog.objects.all()