from pymongo import MongoClient

class Mongo():

    def __init__(self):
        self.client = MongoClient('mongodb://localhost:27017/')
        self.db = self.client['ctrleth']

    def close(self):
        self.client.close()