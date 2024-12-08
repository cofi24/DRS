from flask import Flask, jsonify, request, json
from pymongo import MongoClient;
from werkzeug.security import generate_password_hash,check_password_hash
from bson import ObjectId
from oracle_connect import user_registration_schema,user_login_schema 
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



@app.route('/login', methods=['POST'])
def login():
    try:
        validate(instance=request.json, schema=user_login_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    email = request.json['email']
    password = request.json['password']
    user = user_credentials.find_one({"email": email})

    if user:
        user_details = user_profiles.find_one({"user_id": user['_id']})

    if user and check_password_hash(user['password'], password):
        expires = timedelta(days=7)
        access_token = create_access_token(
            identity=str(user['_id']),
            additional_claims={"email": email, "full_name": user_details['first_name'] + " " + user_details['last_name']},
            expires_delta=expires
        )
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


@app.route('/register', methods=['POST'])
def register():
    try:
        validate(instance=request.json, schema=user_registration_schema)
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    email = request.json['email']
    password = request.json['password']
    first_name = request.json['first_name']
    last_name = request.json['last_name']
    country = request.json['country']
    address = request.json['address']
    city = request.json['city']
    phone = request.json['phone']

    if user_credentials.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(password) 

    user_id = user_credentials.insert_one({
        "email": email,
        "password": hashed_password
    }).inserted_id

    user_profiles.insert_one({
        "email": email,
        "user_id": user_id,
        "first_name": first_name,
        "last_name": last_name,
        "country": country,
        "address": address,
        "city": city,
        "phone": phone
    })

    return jsonify({"message": "User created successfully", "user_id": str(user_id)}), 201





if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)