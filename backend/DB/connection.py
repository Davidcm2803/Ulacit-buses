from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

class MongoDB:
    client: AsyncIOMotorClient = None

    @classmethod
    def connect(cls):
        cls.client = AsyncIOMotorClient(settings.MONGO_URI)

    @classmethod
    def get_db(cls):
        return cls.client[settings.MONGO_DB]

    @classmethod
    def close(cls):
        if cls.client:
            cls.client.close()
