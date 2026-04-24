from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Task


class TaskAPITests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            username='maria',
            password='clave-segura-123',
        )
        self.other_user = user_model.objects.create_user(
            username='pedro',
            password='clave-segura-456',
        )
        self.tasks_url = '/api/tasks/'
        self.token_url = reverse('token_obtain_pair')

    def authenticate(self, username='maria', password='clave-segura-123'):
        response = self.client.post(
            self.token_url,
            {'username': username, 'password': password},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )

    def test_requires_authentication(self):
        response = self.client.get(self.tasks_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_task_assigns_authenticated_user(self):
        self.authenticate()

        response = self.client.post(
            self.tasks_url,
            {'title': 'Estudiar filtros', 'completed': False},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(pk=response.data['id'])
        self.assertEqual(task.user, self.user)
        self.assertIsNotNone(task.created)

    def test_lists_only_tasks_for_authenticated_user(self):
        Task.objects.create(user=self.user, title='Tarea propia', completed=False)
        Task.objects.create(user=self.other_user, title='Tarea ajena', completed=False)
        self.authenticate()

        response = self.client.get(self.tasks_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Tarea propia')

    def test_filters_and_search_tasks(self):
        Task.objects.create(user=self.user, title='Comprar pan', completed=True)
        Task.objects.create(user=self.user, title='Leer Django', completed=False)
        Task.objects.create(user=self.user, title='Pan dulce', completed=False)
        Task.objects.create(user=self.other_user, title='Comprar pan ajeno', completed=True)
        self.authenticate()

        filtered_response = self.client.get(self.tasks_url, {'completed': 'true'})
        self.assertEqual(filtered_response.status_code, status.HTTP_200_OK)
        self.assertEqual(filtered_response.data['count'], 1)
        self.assertEqual(filtered_response.data['results'][0]['title'], 'Comprar pan')

        searched_response = self.client.get(self.tasks_url, {'search': 'pan'})
        self.assertEqual(searched_response.status_code, status.HTTP_200_OK)
        self.assertEqual(searched_response.data['count'], 2)
        returned_titles = {task['title'] for task in searched_response.data['results']}
        self.assertEqual(returned_titles, {'Comprar pan', 'Pan dulce'})

        combined_response = self.client.get(
            self.tasks_url,
            {'completed': 'false', 'search': 'pan', 'page': 1},
        )
        self.assertEqual(combined_response.status_code, status.HTTP_200_OK)
        self.assertEqual(combined_response.data['count'], 1)
        self.assertEqual(combined_response.data['results'][0]['title'], 'Pan dulce')

    def test_paginates_results(self):
        self.authenticate()

        for index in range(6):
            Task.objects.create(
                user=self.user,
                title=f'Tarea {index + 1}',
                completed=False,
            )

        first_page = self.client.get(self.tasks_url)
        self.assertEqual(first_page.status_code, status.HTTP_200_OK)
        self.assertEqual(first_page.data['count'], 6)
        self.assertEqual(len(first_page.data['results']), 5)
        self.assertIsNotNone(first_page.data['next'])
        self.assertIsNone(first_page.data['previous'])

        second_page = self.client.get(self.tasks_url, {'page': 2})
        self.assertEqual(second_page.status_code, status.HTTP_200_OK)
        self.assertEqual(len(second_page.data['results']), 1)
        self.assertIsNone(second_page.data['next'])
        self.assertIsNotNone(second_page.data['previous'])

    def test_rejects_short_title(self):
        self.authenticate()

        response = self.client.post(
            self.tasks_url,
            {'title': 'Ir', 'completed': False},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)
