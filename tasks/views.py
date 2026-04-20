from rest_framework import mixins, viewsets

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
