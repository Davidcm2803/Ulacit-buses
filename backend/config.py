from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    
    #aca todo la conexion de mongo aws y toda la vara
    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB: str = "ulacit_buses"
    AWS_REGION: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""


    class Config:
        env_file = ".env"

settings = Settings()
