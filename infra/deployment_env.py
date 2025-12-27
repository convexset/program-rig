import os
import json

def get_env() -> str:
    return os.getenv('CDK_ENV', 'dev')

def load_config() -> dict:
    env = get_env()

    env_config = {}
    with open(f'config-base.json') as f:
        env_config = json.loads(f.read())

    with open(f'config-{env}.json') as f:
        _env_config = json.loads(f.read())
        env_config.update(_env_config)

    # Override Do S3 Deploy with environment variable if set
    do_s3_deploy_env = os.getenv('DO_S3_DEPLOY')
    if do_s3_deploy_env is not None:
        env_config['Do S3 Deploy'] = do_s3_deploy_env.lower() in ('true', '1', 't')

    return env_config