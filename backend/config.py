from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB: str = "ulacit_buses"
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET_NAME: str = "ulacit-buses-bucket"
    CLOUDWATCH_LOG_GROUP: str = "/ulacit/buses"
    SECRET_KEY: str = "dev-secret"

    class Config:
        env_file = ".env"

settings = Settings()
