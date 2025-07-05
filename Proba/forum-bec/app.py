from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_mail import Mail, Message
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from bson import ObjectId
from oracle_connect import user_login_schema, user_registration_schema
import os
import datetime
import smtplib
from email.message import EmailMessage
import re
from jsonschema import validate, ValidationError
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['JWT_SECRET_KEY'] = 'tajni_kljuc'
jwt = JWTManager(app)

app.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=465,
    MAIL_USE_SSL=True,
    MAIL_USERNAME='tomicluka713@gmail.com',
    MAIL_PASSWORD='dlsl wefc pntp qkcd'  # ili tvoj password ako nema 2FA
)

mail = Mail(app)

# MongoDB konekcija
client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
db = client['forum_db']
users = db['users']
registration_requests = db['registration_requests']
discussions = db['discussions']
comments = db['comments']
topics = db['topics']
likes = db['likes']
admin_user = {
    "email": "tomicluka713@gmail.com",
    "password": generate_password_hash("123456"),
    "first_name": "Admin",
    "last_name": "Forum",
    "country" : "Srbija",
    "address" : "Skolska 2",
    "city" : "Novi Sad",
    "phone" : "0641028011",
    "role" : "admin"
}

existing_admin = users.find_one({'email': admin_user['email']})
if not existing_admin:
    users.insert_one(admin_user)
    print("Admin user created!")
else:
    if existing_admin.get('role') != 'admin':
        users.update_one({'_id': existing_admin['_id']}, {'$set': {'role': 'admin'}})
        print("Admin user role updated to 'admin'.")
    else:
        print("Admin user already exists with 'admin' role.")


# Pomoćna funkcija za slanje maila (možeš izmeniti SMTP ako treba)
def send_email(to_email, subject, body):
    try:
        msg = Message(subject, sender=app.config['MAIL_USERNAME'], recipients=[to_email])
        msg.body = body
        mail.send(msg)
    except Exception as e:
        print(f"Greška pri slanju mejla: {e}")


def get_current_user():
    user_id = get_jwt_identity()
    return users.find_one({'_id': ObjectId(user_id)})

# REGISTRACIJA - šalje zahtev, ne pravi nalog odmah
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    print("Primljeni podaci za registraciju:")
    print(data)

    email = data.get('email')

    print("Provera postojanja email-a:")
    print("Email:", email)
    print("Korisnik sa ovim email-om u users kolekciji:", users.find_one({'email': email}))
    print("Zahtev sa ovim email-om u registration_requests kolekciji:", registration_requests.find_one({'email': email}))

    if users.find_one({'email': email}) or registration_requests.find_one({'email': email}):
        return jsonify({'error': 'Email already registered'}), 400

    data['password'] = generate_password_hash(data['password'])
    registration_requests.insert_one(data)

    print("Podaci su ubačeni u registration_requests.")

    # Obavesti admina (email & websocket)
    send_email('tomicluka713@gmail.com', 'New Registration Request', f'New user requested registration: {email}')
    socketio.emit('new_registration_request', {'email': email}, room=None)

    return jsonify({'message': 'Registration request submitted'}), 201



# ADMIN: Pregled svih zahteva za registraciju
@app.route('/adminregistrationrequests', methods=['GET'])
@jwt_required()
def get_registration_requests():
    user = get_current_user()
    if user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    reqs = registration_requests.find()
    result = []
    for r in reqs:
        r['_id'] = str(r['_id'])
        r.pop('password')  # Ne šalji lozinku
        result.append(r)
    return jsonify(result), 200

# ADMIN: Potvrda registracije
@app.route('/admin/approve/<req_id>', methods=['POST'])
@jwt_required()
def approve_registration(req_id):
    user = get_current_user()
    if user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    req = registration_requests.find_one({'_id': ObjectId(req_id)})
    if not req:
        return jsonify({'error': 'Request not found'}), 404

    req['first_login'] = True
    user_id = users.insert_one({k: v for k, v in req.items() if k != '_id'}).inserted_id
    registration_requests.delete_one({'_id': ObjectId(req_id)})
    send_email(req['email'], 'Registration Approved', 'Your account has been approved.')
    socketio.emit('registration_approved', {'req_id': req_id})

    return jsonify({'message': 'User approved', 'user_id': str(user_id)}), 200

# ADMIN: Odbijanje registracije
@app.route('/admin/decline/<req_id>', methods=['POST'])
@jwt_required()
def decline_registration(req_id):
    user = get_current_user()
    if user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    req = registration_requests.find_one({'_id': ObjectId(req_id)})
    if not req:
        return jsonify({'error': 'Request not found'}), 404

    registration_requests.delete_one({'_id': ObjectId(req_id)})
    send_email(req['email'], 'Registration Declined', 'Your registration was declined.')
    socketio.emit('registration_declined', {'req_id': req_id})

    return jsonify({'message': 'Request declined'}), 200

