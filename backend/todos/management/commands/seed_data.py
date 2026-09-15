from django.core.management.base import BaseCommand
from django.utils import timezone
import datetime
from todos.models import Task, PomodoroSession

class Command(BaseCommand):
    help = 'Seeds initial sample tasks and pomodoro sessions'

    def handle(self, *args, **options):
        if Task.objects.exists():
            self.stdout.write(self.style.WARNING('Tasks already exist. Skipping seed.'))
            return

        today = timezone.now().date()

        t1 = Task.objects.create(
            title="Complete Django & React Integration",
            description="Connect frontend API calls to Django REST Framework backend with CORS headers.",
            priority="urgent",
            category="Coding",
            due_date=today,
            is_completed=False,
            estimated_pomodoros=3,
            completed_pomodoros=1,
        )

        t2 = Task.objects.create(
            title="Design Modern Shadcn UI Dashboard",
            description="Use Radix and Tailwind components for clean dark mode and sleek cards.",
            priority="high",
            category="Work",
            due_date=today + datetime.timedelta(days=1),
            is_completed=False,
            estimated_pomodoros=2,
            completed_pomodoros=0,
        )

        t3 = Task.objects.create(
            title="Review Pomodoro Study Cycle (25m / 5m)",
            description="Practice 25 minutes of deep focus followed by a 5-minute restorative break.",
            priority="medium",
            category="Study",
            due_date=today + datetime.timedelta(days=2),
            is_completed=False,
            estimated_pomodoros=4,
            completed_pomodoros=2,
        )

        t4 = Task.objects.create(
            title="Setup Python Virtual Environment",
            description="Isolated environment created using python -m venv .venv.",
            priority="low",
            category="General",
            due_date=today,
            is_completed=True,
            completed_at=timezone.now(),
            estimated_pomodoros=1,
            completed_pomodoros=1,
        )

        # Create sample pomodoro sessions
        PomodoroSession.objects.create(
            task=t1,
            session_type="work",
            duration_minutes=25,
        )
        PomodoroSession.objects.create(
            task=t3,
            session_type="work",
            duration_minutes=25,
        )
        PomodoroSession.objects.create(
            task=t4,
            session_type="work",
            duration_minutes=25,
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded sample tasks and pomodoro sessions!'))
