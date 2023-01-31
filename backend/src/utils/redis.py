import redis
from datetime import timedelta
import sys
import os

ttl = 60 * 20  # 20 minutes


class Redis(object):
    def __init__(self):
        self.client = None
        try:
            client = redis.Redis(
                host=os.environ.get("FLASK_HOST"),
                port=6379,
                db=0,
                socket_timeout=5,
            )
            ping = client.ping()
            if ping is True:
                self.client = client
        except redis.AuthenticationError:
            print("AuthenticationError")
            sys.exit(1)

    def get_routes_from_cache(self, key: str) -> str:
        """Data from redis."""

        val = self.client.get(key)
        return val

    def set_routes_to_cache(self, key: str, value: str, ttl=0) -> bool:
        """Data to redis."""

        if ttl > 0:
            state = self.client.set(
                key, ex=timedelta(seconds=ttl), value=value)
        else:
            state = self.client.set(key, value=value)
        return state

    def delete_key(self, key,) -> int:
        state = self.client.delete(key)

        return state

    def scan(self, pattern):
        return self.client.scan_iter(pattern)
