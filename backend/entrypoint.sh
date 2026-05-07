#!/bin/bash
set -e

echo "⏳ Esperando que PostgreSQL esté disponible..."

# Espera activa hasta que pg_isready responda OK
until pg_isready -h db -p 5432 -U postgres; do
  echo "   PostgreSQL no está listo aún, reintentando en 2 segundos..."
  sleep 2
done

echo "✅ PostgreSQL está listo."

echo "🔄 Generando migraciones Alembic..."
alembic revision --autogenerate -m "auto" || true

echo "⬆️  Aplicando migraciones..."
alembic upgrade head

echo "🌱 Corriendo seed..."
python seed/run_seed.py

echo "🚀 Iniciando servidor..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
