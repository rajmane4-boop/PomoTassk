from django.contrib import admin
from .models import Task, PomodoroSession

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'category', 'due_date', 'is_completed', 'completed_pomodoros', 'estimated_pomodoros', 'created_at')
    list_filter = ('is_completed', 'priority', 'category', 'due_date')
    search_fields = ('title', 'description')
    ordering = ('is_completed', '-created_at')

@admin.register(PomodoroSession)
class PomodoroSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'session_type', 'duration_minutes', 'task', 'completed_at')
    list_filter = ('session_type', 'completed_at')
    ordering = ('-completed_at',)
