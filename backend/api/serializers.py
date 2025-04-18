from rest_framework import serializers
from core.models import Operator, ActivityLog

class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operator
        fields = ['id', 'call_sign', 'name', 'notes', 'created_at', 'updated_at']

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'event', 'operator', 'action', 'details', 'timestamp']
