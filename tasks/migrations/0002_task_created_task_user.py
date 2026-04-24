from django.conf import settings
from django.db import migrations, models
from django.utils import timezone


def assign_existing_tasks_to_legacy_user(apps, schema_editor):
    task_model = apps.get_model('tasks', 'Task')
    app_label, model_name = settings.AUTH_USER_MODEL.split('.')
    user_model = apps.get_model(app_label, model_name)

    if not task_model.objects.filter(user__isnull=True).exists():
        return

    legacy_user, _ = user_model.objects.get_or_create(
        username='legacy_tasks',
        defaults={
            'is_active': False,
            'password': '!',
        },
    )
    task_model.objects.filter(user__isnull=True).update(user=legacy_user)


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='task',
            options={'ordering': ['-created', '-id']},
        ),
        migrations.AddField(
            model_name='task',
            name='created',
            field=models.DateTimeField(
                auto_now_add=True,
                default=timezone.now,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='task',
            name='user',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.deletion.CASCADE,
                related_name='tasks',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RunPython(
            assign_existing_tasks_to_legacy_user,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='task',
            name='user',
            field=models.ForeignKey(
                on_delete=models.deletion.CASCADE,
                related_name='tasks',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
