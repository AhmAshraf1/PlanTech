from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from PIL import Image
from datetime import datetime, timezone, timedelta
import traceback
import csv
from io import StringIO
import json
from sqlalchemy import func, and_, or_, desc, asc
from sqlalchemy.sql import extract

from models import db, User, Prediction, Notification, UserSettings, Analytics, DiseaseStats, FileUpload
from auth import (
    require_auth, require_admin, get_current_user, create_user_tokens, login_user,
    validate_password, validate_email_format, validate_username, validate_file_upload,
    create_default_user_settings, sanitize_filename, send_notification
)
from utils import load_model, predict
from analytics import analytics_bp

app = Flask(__name__)

# Import configuration
from config import get_config

# Configuration
config = get_config()
app.config.from_object(config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'], supports_credentials=True)

# Register blueprints
app.register_blueprint(analytics_bp)

# Constants
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MODEL_PATH = 'plant_model_5Classes.tflite'
CLASS_NAMES = ['Healthy', 'Powdery', 'Rust', 'Slug', 'Spot']

# Load model
try:
    interpreter = load_model(model_path=MODEL_PATH)
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    interpreter = None

# Initialize database
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create admin user if not exists
        admin = User.query.filter_by(email='admin@plantech.com').first()
        if not admin:
            admin = User(
                email='admin@plantech.com',
                username='admin',
                first_name='Admin',
                last_name='User',
                is_admin=True,
                email_verified=True
            )
            admin.set_password('Admin123!')
            db.session.add(admin)
            db.session.commit()
            create_default_user_settings(admin.id)
            print("Admin user created")

init_db()

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Health check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'model_loaded': interpreter is not None,
        'database_connected': True
    })

