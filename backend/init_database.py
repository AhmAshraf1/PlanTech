
import os
import sys
from pathlib import Path

# Set environment variables for development
os.environ['FLASK_ENV'] = 'development'
os.environ['FLASK_DEBUG'] = 'True'
os.environ['DEVELOPMENT'] = 'True'

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from backend_app import app, init_db

if __name__ == '__main__':
    with app.app_context():
        print("Creating database tables...")
        init_db()
        print("✅ Database initialized successfully")
