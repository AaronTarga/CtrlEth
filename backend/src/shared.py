from utils.redis import Redis
from utils import celery_ext, create_app

redis = Redis()
app = create_app()
celery = celery_ext.celery
inspect = celery.control.inspect()