from django.db import models

class Event(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class TCardColumn(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='columns')
    title = models.CharField(max_length=255)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.title} ({self.event.name})"