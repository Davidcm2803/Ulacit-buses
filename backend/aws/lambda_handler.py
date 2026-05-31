from app import app
from mangum import Mangum

#AWS Lambda API Gateway
handler = Mangum(app)
