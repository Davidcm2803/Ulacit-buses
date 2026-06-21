import os
import certifi
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:admin1234@localhost:27018")
DB_NAME = os.getenv("MONGO_DB_NAME", "506trackerdb")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client[DB_NAME]