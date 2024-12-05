
user_login_schema = {
    "type": "object",
    "properties": {
        "email": {"type": "string", "format": "email"},
        "password": {"type": "string", "minLength": 6}
    },
    "required": ["email", "password"],
    "additionalProperties": False
}

user_registration_schema = {
    "type": "object",
    "properties": {
        "email": {"type": "string", "format": "email"},
        "password": {"type": "string", "minLength": 6},
        "first_name": {"type": "string"},
        "last_name": {"type": "string"},
        "country": {"type": "string"},
        "address": {"type": "string"},
        "city": {"type": "string"},
        "phone": {"type": "string"}
    },
    "required": ["email", "password", "first_name", "last_name", "country", "address", "city", "phone"],
    "additionalProperties": False
}

