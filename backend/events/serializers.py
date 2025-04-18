import logging
from rest_framework import serializers
from api.serializers import OperatorSerializer
from core.models import Operator
from .models import Event, TCardColumn, Network, EventOperator

logger = logging.getLogger('events')

class TCardColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = TCardColumn
        fields = ['id', 'event', 'title', 'position']
        read_only_fields = ['id']

    def validate(self, data):
        logger.debug("Validating data: %s", data)
        return data

    def create(self, validated_data):
        logger.debug("Creating column with validated data: %s", validated_data)
        try:
            column = TCardColumn.objects.create(**validated_data)
            logger.debug("Created column: %s", column)
            return column
        except Exception as e:
            logger.error("Error creating column: %s", str(e))
            raise

class EventSerializer(serializers.ModelSerializer):
    columns = TCardColumnSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'name', 'location', 'description', 'start_time', 'end_time', 'created_at', 'is_active', 'health_welfare_time', 'columns']

class NetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Network
        fields = ['id', 'event', 'name', 'network_type', 'created_at']

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
