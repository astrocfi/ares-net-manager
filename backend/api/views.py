from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from core.models import (
    Operator, OperatorCredential, ActivityLog
)
from .serializers import (
    OperatorSerializer, ActivityLogSerializer
)
from django.shortcuts import get_object_or_404

# Define the credential order to match frontend
CREDENTIAL_ORDER = [
    'C4',
    'F3', 'F2', 'F1',
    'N3', 'N2', 'N1',
    'P3', 'P2', 'P1',
    'S3', 'S2', 'S1',
    'E3', 'E2',
    'MAC',
    'FIRE',
    'ERO',
    'UL',
    'SHARES',
]

class OperatorViewSet(viewsets.ModelViewSet):
    queryset = Operator.objects.all().order_by('call_sign')
    serializer_class = OperatorSerializer

    def create(self, request, *args, **kwargs):
        credentials = request.data.pop('credentials', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.context['credentials'] = credentials
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        credentials = request.data.pop('credentials', [])
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.context['credentials'] = credentials
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def credentials(self, request, pk=None):
        operator = self.get_object()
        credentials = operator.credentials.all()
        # Sort credentials according to CREDENTIAL_ORDER
        sorted_credentials = sorted(
            [cred.credential for cred in credentials],
            key=lambda x: CREDENTIAL_ORDER.index(x) if x in CREDENTIAL_ORDER else len(CREDENTIAL_ORDER)
        )
        return Response(sorted_credentials)

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


class ActivityLogViewSet(viewsets.ModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    http_method_names = ['get', 'post']  # Only allow read and create operations

    def get_queryset(self):
        event_id = self.request.query_params.get('event_id', None)
        if event_id:
            return ActivityLog.objects.filter(event_id=event_id)
        return ActivityLog.objects.all()
