import boto3, time
from app.config import settings

logs = boto3.client('logs', region_name=settings.AWS_REGION)

def log(message: str, level: str = 'INFO'):
    try:
        logs.put_log_events(
            logGroupName=settings.CLOUDWATCH_LOG_GROUP,
            logStreamName='app-stream',
            logEvents=[{
                'timestamp': int(time.time() * 1000),
                'message': f'[{level}] {message}'
            }]
        )
    except Exception:
        pass
