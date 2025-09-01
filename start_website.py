#!/usr/bin/env python3
"""
PlantTech Website Startup Script
This script sets up and runs both the frontend and backend together
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

class PlantTechWebsite:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "plantech_backend"
        self.frontend_dir = self.project_root / "plantech_ui"
        self.backend_process = None
        self.frontend_process = None
        self.running = False

    def print_banner(self):
        """Print startup banner"""
        print("=" * 70)
        print("🌱 PlantTech Website - Complete Setup & Startup")
        print("=" * 70)
        print("This script will:")
        print("1. Set up environment configuration")
        print("2. Install dependencies")
        print("3. Start database service (if needed)")
        print("4. Check database status and initialize if needed")
        print("5. Start the backend server")
        print("6. Start the frontend development server")
        print("7. Open the website in your browser")
        print("=" * 70)

    def check_prerequisites(self):
        """Check if all prerequisites are met"""
        print("🔍 Checking prerequisites...")
        
        # Check Python version
        if sys.version_info < (3, 8):
            print("❌ Python 3.8+ is required")
            return False
        
        # Check if directories exist
        if not self.backend_dir.exists():
            print(f"❌ Backend directory not found: {self.backend_dir}")
            return False
        
        if not self.frontend_dir.exists():
            print(f"❌ Frontend directory not found: {self.frontend_dir}")
            return False
        
        # Check if Node.js is installed (for frontend)
        try:
            subprocess.run(["node", "--version"], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Node.js is required for the frontend")
            print("   Please install Node.js from https://nodejs.org/")
            return False
        
        # Check if npm is installed
        try:
            subprocess.run(["npm", "--version"], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ npm is required for the frontend")
            return False
        
        print("✅ Prerequisites check passed")
        return True

    def setup_backend(self):
        """Set up the backend"""
        print("\n🔧 Setting up backend...")
        
        # Change to backend directory
        os.chdir(self.backend_dir)
        
        # Set environment variables for development
        os.environ['FLASK_ENV'] = 'development'
        os.environ['FLASK_DEBUG'] = 'True'
        os.environ['DEVELOPMENT'] = 'True'
        
        # Create .env file if it doesn't exist
        if not Path(".env").exists():
            print("📝 Creating environment configuration...")
            try:
                result = subprocess.run([sys.executable, "setup_env.py"], 
                                      input=b'y\n', check=True, capture_output=True)
                print("✅ Environment configuration created")
            except subprocess.CalledProcessError as e:
                print(f"⚠️ Environment setup failed: {e}")
                print("Continuing with default configuration...")
        else:
            print("✅ Environment configuration already exists")
        
        # Install Python dependencies
        print("📦 Installing Python dependencies...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                          check=True, capture_output=True)
            print("✅ Python dependencies installed")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install Python dependencies: {e}")
            return False
        
        return True

    def check_database_status(self):
        """Check if database is already initialized"""
        print("🔍 Checking database status...")
        
        os.chdir(self.backend_dir)
        
        # Ensure instance directory exists
        instance_dir = Path("instance")
        instance_dir.mkdir(exist_ok=True)
        
        # Check if SQLite database file exists
        db_file = Path("predictions.db")
        if db_file.exists():
            print("✅ SQLite database file found")
            
            # Try to connect and check if tables exist
            try:
                check_script = """
import os
import sys
from pathlib import Path

# Set environment variables for development
os.environ['FLASK_ENV'] = 'development'
os.environ['FLASK_DEBUG'] = 'True'
os.environ['DEVELOPMENT'] = 'True'

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from backend_app import app, db
from models import User

with app.app_context():
    try:
        # Try to query the User table to check if it exists
        user_count = User.query.count()
        print(f"Database is initialized with {user_count} users")
        sys.exit(0)
    except Exception as e:
        print(f"Database not properly initialized: {e}")
        sys.exit(1)
