from django.db import models

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

    def get_unassigned_column(self):
        column, created = TCardColumn.objects.get_or_create(
            event=self,
            title="Unassigned",
            defaults={'position': -1}  # Position before all other columns
        )
        return column

class Network(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='networks')
    name = models.CharField(max_length=100)
    network_type = models.CharField(max_length=10, default='CUSTOM')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.event.name})"

class EventOperator(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='operators')
    operator = models.ForeignKey("core.Operator", on_delete=models.CASCADE)
    network = models.ForeignKey(Network, on_delete=models.SET_NULL, null=True, blank=True)
    checked_in = models.DateTimeField(auto_now_add=True)
    checked_out = models.DateTimeField(null=True, blank=True)
    last_heard = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)
    t_card_position = models.IntegerField(null=True, blank=True)  # For T Card Rack ordering

    def __str__(self):
        return f"{self.operator.call_sign} in {self.event.name}"

class TCardColumn(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='columns')
    title = models.CharField(max_length=255)
    position = models.IntegerField(default=0)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.title} ({self.event.name})"

class TCard(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='t_cards')
    operator = models.ForeignKey("core.Operator", on_delete=models.CASCADE)
    column = models.ForeignKey(TCardColumn, on_delete=models.SET_NULL, null=True, blank=True)
    position = models.IntegerField(default=0)  # Position within the column
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['column__position', 'position']

    def __str__(self):
        return f"{self.operator.call_sign} in {self.event.name}"

    def save(self, *args, **kwargs):
        if not self.column:
            self.column = self.event.get_unassigned_column()
        super().save(*args, **kwargs)

class TCardActivity(models.Model):
    ACTIVITY_TYPES = [
        ('CREATE', 'Card Created'),
        ('MOVE', 'Moved to Column'),
        ('UPDATE', 'Card Updated'),
        ('DELETE', 'Card Deleted'),
    ]

    t_card = models.ForeignKey(TCard, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=10, choices=ACTIVITY_TYPES)
    details = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_activity_type_display()} - {self.t_card.operator.call_sign}"
