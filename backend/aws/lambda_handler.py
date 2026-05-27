from app import app
from mangum import Mangum

# Handler para AWS Lambda via API Gateway
handler = Mangum(app)
