# ==========================================
# JEEVAN AI - Backend API Dockerfile
# ==========================================

# Use official Python lightweight image
FROM python:3.13-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/code

# Set working directory
WORKDIR /code

# Install system dependencies required for psycopg2 / postgis (if any native bindings needed)
# asyncpg usually doesn't need libpq-dev, but good for safety
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY ./services/api/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./services/api/app /code/app
COPY ./services/api/alembic /code/alembic
COPY ./services/api/alembic.ini /code/alembic.ini

# Expose API port
EXPOSE 8000

# Run uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
