import boto3
from config import settings

s3 = boto3.client(
    's3',
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)

def upload_file(key: str, body: bytes, content_type: str = 'application/json'):
    s3.put_object(Bucket=settings.S3_BUCKET_NAME, Key=key, Body=body, ContentType=content_type)

def get_presigned_url(key: str, expires: int = 3600) -> str:
    return s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': settings.S3_BUCKET_NAME, 'Key': key},
        ExpiresIn=expires
    )
