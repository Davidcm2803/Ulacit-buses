from app.app import app as fastapi_app
from mangum import Mangum

#AWS Lambda API Gateway
handler = Mangum(fastapi_app)