# LOGIN
from jsonschema import validate, ValidationError

@app.route('/login', methods=['POST'])
def login():
    data = request.json

    try:
        validate(instance=data, schema=user_login_schema)
    except ValidationError as e:
        return jsonify({'error': f'Invalid input: {e.message}'}), 400

    user = users.find_one({'email': data['email']})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if user.get('first_login', False):
        send_email('admin@forum.com', 'User First Login', f"User {user['email']} logged in for the first time.")
        users.update_one({'_id': user['_id']}, {'$set': {'first_login': False}})

    access_token = create_access_token(
        identity=str(user['_id']),
        additional_claims={
            'role': user.get('role', 'user'),
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'country': user['country'],
            'address': user['address'],
            'city': user['city'],
            'phone': user['phone']
        }
    )
    return jsonify({
        'access_token': access_token,
        'role': user.get('role', 'user')  # vrati rolu za frontend
    }), 200
@app.route('/admin/approved_users', methods=['GET'])
@jwt_required()
def get_approved_users():
    user = get_current_user()
    if user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    approved = users.find()
    result = []
    for u in approved:
        u['_id'] = str(u['_id'])
        u.pop('password', None)  # ne šalji lozinku
        result.append(u)
    return jsonify(result), 200



# KREIRANJE, IZMENA I BRISANJE TEMA (admin samo)
@app.route('/topics', methods=['POST'])
@jwt_required()
def create_topic():
    user = get_current_user()
    if user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.json
    topics.insert_one(data)
    return jsonify({'message': 'Topic created'}), 201

@app.route('/topics/<topic_id>', methods=['PUT'])
@jwt_required()
def update_topic(topic_id):
    user = get_current_user()
    if user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    topics.update_one({'_id': ObjectId(topic_id)}, {'$set': request.json})
    return jsonify({'message': 'Topic updated'}), 200

@app.route('/topics/<topic_id>', methods=['DELETE'])
@jwt_required()
def delete_topic(topic_id):
    user = get_current_user()
    if user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    topics.delete_one({'_id': ObjectId(topic_id)})
    return jsonify({'message': 'Topic deleted'}), 200



