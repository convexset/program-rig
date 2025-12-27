import os
import subprocess
import json
from datetime import datetime

python_script_folder = os.path.dirname(os.path.abspath(__file__))

os.environ['AWS_PROFILE'] = 'convexset'

# get env
env = os.getenv('APP_ENV', 'dev')
print(f'Environment: {env}')

# s3_bucket_name is in f'outputs-{env}.json' in the WebBucketName key
outputs_path = os.path.join(python_script_folder, '..', 'infra', f'outputs-{env}.json')
with open(outputs_path, 'r') as f:
    outputs = json.load(f)
s3_bucket_name = outputs.get(f'ProgramRig-Stack-{env}')['WebBucketName']
cf_distribution_id = outputs.get(f'ProgramRig-Stack-{env}')['WebDistributionId']

command = f"aws s3 sync --delete {python_script_folder}/web-build/{env}  s3://{s3_bucket_name}/ --exclude '*.DS_Store'"

print(f'Running command: {command}')
print()
result = subprocess.run(command, shell=True, capture_output=True, text=True)

print(f'Return code: {result.returncode}')
print()
print('STDOUT:')
print(result.stdout)
print()
print('STDERR:')
print(result.stderr)
print()
print()
print()


command = f"aws cloudfront create-invalidation --distribution-id {cf_distribution_id} --paths '/*'"

print(f'Running command: {command}')
print()
result = subprocess.run(command, shell=True, capture_output=True, text=True)

print(f'Return code: {result.returncode}')
print()
print('STDOUT:')
print(result.stdout)
print()
print('STDERR:')
print(result.stderr)

print()
print()
print(f'Done at {datetime.now().isoformat()}')
print()
print()
