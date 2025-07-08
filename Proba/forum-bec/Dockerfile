FROM python:3.10-slim

WORKDIR /app

COPY . .

# Instaliraj sistemske zavisnosti za slanje mejlova (smtplib)
RUN apt-get update && apt-get install -y gcc build-essential libssl-dev libffi-dev && \
    pip install --no-cache-dir \
        flask \
        flask-cors \
        flask-mail \
        flask-socketio \
        eventlet \
        pymongo \
        flask-jwt-extended \
        bcrypt \
        jsonschema \
        dnspython \
        email-validator

EXPOSE 5000

CMD ["python", "app.py"]
