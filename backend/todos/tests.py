from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Task, PomodoroSession

class TaskAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.task = Task.objects.create(
            title="Test Task",
            description="Test description",
            priority="high",
            category="Work",
            estimated_pomodoros=2
        )

    def test_get_tasks(self):
        response = self.client.get(reverse('task-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_task(self):
        data = {
            'title': 'New Integration Task',
            'description': 'Description here',
            'priority': 'urgent',
            'category': 'Coding',
            'estimated_pomodoros': 3
        }
        response = self.client.post(reverse('task-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Integration Task')

    def test_toggle_task(self):
        self.assertFalse(self.task.is_completed)
        response = self.client.post(reverse('task-toggle', kwargs={'pk': self.task.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_completed'])

        # Toggle back
        response2 = self.client.post(reverse('task-toggle', kwargs={'pk': self.task.id}))
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertFalse(response2.data['is_completed'])

    def test_increment_pomodoro(self):
        self.assertEqual(self.task.completed_pomodoros, 0)
        response = self.client.post(
            reverse('task-increment-pomodoro', kwargs={'pk': self.task.id}),
            {'duration_minutes': 25}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['task']['completed_pomodoros'], 1)
        self.assertEqual(PomodoroSession.objects.filter(task=self.task).count(), 1)

    def test_stats_endpoint(self):
        response = self.client.get(reverse('stats'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_tasks', response.data)
        self.assertIn('completion_rate', response.data)
        self.assertIn('total_pomodoros', response.data)
