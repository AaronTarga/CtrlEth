from pymongo import MongoClient
import os
from shared import app

class Mongo():

    def __init__(self):
        host = app.config["DB_HOST"]
        user = os.getenv('MONGO_INITDB_ROOT_USERNAME')
        password = os.getenv('MONGO_INITDB_ROOT_PASSWORD')
        self.client = MongoClient(f'mongodb://{user}:{password}@{host}:27017/')
        print(f'mongodb://{user}:{password}@{host}:27017/')
        self.db = self.client['ctrleth']

    def close(self):
        self.client.close()