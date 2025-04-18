import logging
from rest_framework import serializers
from .models import Event, TCardColumn

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
        fields = ['id', 'name', 'location', 'active', 'created_at', 'columns']