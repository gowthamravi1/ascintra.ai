#!/bin/bash
set -e

echo "Starting Ascintra Backend..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
python -c "
import time
import psycopg
import os
import sys

max_attempts = 30
attempt = 0

while attempt < max_attempts:
    try:
        conn = psycopg.connect(
            host=os.getenv('POSTGRES_HOST', 'postgres'),
            port=os.getenv('POSTGRES_PORT', '5432'),
            dbname=os.getenv('POSTGRES_DB', 'ascintra'),
            user=os.getenv('POSTGRES_USER', 'ascintra'),
            password=os.getenv('POSTGRES_PASSWORD', 'ascintra')
        )
        conn.close()
        print('PostgreSQL is ready!')
        break
    except Exception as e:
        attempt += 1
        if attempt < max_attempts:
            print(f'PostgreSQL not ready yet (attempt {attempt}/{max_attempts}): {e}')
            time.sleep(2)
        else:
            print(f'PostgreSQL failed to become ready after {max_attempts} attempts')
            sys.exit(1)
"

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Run compliance seed data
echo "Seeding compliance data..."
python -c "
import sys
sys.path.append('/app')
from app.seed.compliance_data import seed_compliance_data

print('Seeding compliance data...')
seed_compliance_data()
print('Compliance seed data completed successfully!')
"

# Start the FastAPI server
echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
