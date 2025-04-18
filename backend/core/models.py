from django.db import models
from django.utils import timezone

class Operator(models.Model):
    call_sign = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.call_sign} - {self.name}"

class OperatorCredential(models.Model):
    CREDENTIAL_CHOICES = [
        ('C4', 'C4'),
        ('F3', 'F3'), ('F2', 'F2'), ('F1', 'F1'),
        ('N3', 'N3'), ('N2', 'N2'), ('N1', 'N1'),
        ('P3', 'P3'), ('P2', 'P2'), ('P1', 'P1'),
        ('MAC', 'MAC'),
        ('ERO', 'ERO'),
    ]

    operator = models.ForeignKey(Operator, on_delete=models.CASCADE, related_name='credentials')
    credential = models.CharField(max_length=10, choices=CREDENTIAL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('operator', 'credential')

class Event(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    health_welfare_time = models.IntegerField(default=30)  # in minutes

    def __str__(self):
        return self.name

class Network(models.Model):
    NETWORK_TYPES = [
        ('RESOURCE', 'Resource'),
        ('COMMAND', 'Command'),
        ('MESSAGE', 'Message'),
        ('SHADOW', 'Shadow'),
        ('CUSTOM', 'Custom'),
    ]

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='networks')
    name = models.CharField(max_length=100)
    network_type = models.CharField(max_length=10, choices=NETWORK_TYPES, default='CUSTOM')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.event.name})"

class EventOperator(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='operators')
    operator = models.ForeignKey(Operator, on_delete=models.CASCADE)
    network = models.ForeignKey(Network, on_delete=models.SET_NULL, null=True, blank=True)
    checked_in = models.DateTimeField(auto_now_add=True)
    checked_out = models.DateTimeField(null=True, blank=True)
    last_heard = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)
    t_card_position = models.IntegerField(null=True, blank=True)  # For T Card Rack ordering

    def __str__(self):
        return f"{self.operator.call_sign} in {self.event.name}"

class ActivityLog(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='activity_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=50)
    details = models.TextField()
    operator = models.ForeignKey(Operator, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.timestamp} - {self.action} - {self.event.name}"

class TCardColumn(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='columns')
    title = models.CharField(max_length=255)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.title} ({self.event.name})"