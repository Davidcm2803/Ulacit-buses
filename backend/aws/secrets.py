import boto3
from config import settings

sm = boto3.client('secretsmanager', region_name=settings.AWS_REGION)

def get_secret(secret_name: str) -> str:
    response = sm.get_secret_value(SecretId=secret_name)
    return response['SecretString']
