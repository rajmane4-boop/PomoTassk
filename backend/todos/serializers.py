from rest_framework import serializers
from django.utils import timezone
from .models import Task, PomodoroSession

class TaskSerializer(serializers.ModelSerializer):
    is_overdue = serializers.SerializerMethodField()
    pomodoro_sessions_count = serializers.IntegerField(source='pomodoro_sessions.count', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'category',
            'due_date',
            'is_completed',
            'completed_at',
            'estimated_pomodoros',
            'completed_pomodoros',
            'is_overdue',
            'pomodoro_sessions_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']

    def get_is_overdue(self, obj):
        if obj.due_date and not obj.is_completed:
            return obj.due_date < timezone.now().date()
        return False


class PomodoroSessionSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = PomodoroSession
        fields = [
            'id',
            'task',
            'task_title',
            'session_type',
            'duration_minutes',
            'completed_at',
        ]
        read_only_fields = ['id', 'completed_at']
