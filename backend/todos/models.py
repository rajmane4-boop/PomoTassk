from django.db import models
from django.utils import timezone

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    CATEGORY_CHOICES = [
        ('General', 'General'),
        ('Work', 'Work'),
        ('Study', 'Study'),
        ('Personal', 'Personal'),
        ('Health', 'Health'),
        ('Coding', 'Coding'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_pomodoros = models.PositiveIntegerField(default=1)
    completed_pomodoros = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['is_completed', '-created_at']

    def __str__(self):
        return self.title

    def toggle_completed(self):
        self.is_completed = not self.is_completed
        self.completed_at = timezone.now() if self.is_completed else None
        self.save()

    def increment_pomodoro(self):
        self.completed_pomodoros += 1
        self.save()


class PomodoroSession(models.Model):
    SESSION_TYPES = [
        ('work', 'Focus Work'),
        ('short_break', 'Short Break'),
        ('long_break', 'Long Break'),
    ]

    task = models.ForeignKey(
        Task, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='pomodoro_sessions'
    )
    session_type = models.CharField(max_length=20, choices=SESSION_TYPES, default='work')
    duration_minutes = models.PositiveIntegerField(default=25)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        task_name = self.task.title if self.task else "Unassigned"
        return f"{self.get_session_type_display()} ({self.duration_minutes}m) - {task_name}"
