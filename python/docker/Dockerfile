# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_COMPILE_BYTECODE=1

RUN pip install --no-cache-dir uv

WORKDIR /app
# Copy repo metadata + the whole python workspace (context = repo root).
COPY pnpm-workspace.yaml package.json ./
COPY python ./python

WORKDIR /app/python
RUN uv sync

EXPOSE 8000 3000 5000
CMD ["uv", "run", "fastapi", "dev", "landmap_serving/main.py", "--host", "0.0.0.0", "--port", "8000"]
