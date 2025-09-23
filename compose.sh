#!/usr/bin/env bash
set -euo pipefail

# Rebuild images without using cache
docker compose build --no-cache

# Start containers with fresh images
docker compose up --force-recreate
