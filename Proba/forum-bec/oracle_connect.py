
user_login_schema = {
    "type": "object",
    "properties": {
        "email": {"type": "string", "format": "email"},
        "password": {"type": "string", "minLength": 6}
    },
    "required": ["email", "password"],
    "additionalProperties": False
}

