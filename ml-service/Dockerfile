# syntax=docker/dockerfile:1

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/app/src \
    JOBLIB_TEMP_FOLDER=/tmp/joblib

RUN apt-get update \
    && apt-get install --yes --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system appgroup \
    && useradd --system --gid appgroup --create-home appuser

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install --no-cache-dir --requirement requirements.txt \
    && python -m pip check

COPY src/ ./src/

RUN mkdir -p /app/models /tmp/joblib \
    && chown -R appuser:appgroup /app /tmp/joblib

USER appuser

EXPOSE 8001

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=4 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/health', timeout=3)"]

CMD ["python", "-m", "uvicorn", "cyber_soc_ml.api.app:app", "--host", "0.0.0.0", "--port", "8001"]
