from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timezone
import uuid

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)
    
    # Relationships
    predictions = db.relationship('Prediction', backref='user', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')
    settings = db.relationship('UserSettings', backref='user', lazy=True, uselist=False, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)  # Allow anonymous predictions
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    predicted_class = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    file_size = db.Column(db.Integer)  # File size in bytes
    file_type = db.Column(db.String(50))  # MIME type
    image_width = db.Column(db.Integer)
    image_height = db.Column(db.Integer)
    processing_time = db.Column(db.Float)  # Processing time in seconds
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'image_url': f"/uploads/{self.filename}",
            'predicted_class': self.predicted_class,
            'confidence': self.confidence,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'image_width': self.image_width,
            'image_height': self.image_height,
            'processing_time': self.processing_time,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), default='info')  # info, success, warning, error
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class UserSettings(db.Model):
    __tablename__ = 'user_settings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True)
    theme = db.Column(db.String(20), default='light')  # light, dark, auto
    language = db.Column(db.String(10), default='en')
    timezone = db.Column(db.String(50), default='UTC')
    max_file_size = db.Column(db.Integer, default=10485760)  # 10MB in bytes
    allowed_file_types = db.Column(db.Text, default='image/jpeg,image/png,image/gif,image/webp')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'email_notifications': self.email_notifications,
            'push_notifications': self.push_notifications,
            'theme': self.theme,
            'language': self.language,
            'timezone': self.timezone,
            'max_file_size': self.max_file_size,
            'allowed_file_types': self.allowed_file_types.split(',') if self.allowed_file_types else [],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Analytics(db.Model):
    __tablename__ = 'analytics'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    date = db.Column(db.Date, nullable=False)
    total_predictions = db.Column(db.Integer, default=0)
    high_confidence_predictions = db.Column(db.Integer, default=0)
    average_confidence = db.Column(db.Float, default=0.0)
    unique_diseases = db.Column(db.Integer, default=0)
    processing_time_avg = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='_user_date_uc'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'total_predictions': self.total_predictions,
            'high_confidence_predictions': self.high_confidence_predictions,
            'average_confidence': self.average_confidence,
            'unique_diseases': self.unique_diseases,
            'processing_time_avg': self.processing_time_avg,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DiseaseStats(db.Model):
    __tablename__ = 'disease_stats'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    disease_name = db.Column(db.String(100), nullable=False)
    total_occurrences = db.Column(db.Integer, default=0)
    average_confidence = db.Column(db.Float, default=0.0)
    high_confidence_count = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'disease_name': self.disease_name,
            'total_occurrences': self.total_occurrences,
            'average_confidence': self.average_confidence,
            'high_confidence_count': self.high_confidence_count,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }

class FileUpload(db.Model):
    __tablename__ = 'file_uploads'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    file_type = db.Column(db.String(100), nullable=False)
    upload_path = db.Column(db.String(500), nullable=False)
    is_processed = db.Column(db.Boolean, default=False)
    processing_status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    processed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'upload_path': self.upload_path,
            'is_processed': self.is_processed,
            'processing_status': self.processing_status,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        } 