# Authentication endpoints
@app.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'username', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate email
        is_valid, email_error = validate_email_format(data['email'])
        if not is_valid:
            return jsonify({'error': email_error}), 400
        
        # Validate username
        is_valid, username_error = validate_username(data['username'])
        if not is_valid:
            return jsonify({'error': username_error}), 400
        
        # Validate password
        is_valid, password_error = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': password_error}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 409
        
        # Create user
        user = User(
            email=data['email'],
            username=data['username'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Create default settings
        create_default_user_settings(user.id)
        
        # Generate tokens
        access_token, refresh_token = create_user_tokens(user)
        
        return jsonify({
            'message': 'User registered successfully',
            'token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user by email or username
        user = User.query.filter(
            or_(User.email == data['email'], User.username == data['email'])
        ).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Login user and generate tokens
        access_token, refresh_token = login_user(user)
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/logout', methods=['POST'])
@require_auth
def logout():
    # JWT tokens are stateless, so we just return success
    # In a real application, you might want to blacklist the token
    return jsonify({'message': 'Logout successful'})

@app.route('/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 401
        
        access_token, _ = create_user_tokens(user)
        
        return jsonify({
            'token': access_token
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    user = get_current_user()
    return jsonify(user.to_dict())

@app.route('/auth/profile', methods=['PUT'])
@require_auth
def update_profile():
    try:
        user = get_current_user()
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            is_valid, email_error = validate_email_format(data['email'])
            if not is_valid:
                return jsonify({'error': email_error}), 400
            user.email = data['email']
        if 'username' in data:
            # Check if username is already taken
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({'error': 'Username already taken'}), 409
            user.username = data['username']
        
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/auth/change-password', methods=['PUT'])
@require_auth
def change_password():
    try:
        user = get_current_user()
        data = request.get_json()
        
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password
        is_valid, password_error = validate_password(data['new_password'])
        if not is_valid:
            return jsonify({'error': password_error}), 400
        
        # Set new password
        user.set_password(data['new_password'])
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/auth/profile', methods=['DELETE'])
@require_auth
def delete_account():
    try:
        user = get_current_user()
        
        # Delete user's predictions
        Prediction.query.filter_by(user_id=user.id).delete()
        
        # Delete user's notifications
        Notification.query.filter_by(user_id=user.id).delete()
        
        # Delete user's settings
        UserSettings.query.filter_by(user_id=user.id).delete()
        
        # Delete user's analytics
        Analytics.query.filter_by(user_id=user.id).delete()
        
        # Delete user's files
        FileUpload.query.filter_by(user_id=user.id).delete()
        
        # Delete user
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Account deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Prediction endpoints
@app.route('/predict', methods=['POST'])
def predict_single():
    if not interpreter:
        return jsonify({'error': 'Model not loaded'}), 500

    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Get current user if authenticated
    user = get_current_user()
    user_settings = user.settings if user else None
    
    # Validate file
    is_valid, error_message = validate_file_upload(file, user_settings)
    if not is_valid:
        return jsonify({'error': error_message}), 400
    
    try:
        start_time = datetime.now()
        
        # Save file
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        saved_filename = f"{unique_id}_{sanitize_filename(filename)}"
        save_path = os.path.join(UPLOAD_FOLDER, saved_filename)
        file.save(save_path)

        # Get file info
        file_size = os.path.getsize(save_path)
        file_type = file.content_type
        
        # Process image
        image = Image.open(save_path)
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # Get image dimensions
        image_width, image_height = image.size
        
        # Make prediction
        predicted_class, confidence = predict(image, CLASS_NAMES, interpreter)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()

        # Save to database
        prediction = Prediction(
            user_id=user.id if user else None,
            filename=saved_filename,
            original_filename=filename,
            predicted_class=predicted_class,
            confidence=confidence,
            file_size=file_size,
            file_type=file_type,
            image_width=image_width,
            image_height=image_height,
            processing_time=processing_time
        )
        
        db.session.add(prediction)
        db.session.commit()
        
        # Send notification if user is authenticated
        if user:
            send_notification(
                user.id,
                'Analysis Complete',
                f'Your image has been analyzed. Result: {predicted_class} ({(confidence * 100):.1f}% confidence)',
                'success'
            )
        
        return jsonify({
            'id': prediction.id,
            'predicted_class': predicted_class,
            'confidence': confidence,
            'image_url': f"/uploads/{saved_filename}",
            'processing_time': processing_time
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    if not interpreter:
        return jsonify({'error': 'Model not loaded'}), 500
    
    if 'images' not in request.files:
        return jsonify({'error': 'No images uploaded'}), 400
    
    files = request.files.getlist('images')
    if not files:
        return jsonify({'error': 'No files selected'}), 400
    
    # Get current user if authenticated
    user = get_current_user()
    user_settings = user.settings if user else None
    
    results = []
    
    for file in files:
        if file.filename == '':
            continue
        
        # Validate file
        is_valid, error_message = validate_file_upload(file, user_settings)
        if not is_valid:
            results.append({
                'filename': file.filename,
                'error': error_message
            })
            continue
        
        try:
            start_time = datetime.now()
            
            # Save file
            filename = secure_filename(file.filename)
            unique_id = str(uuid.uuid4())
            saved_filename = f"{unique_id}_{sanitize_filename(filename)}"
            save_path = os.path.join(UPLOAD_FOLDER, saved_filename)
            file.save(save_path)
            
            # Get file info
            file_size = os.path.getsize(save_path)
            file_type = file.content_type
            
            # Process image
            image = Image.open(save_path)
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Get image dimensions
            image_width, image_height = image.size
            
            # Make prediction
            predicted_class, confidence = predict(image, CLASS_NAMES, interpreter)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Save to database
            prediction = Prediction(
                user_id=user.id if user else None,
                filename=saved_filename,
                original_filename=filename,
                predicted_class=predicted_class,
                confidence=confidence,
                file_size=file_size,
                file_type=file_type,
                image_width=image_width,
                image_height=image_height,
                processing_time=processing_time
            )
            
            db.session.add(prediction)
            db.session.commit()
            
            results.append({
                'id': prediction.id,
                'filename': filename,
                'predicted_class': predicted_class,
                'confidence': confidence,
                'image_url': f"/uploads/{saved_filename}",
                'processing_time': processing_time
            })
            
        except Exception as e:
            results.append({
                'filename': file.filename,
                'error': str(e)
            })
    
    return jsonify({
        'results': results,
        'total_processed': len([r for r in results if 'error' not in r]),
        'total_failed': len([r for r in results if 'error' in r])
    })

# History endpoints
@app.route('/history', methods=['GET'])
def get_history():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '')
        date_filter = request.args.get('date_filter', 'all')
        confidence_filter = request.args.get('confidence_filter', 'all')
        disease_filter = request.args.get('disease_filter', 'all')
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Get current user
        user = get_current_user()
        
        # Build query
        query = Prediction.query
        
        # Filter by user if authenticated
        if user:
            query = query.filter(Prediction.user_id == user.id)
        
        # Apply filters
        if search:
            query = query.filter(
                or_(
                    Prediction.predicted_class.ilike(f'%{search}%'),
                    Prediction.original_filename.ilike(f'%{search}%')
                )
            )
        
        if date_filter != 'all':
            now = datetime.now(timezone.utc)
            if date_filter == 'today':
                query = query.filter(func.date(Prediction.created_at) == func.date(now))
            elif date_filter == 'yesterday':
                yesterday = now - timedelta(days=1)
                query = query.filter(func.date(Prediction.created_at) == func.date(yesterday))
            elif date_filter == 'week':
                week_ago = now - timedelta(days=7)
                query = query.filter(Prediction.created_at >= week_ago)
            elif date_filter == 'month':
                month_ago = now - timedelta(days=30)
                query = query.filter(Prediction.created_at >= month_ago)
        
        if confidence_filter != 'all':
            if confidence_filter == 'high':
                query = query.filter(Prediction.confidence >= 0.85)
            elif confidence_filter == 'medium':
                query = query.filter(
                    and_(Prediction.confidence >= 0.6, Prediction.confidence < 0.85)
                )
            elif confidence_filter == 'low':
                query = query.filter(Prediction.confidence < 0.6)
        
        if disease_filter != 'all':
            query = query.filter(Prediction.predicted_class == disease_filter)
        
        # Apply sorting
        if sort_by == 'created_at':
            order_column = Prediction.created_at
        elif sort_by == 'confidence':
            order_column = Prediction.confidence
        elif sort_by == 'predicted_class':
            order_column = Prediction.predicted_class
        else:
            order_column = Prediction.created_at
        
        if sort_order == 'asc':
            query = query.order_by(asc(order_column))
        else:
            query = query.order_by(desc(order_column))
        
        # Paginate
        pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        results = [prediction.to_dict() for prediction in pagination.items]
        
        return jsonify({
            'results': results,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history/<prediction_id>', methods=['GET'])
def get_history_item(prediction_id):
    try:
        user = get_current_user()
        
        query = Prediction.query.filter(Prediction.id == prediction_id)
        if user:
            query = query.filter(Prediction.user_id == user.id)
        
        prediction = query.first()
        
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        return jsonify(prediction.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history/<prediction_id>', methods=['DELETE'])
@require_auth
def delete_history_item(prediction_id):
    try:
        user = get_current_user()
        
        prediction = Prediction.query.filter(
            and_(Prediction.id == prediction_id, Prediction.user_id == user.id)
        ).first()
        
        if not prediction:
            return jsonify({'error': 'Prediction not found'}), 404
        
        # Delete file
        try:
            file_path = os.path.join(UPLOAD_FOLDER, prediction.filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
        
        db.session.delete(prediction)
        db.session.commit()
        
        return jsonify({'message': 'Prediction deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/history/export', methods=['GET'])
def export_history():
    try:
        # Get query parameters
        format_type = request.args.get('format', 'csv')
        search = request.args.get('search', '')
        date_filter = request.args.get('date_filter', 'all')
        confidence_filter = request.args.get('confidence_filter', 'all')
        disease_filter = request.args.get('disease_filter', 'all')
        
        # Get current user
        user = get_current_user()
        
        # Build query (same as get_history)
        query = Prediction.query
        
        if user:
            query = query.filter(Prediction.user_id == user.id)
        
        if search:
            query = query.filter(
                or_(
                    Prediction.predicted_class.ilike(f'%{search}%'),
                    Prediction.original_filename.ilike(f'%{search}%')
                )
            )
        
        if date_filter != 'all':
            now = datetime.now(timezone.utc)
            if date_filter == 'today':
                query = query.filter(func.date(Prediction.created_at) == func.date(now))
            elif date_filter == 'yesterday':
                yesterday = now - timedelta(days=1)
                query = query.filter(func.date(Prediction.created_at) == func.date(yesterday))
            elif date_filter == 'week':
                week_ago = now - timedelta(days=7)
                query = query.filter(Prediction.created_at >= week_ago)
            elif date_filter == 'month':
                month_ago = now - timedelta(days=30)
                query = query.filter(Prediction.created_at >= month_ago)
        
        if confidence_filter != 'all':
            if confidence_filter == 'high':
                query = query.filter(Prediction.confidence >= 0.85)
            elif confidence_filter == 'medium':
                query = query.filter(
                    and_(Prediction.confidence >= 0.6, Prediction.confidence < 0.85)
                )
            elif confidence_filter == 'low':
                query = query.filter(Prediction.confidence < 0.6)
        
        if disease_filter != 'all':
            query = query.filter(Prediction.predicted_class == disease_filter)
        
        predictions = query.order_by(desc(Prediction.created_at)).all()
        
        if format_type == 'csv':
            # Generate CSV
            output = StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                'ID', 'Date', 'Filename', 'Disease Detected', 'Confidence (%)',
                'File Size (bytes)', 'Processing Time (s)', 'Image Dimensions'
            ])
            
            # Write data
            for pred in predictions:
                writer.writerow([
                    pred.id,
                    pred.created_at.isoformat() if pred.created_at else '',
                    pred.original_filename,
                    pred.predicted_class,
                    f"{(pred.confidence * 100):.1f}",
                    pred.file_size,
                    pred.processing_time,
                    f"{pred.image_width}x{pred.image_height}" if pred.image_width and pred.image_height else ''
                ])
            
            return output.getvalue(), 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': f'attachment; filename=history_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            }
        
        elif format_type == 'json':
            return jsonify([pred.to_dict() for pred in predictions])
        
        else:
            return jsonify({'error': 'Unsupported format'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Notification endpoints
@app.route('/notifications', methods=['GET'])
@require_auth
def get_notifications():
    try:
        user = get_current_user()
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        query = Notification.query.filter(Notification.user_id == user.id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        pagination = query.order_by(desc(Notification.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'notifications': [notif.to_dict() for notif in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/<notification_id>/read', methods=['PUT'])
@require_auth
def mark_notification_read(notification_id):
    try:
        user = get_current_user()
        
        notification = Notification.query.filter(
            and_(Notification.id == notification_id, Notification.user_id == user.id)
        ).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/read-all', methods=['PUT'])
@require_auth
def mark_all_notifications_read():
    try:
        user = get_current_user()
        
        Notification.query.filter(
            and_(Notification.user_id == user.id, Notification.is_read == False)
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({'message': 'All notifications marked as read'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/notifications/<notification_id>', methods=['DELETE'])
@require_auth
def delete_notification(notification_id):
    try:
        user = get_current_user()
        
        notification = Notification.query.filter(
            and_(Notification.id == notification_id, Notification.user_id == user.id)
        ).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        db.session.delete(notification)
        db.session.commit()
        
        return jsonify({'message': 'Notification deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# User management endpoints
@app.route('/users', methods=['GET'])
@require_admin
def get_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '')
        
        query = User.query
        
        if search:
            query = query.filter(
                or_(
                    User.email.ilike(f'%{search}%'),
                    User.username.ilike(f'%{search}%'),
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%')
                )
            )
        
        pagination = query.order_by(desc(User.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<user_id>', methods=['GET'])
@require_admin
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/users/<user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_admin' in data:
            user.is_admin = data['is_admin']
        if 'email_verified' in data:
            user.email_verified = data['email_verified']
        
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/users/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.is_admin:
            return jsonify({'error': 'Cannot delete admin user'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Settings endpoints
@app.route('/settings', methods=['GET'])
@require_auth
def get_settings():
    try:
        user = get_current_user()
        settings = user.settings
        
        if not settings:
            settings = create_default_user_settings(user.id)
        
        return jsonify(settings.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/settings', methods=['PUT'])
@require_auth
def update_settings():
    try:
        user = get_current_user()
        settings = user.settings
        
        if not settings:
            settings = create_default_user_settings(user.id)
        
        data = request.get_json()
        
        # Update allowed fields
        if 'email_notifications' in data:
            settings.email_notifications = data['email_notifications']
        if 'push_notifications' in data:
            settings.push_notifications = data['push_notifications']
        if 'theme' in data:
            settings.theme = data['theme']
        if 'language' in data:
            settings.language = data['language']
        if 'timezone' in data:
            settings.timezone = data['timezone']
        if 'max_file_size' in data:
            settings.max_file_size = data['max_file_size']
        if 'allowed_file_types' in data:
            settings.allowed_file_types = ','.join(data['allowed_file_types'])
        
        settings.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({
            'message': 'Settings updated successfully',
            'settings': settings.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# File management endpoints
@app.route('/files/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        file_type = request.form.get('type', 'image')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get current user if authenticated
        user = get_current_user()
        user_settings = user.settings if user else None
        
        # Validate file
        is_valid, error_message = validate_file_upload(file, user_settings)
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        saved_filename = f"{unique_id}_{sanitize_filename(filename)}"
        save_path = os.path.join(UPLOAD_FOLDER, saved_filename)
        file.save(save_path)
        
        # Get file info
        file_size = os.path.getsize(save_path)
        
        # Create file upload record
        file_upload = FileUpload(
            user_id=user.id if user else None,
            filename=saved_filename,
            original_filename=filename,
            file_size=file_size,
            file_type=file.content_type,
            upload_path=save_path
        )
        
        db.session.add(file_upload)
        db.session.commit()

        return jsonify({
            'message': 'File uploaded successfully',
            'file': file_upload.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/files/<file_id>', methods=['DELETE'])
@require_auth
def delete_file(file_id):
    try:
        user = get_current_user()
        
        file_upload = FileUpload.query.filter(
            and_(FileUpload.id == file_id, FileUpload.user_id == user.id)
        ).first()
        
        if not file_upload:
            return jsonify({'error': 'File not found'}), 404
        
        # Delete physical file
        try:
            if os.path.exists(file_upload.upload_path):
                os.remove(file_upload.upload_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
        
        db.session.delete(file_upload)
        db.session.commit()
        
        return jsonify({'message': 'File deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# File serving
@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    try:
        response = send_from_directory(UPLOAD_FOLDER, filename)
        # Add CORS headers for image serving
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    except Exception as e:
        return jsonify({'error': 'File not found'}), 404

# System info
@app.route('/system/info', methods=['GET'])
def get_system_info():
    try:
        # Get basic system stats
        total_users = User.query.count()
        total_predictions = Prediction.query.count()
        total_notifications = Notification.query.count()
        
        # Get recent activity
        recent_predictions = Prediction.query.order_by(
            desc(Prediction.created_at)
        ).limit(5).all()

        return jsonify({
            'system_stats': {
                'total_users': total_users,
                'total_predictions': total_predictions,
                'total_notifications': total_notifications,
                'model_loaded': interpreter is not None
            },
            'recent_activity': [
                {
                    'id': pred.id,
                    'predicted_class': pred.predicted_class,
                    'confidence': pred.confidence,
                    'created_at': pred.created_at.isoformat() if pred.created_at else None
                } for pred in recent_predictions
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Test endpoint
@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Backend is working!',
        'cors': 'enabled',
        'model_loaded': interpreter is not None,
        'database_connected': True,
        'timestamp': datetime.now(timezone.utc).isoformat()
    })

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5001")
    print(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print(f"Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5001)