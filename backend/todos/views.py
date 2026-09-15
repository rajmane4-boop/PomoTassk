from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Sum, Q
import datetime

from .models import Task, PomodoroSession
from .serializers import TaskSerializer, PomodoroSessionSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all()
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if category and category != 'All':
            queryset = queryset.filter(category=category)
        if priority and priority != 'All':
            queryset = queryset.filter(priority=priority)
        if status_param == 'completed':
            queryset = queryset.filter(is_completed=True)
        elif status_param == 'pending':
            queryset = queryset.filter(is_completed=False)
        elif status_param == 'today':
            today = timezone.now().date()
            queryset = queryset.filter(due_date=today)
        elif status_param == 'overdue':
            today = timezone.now().date()
            queryset = queryset.filter(due_date__lt=today, is_completed=False)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        task = self.get_object()
        task.toggle_completed()
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['post'])
    def increment_pomodoro(self, request, pk=None):
        task = self.get_object()
        duration = int(request.data.get('duration_minutes', 25))
        task.increment_pomodoro()
        # Also record PomodoroSession
        session = PomodoroSession.objects.create(
            task=task,
            session_type='work',
            duration_minutes=duration
        )
        return Response({
            'task': TaskSerializer(task).data,
            'session': PomodoroSessionSerializer(session).data
        })


class PomodoroSessionViewSet(viewsets.ModelViewSet):
    queryset = PomodoroSession.objects.all()
    serializer_class = PomodoroSessionSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        # If task was provided and session is 'work', also increment task's completed_pomodoros
        task_id = request.data.get('task')
        session_type = request.data.get('session_type', 'work')
        if task_id and session_type == 'work':
            try:
                task = Task.objects.get(pk=task_id)
                task.increment_pomodoro()
            except Task.DoesNotExist:
                pass
        return response


class StatsAPIView(APIView):
    def get(self, request):
        now = timezone.now()
        today_start = timezone.make_aware(datetime.datetime.combine(now.date(), datetime.time.min))

        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(is_completed=True).count()
        pending_tasks = total_tasks - completed_tasks
        high_priority_pending = Task.objects.filter(
            is_completed=False, 
            priority__in=['high', 'urgent']
        ).count()

        work_sessions = PomodoroSession.objects.filter(session_type='work')
        total_pomodoros = work_sessions.count()
        total_focus_minutes = work_sessions.aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0

        today_work_sessions = work_sessions.filter(completed_at__gte=today_start)
        today_pomodoros = today_work_sessions.count()
        today_focus_minutes = today_work_sessions.aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0

        completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0

        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'completion_rate': completion_rate,
            'high_priority_pending': high_priority_pending,
            'total_pomodoros': total_pomodoros,
            'total_focus_minutes': total_focus_minutes,
            'today_pomodoros': today_pomodoros,
            'today_focus_minutes': today_focus_minutes,
        })
