from rest_framework import serializers
from core.models import Event, Network, Operator, EventOperator, ActivityLog, TCardColumn

class OperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operator
        fields = ['id', 'call_sign', 'name', 'notes', 'created_at', 'updated_at']

class NetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Network
        fields = ['id', 'event', 'name', 'network_type', 'created_at']

class TCardColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = TCardColumn
        fields = ['id', 'event', 'title', 'position']
        read_only_fields = ['id']

class EventSerializer(serializers.ModelSerializer):
    columns = TCardColumnSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'name', 'location', 'description', 'start_time', 'end_time', 'created_at', 'is_active', 'health_welfare_time', 'columns']

class EventOperatorSerializer(serializers.ModelSerializer):
    operator = OperatorSerializer(read_only=True)
    operator_id = serializers.PrimaryKeyRelatedField(
        queryset=Operator.objects.all(),
        source='operator',
        write_only=True
    )

    class Meta:
        model = EventOperator
        fields = ['id', 'event', 'operator', 'operator_id', 'network', 'checked_in', 'checked_out', 'last_heard', 'notes', 't_card_position']

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'event', 'operator', 'action', 'details', 'timestamp']
