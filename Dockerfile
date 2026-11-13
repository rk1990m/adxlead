FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8780

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY index.html dashboard.html server.py crawler.py db.py ./

EXPOSE 8780

CMD ["python", "server.py"]
