import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    FLASK_DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql+psycopg2://plantech_user:plantech_pass@localhost:5432/plantech_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        seconds=int(os.environ.get('JWT_REFRESH_TOKEN_EXPIRES', 2592000))
    )
    
    # File Upload Configuration
    MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', 10485760))  # 10MB
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads')
    ALLOWED_EXTENSIONS = os.environ.get('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,webp').split(',')
    
    # Email Configuration
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    # Redis Configuration
    REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
    
    # Celery Configuration
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/1')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')
    
    # Security Configuration
    BCRYPT_LOG_ROUNDS = int(os.environ.get('BCRYPT_LOG_ROUNDS', 12))
    PASSWORD_SALT = os.environ.get('PASSWORD_SALT', 'your-password-salt-change-in-production')
    
    # API Configuration
    API_RATE_LIMIT = int(os.environ.get('API_RATE_LIMIT', 100))
    API_RATE_LIMIT_WINDOW = int(os.environ.get('API_RATE_LIMIT_WINDOW', 3600))
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'logs/plantech.log')
    
    # CORS Configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')
    
    # Model Configuration
    MODEL_PATH = os.environ.get('MODEL_PATH', 'plant_model_5Classes.tflite')
    CLASS_NAMES = os.environ.get('CLASS_NAMES', 'Healthy,Powdery,Rust,Slug,Spot').split(',')
    
    # Analytics Configuration
    ANALYTICS_ENABLED = os.environ.get('ANALYTICS_ENABLED', 'True').lower() == 'true'
    ANALYTICS_RETENTION_DAYS = int(os.environ.get('ANALYTICS_RETENTION_DAYS', 365))
    
    # Notification Configuration
    NOTIFICATION_RETENTION_DAYS = int(os.environ.get('NOTIFICATION_RETENTION_DAYS', 30))
    PUSH_NOTIFICATIONS_ENABLED = os.environ.get('PUSH_NOTIFICATIONS_ENABLED', 'False').lower() == 'true'
    
    # Development Configuration
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    TESTING = os.environ.get('TESTING', 'False').lower() == 'true'
    DEVELOPMENT = os.environ.get('DEVELOPMENT', 'True').lower() == 'true'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    DEVELOPMENT = True
    FLASK_ENV = 'development'
    FLASK_DEBUG = True
    
    # Use SQLite for local development
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'sqlite:///predictions.db'
    )

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    DEVELOPMENT = False
    FLASK_ENV = 'production'
    FLASK_DEBUG = False
    
    def __init__(self):
        super().__init__()
        # Override with production-specific settings
        self.SECRET_KEY = os.environ.get('SECRET_KEY')
        self.JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
        
        # Validate production settings
        if not self.SECRET_KEY or self.SECRET_KEY == 'your-secret-key-change-in-production':
            raise ValueError("SECRET_KEY must be set in production")
        
        if not self.JWT_SECRET_KEY or self.JWT_SECRET_KEY == 'jwt-secret-key-change-in-production':
            raise ValueError("JWT_SECRET_KEY must be set in production")

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    DEVELOPMENT = False
    FLASK_ENV = 'testing'
    FLASK_DEBUG = True
    
    # Use in-memory database for testing
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Disable CSRF protection for testing
    WTF_CSRF_ENABLED = False

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(config_name=None):
    """Get configuration based on environment"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    return config.get(config_name, config['default'])

def load_dotenv_if_exists():
    """Load .env file if it exists"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        # python-dotenv not installed, skip
        pass

def validate_config():
    """Validate configuration settings"""
    errors = []
    
    # Check required settings
    if not Config.SECRET_KEY or Config.SECRET_KEY == 'your-secret-key-change-in-production':
        errors.append("SECRET_KEY must be set")
    
    if not Config.JWT_SECRET_KEY or Config.JWT_SECRET_KEY == 'jwt-secret-key-change-in-production':
        errors.append("JWT_SECRET_KEY must be set")
    
    # Check file upload settings
    if not os.path.exists(Config.UPLOAD_FOLDER):
        try:
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        except Exception as e:
            errors.append(f"Cannot create upload folder: {e}")
    
    # Check model file
    if not os.path.exists(Config.MODEL_PATH):
        errors.append(f"Model file not found: {Config.MODEL_PATH}")
    
    return errors

def print_config_summary():
    """Print a summary of current configuration"""
    print("=" * 50)
    print("PlantTech Backend Configuration Summary")
    print("=" * 50)
    print(f"Environment: {Config.FLASK_ENV}")
    print(f"Debug Mode: {Config.DEBUG}")
    print(f"Database: {Config.SQLALCHEMY_DATABASE_URI}")
    print(f"Upload Folder: {Config.UPLOAD_FOLDER}")
    print(f"Max File Size: {Config.MAX_FILE_SIZE // 1024 // 1024}MB")
    print(f"Allowed Extensions: {', '.join(Config.ALLOWED_EXTENSIONS)}")
    print(f"Model Path: {Config.MODEL_PATH}")
    print(f"Model Exists: {os.path.exists(Config.MODEL_PATH)}")
    print(f"CORS Origins: {', '.join(Config.CORS_ORIGINS)}")
    print("=" * 50)

# Load environment variables on import
load_dotenv_if_exists() 