"""
                
                # Write the check script
                with open("check_database.py", "w") as f:
                    f.write(check_script)
                
                # Set environment variables for the subprocess
                env = os.environ.copy()
                env['FLASK_ENV'] = 'development'
                env['FLASK_DEBUG'] = 'True'
                env['DEVELOPMENT'] = 'True'
                
                # Run the check
                result = subprocess.run([sys.executable, "check_database.py"], 
                                      capture_output=True, text=True, env=env)
                
                # Clean up the temporary script
                os.remove("check_database.py")
                
                if result.returncode == 0:
                    print("✅ Database is already initialized and working")
                    return True
                else:
                    print("⚠️ Database file exists but not properly initialized")
                    # Try to remove the corrupted database file
                    try:
                        db_file.unlink()
                        print("🗑️ Removed corrupted database file")
                    except Exception as e:
                        print(f"⚠️ Could not remove database file: {e}")
                    return False
                    
            except Exception as e:
                print(f"⚠️ Error checking database: {e}")
                return False
        else:
            print("❌ Database file not found")
            return False

    def initialize_database(self):
        """Initialize database and create tables"""
        print("\n🗄️ Initializing database...")
        
        os.chdir(self.backend_dir)
        
        # First check if database is already initialized
        if self.check_database_status():
            print("✅ Database already initialized, skipping initialization")
            return True
        
        try:
            # Create a simple script to initialize the database
            init_script = """
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
"""
            
            # Write the initialization script
            with open("init_database.py", "w") as f:
                f.write(init_script)
            
            # Set environment variables for the subprocess
            env = os.environ.copy()
            env['FLASK_ENV'] = 'development'
            env['FLASK_DEBUG'] = 'True'
            env['DEVELOPMENT'] = 'True'
            
            # Run the database initialization
            result = subprocess.run([sys.executable, "init_database.py"], 
                                  check=True, capture_output=True, text=True, env=env)
            print("✅ Database initialized successfully")
            
            # Clean up the temporary script
            os.remove("init_database.py")
            
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Database initialization failed: {e}")
            print(f"STDOUT: {e.stdout}")
            print(f"STDERR: {e.stderr}")
            return False
        except Exception as e:
            print(f"❌ Database initialization error: {e}")
            return False

    def setup_frontend(self):
        """Set up the frontend"""
        print("\n🎨 Setting up frontend...")
        
        # Change to frontend directory
        os.chdir(self.frontend_dir)
        
        # Check if node_modules exists
        if not Path("node_modules").exists():
            print("📦 Installing Node.js dependencies...")
            try:
                subprocess.run(["npm", "install"], check=True, capture_output=True)
                print("✅ Node.js dependencies installed")
            except subprocess.CalledProcessError as e:
                print(f"❌ Failed to install Node.js dependencies: {e}")
                return False
        else:
            print("✅ Node.js dependencies already installed")
        
        return True

    def start_backend(self):
        """Start the backend server"""
        print("\n🚀 Starting backend server...")
        
        os.chdir(self.backend_dir)
        
        try:
            # Start backend with simplified startup script
            self.backend_process = subprocess.Popen(
                [sys.executable, "backend_app.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a moment for backend to start
            time.sleep(5)
            
            # Check if backend is running
            if self.backend_process.poll() is None:
                print("✅ Backend server started on http://localhost:5001")
                return True
            else:
                stdout, stderr = self.backend_process.communicate()
                print(f"❌ Backend failed to start")
                print(f"STDOUT: {stdout}")
                print(f"STDERR: {stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False

    def start_frontend(self):
        """Start the frontend development server"""
        print("\n🎨 Starting frontend development server...")
        
        os.chdir(self.frontend_dir)
        
        try:
            # Start frontend development server
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait a moment for frontend to start
            time.sleep(5)
            
            # Check if frontend is running
            if self.frontend_process.poll() is None:
                print("✅ Frontend server started on http://localhost:5173")
                return True
            else:
                stdout, stderr = self.frontend_process.communicate()
                print(f"❌ Frontend failed to start: {stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Failed to start frontend: {e}")
            return False

    def open_browser(self):
        """Open the website in the default browser"""
        print("\n🌐 Opening website in browser...")
        
        import webbrowser
        
        # Wait a bit more for servers to be fully ready
        time.sleep(2)
        
        try:
            webbrowser.open("http://localhost:5173")
            print("✅ Website opened in browser")
        except Exception as e:
            print(f"⚠️ Could not open browser automatically: {e}")
            print("Please open http://localhost:5173 manually")

    def monitor_processes(self):
        """Monitor running processes"""
        while self.running:
            time.sleep(5)
            
            # Check backend
            if self.backend_process and self.backend_process.poll() is not None:
                print("❌ Backend server stopped unexpectedly")
                self.running = False
                break
            
            # Check frontend
            if self.frontend_process and self.frontend_process.poll() is not None:
                print("❌ Frontend server stopped unexpectedly")
                self.running = False
                break

    def cleanup(self):
        """Clean up processes on exit"""
        print("\n🛑 Shutting down servers...")
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
        
        if self.frontend_process:
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
        
        print("✅ Servers shut down")

    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print("\n🛑 Received shutdown signal...")
        self.running = False
        self.cleanup()
        sys.exit(0)

    def start_database_service(self):
        """Start database service using docker-compose if needed"""
        print("\n🗄️ Starting database service...")
        
        # Check if we're in a Docker environment or need to start services
        try:
            # Check if docker-compose is available
            subprocess.run(["docker-compose", "--version"], check=True, capture_output=True)
            
            # Check if database service is running
            result = subprocess.run(["docker-compose", "ps", "database"], 
                                  capture_output=True, text=True)
            
            if "Up" not in result.stdout:
                print("🚀 Starting database service with docker-compose...")
                subprocess.run(["docker-compose", "up", "-d", "database"], check=True)
                time.sleep(3)  # Wait for service to start
                print("✅ Database service started")
            else:
                print("✅ Database service already running")
            
            return True
            
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️ Docker-compose not available, using local SQLite")
            return True

    def run(self):
        """Main run method"""
        self.print_banner()
        
        # Check prerequisites
        if not self.check_prerequisites():
            print("❌ Prerequisites not met. Please fix the issues above.")
            return False
        
        # Set up signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        try:
            # Set up backend
            if not self.setup_backend():
                print("❌ Backend setup failed")
                return False
            
            # Start database service (if using Docker)
            if not self.start_database_service():
                print("❌ Database service startup failed")
                return False
            
            # Initialize database
            if not self.initialize_database():
                print("❌ Database initialization failed")
                return False
            
            # Set up frontend
            if not self.setup_frontend():
                print("❌ Frontend setup failed")
                return False
            
            # Start backend
            if not self.start_backend():
                print("❌ Backend startup failed")
                return False
            
            # Start frontend
            if not self.start_frontend():
                print("❌ Frontend startup failed")
                self.cleanup()
                return False
            
            # Open browser
            self.open_browser()
            
            # Set running flag
            self.running = True
            
            print("\n" + "=" * 70)
            print("🎉 PlantTech Website is now running!")
            print("=" * 70)
            print("📍 Frontend: http://localhost:5173")
            print("📍 Backend API: http://localhost:5001")
            print("📍 Health Check: http://localhost:5001/health")
            print("\n📝 Default Users:")
            print("   Admin: admin@plantech.com / Admin123!")
            print("   Demo: demo@plantech.com / Demo123!")
            print("\n🛑 Press Ctrl+C to stop the servers")
            print("=" * 70)
            
            # Monitor processes
            self.monitor_processes()
            
        except KeyboardInterrupt:
            print("\n🛑 Shutdown requested by user...")
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
        finally:
            self.cleanup()
        
        return True

def main():
    """Main function"""
    website = PlantTechWebsite()
    success = website.run()
    
    if success:
        print("✅ PlantTech Website shutdown completed")
    else:
        print("❌ PlantTech Website startup failed")
        sys.exit(1)

if __name__ == "__main__":
    main() 