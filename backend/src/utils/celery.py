from celery import current_app as current_celery_app
from kombu import Queue, Exchange
import os
from utils.redis import ttl


class CeleryOnceExcepton(Exception):
    def __init__(self, message, status):
        self.message = message
        self.status = status


def make_celery(app):
    # setting delivery mode to transient to avoid persisting messages which takes longer
    task_queues = (
        Queue('celery', routing_key='celery'),
        Queue('transient', Exchange('transient', delivery_mode=1),
              routing_key='transient', durable=False),
    )

    celery = current_celery_app
    celery.config_from_object(app.config, namespace="CELERY")
    celery.conf.task_queues = task_queues
    celery.conf.task_default_queue = 'transient'
    celery.conf.ONCE = {
        'backend': 'celery_once.backends.Redis',
        'settings': {
            'url': os.environ.get("CELERY_RESULT_BACKEND"),
            'default_timeout': ttl
        }
    }

    return celery
