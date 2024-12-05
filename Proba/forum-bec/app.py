from flask import Flask, jsonify, request, json
from pymongo import MongoClient;
from werkzeug.security import generate_password_hash,check_password_hash
from bson import ObjectId
from oracle_connect import user_registration_schema,user_login_schema, topic_create_schema, topic_id_only_schema, comment_id_only_schema
from jsonschema import validate, ValidationError
from flask_jwt_extended import JWTManager, jwt_required, create_access_token,get_jwt_identity, get_jwt
from flask_cors import CORS
import datetime
import os
from datetime import timedelta


app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = 'CKCW2hEqp_4WCmxfPs4AkxSoawgGE3LTTD8f5v4hQDQiOLPO3677juBYl8NRD3kvOVGEoEjBvliRxsySxJzHpQ'

CORS(app)
jwt = JWTManager(app)

mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongo_uri)
db = client['my_database']
user_credentials = db["user_credentials"]
user_profiles = db["user_profiles"]







if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)