@app.route('/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = users.find_one({'email': email})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Ne šalji lozinku nazad
    user.pop('password', None)
    user['_id'] = str(user['_id'])
    return jsonify(user), 200




@app.route('/user/profile/<email>', methods=['PUT'])
@jwt_required()
def update_user_profile(email):
    current_user_id = get_jwt_identity()
    current_user = users.find_one({'_id': ObjectId(current_user_id)})

    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 401

    # Dozvoli izmenu samo ako korisnik menja svoj profil ili je admin
    if current_user['email'] != email and current_user.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json

    # Nemoj dozvoliti izmenu emaila preko ovog endpointa, ili druge osetljive stvari
    if 'email' in data and data['email'] != email:
        return jsonify({'error': 'Email cannot be changed'}), 400

    # Ažuriraj polja koja su prosleđena (pr. ime, prezime, telefon, itd)
    update_data = {k: v for k, v in data.items() if k in ['first_name', 'last_name', 'phone', 'country', 'address', 'city']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    users.update_one({'email': email}, {'$set': update_data})
    return jsonify({'message': 'Profile updated'}), 200


# KREIRANJE, IZMENA I BRISANJE DISKUSIJA (creator ili admin)
@app.route('/discussions', methods=['POST'])
@jwt_required()
def create_discussion():
    user = get_current_user()
    data = request.json
    if not data:
        return jsonify({'error': 'No JSON body found'}), 400

    print("Primljeni podaci za diskusiju:", data)

    if not data.get('title') or not data.get('content'):
        return jsonify({'error': 'Title and content are required'}), 400

    try:
        if 'topic_id' in data:
            data['topic_id'] = ObjectId(data['topic_id'])
    except Exception as e:
        return jsonify({'error': f'Invalid topic_id format: {str(e)}'}), 400

    data['creator_id'] = user['_id']
    data['timestamp'] = datetime.datetime.utcnow()

    discussions.insert_one(data)


    mentions = re.findall(r'@([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', data.get('content', ''))
    for mentioned_email in mentions:
        mentioned_user = users.find_one({'email': mentioned_email})
        if mentioned_user:
        # Ovo mora biti EMAIL tagovane osobe, NE admin mail
            send_email(mentioned_user['email'], 'You were mentioned', f"You were mentioned in a post by {user['email']}.")
    return jsonify({'message': 'Discussion created'}), 201

@app.route('/discussions/<discussion_id>', methods=['PUT'])
@jwt_required()
def update_discussion(discussion_id):
    user_id = get_jwt_identity()
    user = users.find_one({'_id': ObjectId(user_id)})

    if not user:
        return jsonify({'msg': 'Korisnik nije pronađen'}), 404

    discussion = discussions.find_one({'_id': ObjectId(discussion_id)})

    if not discussion:
        return jsonify({'msg': 'Diskusija nije pronađena'}), 404

    if user.get('role') != 'admin' and str(discussion.get('creator_id')) != str(user['_id']):
        return jsonify({'msg': 'Nemate pravo da izmenite ovu diskusiju'}), 403

    data = request.get_json()
    update_data = {}

    if 'title' in data:
        update_data['title'] = data['title']
    if 'content' in data:
        update_data['content'] = data['content']
    if 'topic_id' in data:
        try:
            update_data['topic_id'] = ObjectId(data['topic_id'])
        except:
            return jsonify({'msg': 'Neispravan topic_id'}), 400

    discussions.update_one({'_id': ObjectId(discussion_id)}, {'$set': update_data})
    return jsonify({'msg': 'Diskusija uspešno izmenjena'}), 200



@app.route('/discussions/<discussion_id>', methods=['DELETE'])
@jwt_required()
def delete_discussion(discussion_id):
    user = get_current_user()
    discussion = discussions.find_one({'_id': ObjectId(discussion_id)})
    if not discussion:
        return jsonify({'error': 'Not found'}), 404
    if user.get('role') != 'admin' and str(discussion.get('creator_id')) != str(user['_id']):
        return jsonify({'error': 'Unauthorized'}), 403

    discussions.delete_one({'_id': ObjectId(discussion_id)})
    comments.delete_many({'discussion_id': ObjectId(discussion_id)})
    likes.delete_many({'discussion_id': ObjectId(discussion_id)})
    return jsonify({'message': 'Discussion deleted'}), 200


# KOMENTARI - dodavanje, brisanje (user, autor diskusije ili admin)
@app.route('/discussions/<discussion_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(discussion_id):
    user = get_current_user()
    data = request.json
    data['discussion_id'] = ObjectId(discussion_id)
    data['creator_id'] = user['_id']
    data['timestamp'] = datetime.datetime.utcnow()
    comments.insert_one(data)

    mentions = re.findall(r'@([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', data.get('content', ''))
    for mentioned_email in mentions:
        mentioned_user = users.find_one({'email': mentioned_email})
        if mentioned_user:
        # Ovo mora biti EMAIL tagovane osobe, NE admin mail
            send_email(mentioned_user['email'], 'You were mentioned', f"You were mentioned in a post by {user['email']}.")


    return jsonify({'message': 'Comment added'}), 201

@app.route('/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user = get_current_user()
    comment = comments.find_one({'_id': ObjectId(comment_id)})
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    discussion = discussions.find_one({'_id': comment['discussion_id']})
    if not discussion:
        return jsonify({'error': 'Discussion not found'}), 404

    # Provera prava brisanja:
    # korisnik može obrisati komentar ako je on autor diskusije ili autor komentara
    if user['_id'] != discussion['creator_id'] and user['_id'] != comment['creator_id']:
        return jsonify({'error': 'Unauthorized'}), 403

    comments.delete_one({'_id': ObjectId(comment_id)})
    return jsonify({'message': 'Comment deleted'}), 200


# LAJK/DISLAJK - samo 1 per user po diskusiji
@app.route('/discussions/<discussion_id>/like', methods=['POST'])
@jwt_required()
def like_discussion(discussion_id):
    user = get_current_user()
    existing = likes.find_one({'discussion_id': ObjectId(discussion_id), 'user_id': user['_id']})

    if existing:
        if existing['value'] == 'like':
            return jsonify({'error': 'Already liked'}), 400
        else:
            likes.update_one({'_id': existing['_id']}, {'$set': {'value': 'like'}})
            return jsonify({'message': 'Changed to like'}), 200

    likes.insert_one({'discussion_id': ObjectId(discussion_id), 'user_id': user['_id'], 'value': 'like'})
    return jsonify({'message': 'Liked'}), 201


@app.route('/discussions/<discussion_id>/dislike', methods=['POST'])
@jwt_required()
def dislike_discussion(discussion_id):
    user = get_current_user()
    existing = likes.find_one({'discussion_id': ObjectId(discussion_id), 'user_id': user['_id']})

    if existing:
        if existing['value'] == 'dislike':
            return jsonify({'error': 'Already disliked'}), 400
        else:
            likes.update_one({'_id': existing['_id']}, {'$set': {'value': 'dislike'}})
            return jsonify({'message': 'Changed to dislike'}), 200

    likes.insert_one({'discussion_id': ObjectId(discussion_id), 'user_id': user['_id'], 'value': 'dislike'})
    return jsonify({'message': 'Disliked'}), 201


# PRETRAGA DISKUSIJA (po naslovu, sadržaju, korisniku, temi)
@app.route('/search', methods=['GET'])
def search():
    q = request.args.get('q', '').strip()
    if not q:
        # Ako nema upita, vrati sve diskusije
        results = discussions.find().sort('timestamp', -1)
    else:
        pipeline = [
            {
                "$lookup": {
                    "from": "users",
                    "localField": "creator_id",
                    "foreignField": "_id",
                    "as": "creator"
                }
            },
            {
                "$unwind": {
                    "path": "$creator",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$lookup": {
                    "from": "topics",
                    "localField": "topic_id",
                    "foreignField": "_id",
                    "as": "topic"
                }
            },
            {
                "$unwind": {
                    "path": "$topic",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$match": {
                    "$or": [
                        {"title": {"$regex": q, "$options": "i"}},
                        {"content": {"$regex": q, "$options": "i"}},
                        {"creator.email": {"$regex": q, "$options": "i"}},
                        {"topic.name": {"$regex": q, "$options": "i"}}
                    ]
                }
            },
            {
                "$sort": {"timestamp": -1}
            }
        ]
        results = discussions.aggregate(pipeline)

    output = []
    for d in results:
        like_count = likes.count_documents({'discussion_id': d['_id'], 'value': 'like'})
        dislike_count = likes.count_documents({'discussion_id': d['_id'], 'value': 'dislike'})

        output.append({
            "id": str(d["_id"]),
            "title": d.get("title"),
            "content": d.get("content"),
            "creator": d.get("creator", {}).get("email", "Nepoznato"),
            "topic": d.get("topic", {}).get("name", "N/A"),
            "likes": like_count,
            "dislikes": dislike_count,
            "timestamp": d.get("timestamp").isoformat() if d.get("timestamp") else None
        })

    return jsonify(output), 200


# GET rute za pregled podataka (za UI ili testiranje)
@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    user = get_current_user()
    if user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    all_users = users.find()
    out = []
    for u in all_users:
        out.append({
            'id': str(u['_id']),
            'username': u['username'],
            'email': u['email'],
            'role': u['role'],
        })
    return jsonify(out), 200

@app.route('/topics', methods=['GET'])
def get_topics():
    all_topics = topics.find()
    out = []
    for t in all_topics:
        out.append({
            'id': str(t['_id']),
            'name': t.get('name'),
            'description': t.get('description')
        })
    return jsonify(out), 200

@app.route('/discussions', methods=['GET'])
def get_discussions():
    results = discussions.find().sort('timestamp', -1)
    out = []
    for d in results:
        try:
            creator = users.find_one({'_id': ObjectId(d['creator_id'])}) if d.get('creator_id') else None
        except:
            creator = None
        topic = topics.find_one({'_id': d.get('topic_id')}) if d.get('topic_id') else None
        like_count = likes.count_documents({'discussion_id': d['_id'], 'value': 'like'})
        dislike_count = likes.count_documents({'discussion_id': d['_id'], 'value': 'dislike'})
        out.append({
            'id': str(d['_id']),
            'title': d.get('title'),
            'content': d.get('content'),
            'creator': creator.get('email') if creator else None,
            'topic': topic['name'] if topic else None,
            'likes': like_count,
            'dislikes': dislike_count,
            'timestamp': d.get('timestamp').isoformat() if d.get('timestamp') else None
        })
    return jsonify(out), 200

@app.route('/discussions/<discussion_id>/comments', methods=['GET'])
def get_comments(discussion_id):
    coms = comments.find({'discussion_id': ObjectId(discussion_id)}).sort('timestamp', 1)
    out = []
    for c in coms:
        creator = users.find_one({'_id': c['creator_id']})
        out.append({
            'id': str(c['_id']),
            'content': c.get('content'),
            'creator': creator['email'] if creator else None,
            'timestamp': c.get('timestamp').isoformat() if c.get('timestamp') else None
        })
    return jsonify(out), 200

# Pokretanje aplikacije sa websocket podrškom
if __name__ == '__main__':
    #users.delete_many({})
    #registration_requests.delete_many({})
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
