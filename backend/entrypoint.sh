#!/bin/bash
set -e

echo "Waiting for postgres to be ready..."
# Simple wait loop (in production, use a proper wait-for-it script)
sleep 5

echo "Generating Alembic Migrations..."
alembic revision --autogenerate -m "Auto" || true

echo "Running Alembic Migrations..."
alembic upgrade head

echo "Running Seed Script..."
python seed/run_seed.py

echo "Starting Uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
