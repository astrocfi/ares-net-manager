from rest_framework import serializers
from core.models import Operator, ActivityLog, OperatorCredential

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

class OperatorSerializer(serializers.ModelSerializer):
    credentials = serializers.SerializerMethodField()

    class Meta:
        model = Operator
        fields = [
            'id', 'call_sign', 'first_name', 'last_name', 'address', 'phone_primary', 'phone_secondary',
            'email_primary', 'email_secondary', 'notes', 'created_at', 'updated_at',
            'credentials'
        ]

    def get_credentials(self, obj):
        credentials = [cred.credential for cred in obj.credentials.all()]
        # Sort credentials according to CREDENTIAL_ORDER
        return sorted(
            credentials,
            key=lambda x: CREDENTIAL_ORDER.index(x) if x in CREDENTIAL_ORDER else len(CREDENTIAL_ORDER)
        )

    def create(self, validated_data):
        credentials = self.context.get('credentials', [])
        operator = super().create(validated_data)
        for credential in credentials:
            OperatorCredential.objects.create(operator=operator, credential=credential)
        return operator

    def update(self, instance, validated_data):
        credentials = self.context.get('credentials', [])
        operator = super().update(instance, validated_data)
        # Clear existing credentials
        operator.credentials.all().delete()
        # Add new credentials
        for credential in credentials:
            OperatorCredential.objects.create(operator=operator, credential=credential)
        return operator

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'event', 'operator', 'action', 'details', 'timestamp']
