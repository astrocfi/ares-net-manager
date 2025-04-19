import logging
from rest_framework import serializers
from api.serializers import OperatorSerializer
from core.models import Operator
from .models import Event, TCardColumn, Network, EventOperator, TCard, TCardActivity

logger = logging.getLogger('events')

class TCardColumnSerializer(serializers.ModelSerializer):
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(),
        source='event',
        write_only=True
    )

    class Meta:
        model = TCardColumn
        fields = ['id', 'title', 'position', 'event_id']

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
        fields = '__all__'

class NetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Network
        fields = '__all__'

class EventOperatorSerializer(serializers.ModelSerializer):
    operator = OperatorSerializer(read_only=True)
    operator_id = serializers.PrimaryKeyRelatedField(
        queryset=Operator.objects.all(),
        source='operator',
        write_only=True
    )

    class Meta:
        model = EventOperator
        fields = '__all__'

class TCardActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TCardActivity
        fields = '__all__'

class TCardSerializer(serializers.ModelSerializer):
    operator = OperatorSerializer(read_only=True)
    operator_id = serializers.PrimaryKeyRelatedField(
        queryset=Operator.objects.all(),
        source='operator',
        write_only=True
    )
    activities = TCardActivitySerializer(many=True, read_only=True)

    class Meta:
        model = TCard
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def create(self, validated_data):
        t_card = super().create(validated_data)
        TCardActivity.objects.create(
            t_card=t_card,
            activity_type='CREATE',
            details='Card created'
        )
        return t_card

    def update(self, instance, validated_data):
        old_column = instance.column
        t_card = super().update(instance, validated_data)

        if 'column' in validated_data and old_column != t_card.column:
            TCardActivity.objects.create(
                t_card=t_card,
                activity_type='MOVE',
                details=f'Moved to column: {t_card.column.title}'
            )
        elif validated_data:
            TCardActivity.objects.create(
                t_card=t_card,
                activity_type='UPDATE',
                details='Card updated'
            )

        return t_card
