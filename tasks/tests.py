from rest_framework import status
from rest_framework.test import APITestCase


class TaskAPITests(APITestCase):
    def test_can_create_list_and_delete_task(self):
        create_response = self.client.post(
            '/api/tasks/',
            {'title': 'Estudiar mixins', 'completed': False},
            format='json',
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        task_id = create_response.data['id']

        list_response = self.client.get('/api/tasks/')
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['title'], 'Estudiar mixins')

        delete_response = self.client.delete(f'/api/tasks/{task_id}/')
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_rejects_short_title(self):
        response = self.client.post(
            '/api/tasks/',
            {'title': 'Ir', 'completed': False},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)
