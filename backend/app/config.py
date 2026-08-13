from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):

    #aca todo la conexion de mongo aws y toda la vara
    MONGO_URI: str = "mongodb://mongo:27017"
    MONGO_DB: str = "ulacit_buses"
    AWS_REGION: str = ""
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""

    # Stripe (modo test)
    STRIPE_SECRET_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()