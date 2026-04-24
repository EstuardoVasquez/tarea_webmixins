from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'completed', 'created')
    list_filter = ('completed', 'created')
    search_fields = ('title', 'user__username')
    ordering = ('-created', '-id')
