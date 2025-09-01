from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, get_jwt_identity,
    verify_jwt_in_request, get_jwt
)
from email_validator import validate_email, EmailNotValidError
import re
from datetime import datetime, timezone, timedelta
from models import User, UserSettings, db
import os

def validate_password(password):
    """
    Validate password strength
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is valid"

def validate_email_format(email):
    """
    Validate email format
    """
    try:
        validate_email(email)
        return True, "Email is valid"
    except EmailNotValidError as e:
        return False, str(e)

def validate_username(username):
    """
    Validate username format
    """
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
    
    if len(username) > 30:
        return False, "Username must be less than 30 characters"
    
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return False, "Username can only contain letters, numbers, and underscores"
    
    return True, "Username is valid"

def create_user_tokens(user):
    """
    Create access and refresh tokens for a user
    """
    access_token = create_access_token(
        identity=user.id,
        additional_claims={
            'email': user.email,
            'username': user.username,
            'is_admin': user.is_admin
        }
    )
    refresh_token = create_refresh_token(identity=user.id)
    
    return access_token, refresh_token

def login_user(user):
    """
    Log in a user and update last login time
    """
    user.last_login = datetime.now(timezone.utc)
    db.session.commit()
    
    return create_user_tokens(user)

def require_auth(f):
    """
    Decorator to require authentication
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Authentication required'}), 401
    
    return decorated_function

def require_admin(f):
    """
    Decorator to require admin privileges
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            
            if not claims.get('is_admin', False):
                return jsonify({'error': 'Admin privileges required'}), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Authentication required'}), 401
    
    return decorated_function

def get_current_user():
    """
    Get current authenticated user
    """
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        return User.query.get(current_user_id)
    except:
        return None

def create_default_user_settings(user_id):
    """
    Create default settings for a new user
    """
    settings = UserSettings(
        user_id=user_id,
        email_notifications=True,
        push_notifications=True,
        theme='light',
        language='en',
        timezone='UTC',
        max_file_size=10485760,  # 10MB
        allowed_file_types='image/jpeg,image/png,image/gif,image/webp'
    )
    db.session.add(settings)
    db.session.commit()
    return settings

def validate_file_upload(file, user_settings=None):
    """
    Validate file upload based on user settings or defaults
    """
    if not file:
        return False, "No file provided"
    
    # Default settings
    max_size = 10485760  # 10MB
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    
    # Use user settings if available
    if user_settings:
        max_size = user_settings.max_file_size
        allowed_types = user_settings.allowed_file_types.split(',') if user_settings.allowed_file_types else allowed_types
    
    # Check file size
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    if file_size > max_size:
        return False, f"File size exceeds maximum allowed size of {max_size // 1024 // 1024}MB"
    
    # Check file type
    if file.content_type not in allowed_types:
        return False, f"File type {file.content_type} is not allowed. Allowed types: {', '.join(allowed_types)}"
    
    return True, "File is valid"

def generate_password_reset_token(user):
    """
    Generate a password reset token
    """
    reset_token = create_access_token(
        identity=user.id,
        additional_claims={'type': 'password_reset'},
        expires_delta=timedelta(hours=1)
    )
    return reset_token

def verify_password_reset_token(token):
    """
    Verify a password reset token
    """
    try:
        verify_jwt_in_request()
        claims = get_jwt()
        
        if claims.get('type') != 'password_reset':
            return None, "Invalid token type"
        
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return None, "User not found"
        
        return user, "Token is valid"
    except Exception as e:
        return None, "Invalid token"

def sanitize_filename(filename):
    """
    Sanitize filename for safe storage
    """
    # Remove or replace dangerous characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Limit length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:255-len(ext)] + ext
    return filename

def get_user_from_request():
    """
    Get user from request (supports both JWT and API key)
    """
    # Try JWT first
    user = get_current_user()
    if user:
        return user
    
    # Try API key (for future implementation)
    api_key = request.headers.get('X-API-Key')
    if api_key:
        # TODO: Implement API key authentication
        pass
    
    return None

def log_user_activity(user_id, activity_type, details=None):
    """
    Log user activity for analytics
    """
    # TODO: Implement activity logging
    pass

def check_rate_limit(user_id, action_type, limit=100, window=3600):
    """
    Check rate limiting for user actions
    """
    # TODO: Implement rate limiting
    return True

def send_notification(user_id, title, message, notification_type='info'):
    """
    Send notification to user
    """
    from models import Notification
    
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return notification 