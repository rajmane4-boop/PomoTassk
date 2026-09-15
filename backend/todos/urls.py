from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, PomodoroSessionViewSet, StatsAPIView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'pomodoro', PomodoroSessionViewSet, basename='pomodoro')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', StatsAPIView.as_view(), name='stats'),
]
