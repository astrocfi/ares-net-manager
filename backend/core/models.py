from django.db import models
from django.utils import timezone
from events.models import Event
class Operator(models.Model):
    call_sign = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    address = models.TextField(blank=True)
    phone_primary = models.CharField(max_length=20, blank=True)
    phone_secondary = models.CharField(max_length=20, blank=True)
    email_primary = models.EmailField(blank=True)
    email_secondary = models.EmailField(blank=True)
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
        ('S3', 'S3'), ('S2', 'S2'), ('S1', 'S1'),
        ('E3', 'E3'), ('E2', 'E2'),
        ('MAC', 'MAC'),
        ('FIRE', 'FIRE'),
        ('ERO', 'ERO'),
        ('UL', 'UL'),
        ('SHARES', 'SHARES'),
    ]

    operator = models.ForeignKey(Operator, on_delete=models.CASCADE, related_name='credentials')
    credential = models.CharField(max_length=10, choices=CREDENTIAL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('operator', 'credential')


class ActivityLog(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='activity_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=50)
    details = models.TextField()

    def __str__(self):
        return f"{self.timestamp} - {self.action} - {self.event.name}"
