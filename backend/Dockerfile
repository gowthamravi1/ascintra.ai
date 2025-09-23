# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install Docker CLI
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://get.docker.com -o get-docker.sh \
    && sh get-docker.sh --dry-run \
    && curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-24.0.7.tgz | tar -xzC /tmp \
    && cp /tmp/docker/docker /usr/local/bin/ \
    && rm -rf /tmp/docker get-docker.sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY backend/app /app/app
COPY backend/alembic.ini /app/alembic.ini
COPY backend/alembic /app/alembic
COPY backend/startup.sh /app/startup.sh

RUN chmod +x /app/startup.sh

EXPOSE 8000
CMD ["/app/startup.sh"]
