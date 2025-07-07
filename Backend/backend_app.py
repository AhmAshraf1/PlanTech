from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
from PIL import Image
from datetime import datetime
import sqlite3
import traceback

from utils import load_model, predict

app = Flask(__name__)

# Simplified CORS setup
CORS(app, origins=['http://localhost:5173'])

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MODEL_PATH = 'plant_model_5Classes.tflite'
DATABASE = 'predictions.db'

# Load model once at startup
try:
    interpreter = load_model(model_path=MODEL_PATH)
    class_names = ['Healthy', 'Powdery', 'Rust', 'Slug', 'Spot']
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    interpreter = None
    class_names = []


# Initialize database
def init_db():
    try:
        print(f"Initializing database: {DATABASE}")
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS predictions
                     (
                         id
                         TEXT
                         PRIMARY
                         KEY,
                         filename
                         TEXT,
                         predicted_class_name
                         TEXT,
                         probability
                         REAL,
                         timestamp
                         TEXT
                     )''')
        conn.commit()

        # Test the table
        c.execute("SELECT COUNT(*) FROM predictions")
        count = c.fetchone()[0]
        print(f"Database initialized successfully. Current record count: {count}")

        conn.close()
    except Exception as e:
        print(f"Database initialization error: {e}")
        traceback.print_exc()


init_db()


@app.route('/predict', methods=['POST'])
def predict_route():
    print(f"Received request: {request.method}")

    if not interpreter:
        return jsonify({'error': 'Model not loaded'}), 500

    if 'image' not in request.files:
        print("No image in request files")
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    print(f"File received: {file.filename}")

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        saved_filename = f"{unique_id}_{filename}"
        save_path = os.path.join(UPLOAD_FOLDER, saved_filename)
        file.save(save_path)

        # Open and validate image
        image = Image.open(save_path)
        if image.mode != 'RGB':
            image = image.convert('RGB')

        predicted_class_name, probability = predict(image, class_names, interpreter)

        # Convert NumPy float32 to Python float for JSON serialization
        probability = float(probability)

        # Save to database
        try:
            conn = sqlite3.connect(DATABASE)
            c = conn.cursor()
            timestamp = datetime.now().isoformat()
            print(
                f"Saving to database: {unique_id}, {saved_filename}, {predicted_class_name}, {probability}, {timestamp}")

            c.execute("INSERT INTO predictions VALUES (?, ?, ?, ?, ?)",
                      (unique_id, saved_filename, predicted_class_name, probability, timestamp))
            conn.commit()
            print(f"Successfully saved prediction to database")

            # Verify the insert worked
            c.execute("SELECT COUNT(*) FROM predictions")
            count = c.fetchone()[0]
            print(f"Total predictions in database: {count}")

            conn.close()
        except Exception as db_error:
            print(f"Database error: {db_error}")
            traceback.print_exc()
            if 'conn' in locals():
                conn.close()
            # Don't fail the request if DB save fails
            pass

        return jsonify({
            'id': unique_id,
            'predicted_class': predicted_class_name,
            'confidence': probability,
            'image_url': f"/uploads/{saved_filename}"
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    try:
        print(f"Serving file: {filename}")
        return send_from_directory(UPLOAD_FOLDER, filename)
    except Exception as e:
        print(f"Error serving file {filename}: {e}")
        return jsonify({'error': 'File not found'}), 404


@app.route('/history', methods=['GET'])
def history():
    print("=" * 50)
    print("HISTORY ENDPOINT CALLED")
    print("=" * 50)

    try:
        print(f"Database path: {os.path.abspath(DATABASE)}")
        print(f"Database exists: {os.path.exists(DATABASE)}")

        if not os.path.exists(DATABASE):
            print("Database file does not exist!")
            return jsonify({'error': 'Database not found'}), 500

        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()

        # Check if table exists
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='predictions'")
        table_exists = c.fetchone()
        print(f"Table 'predictions' exists: {table_exists is not None}")

        if not table_exists:
            print("Predictions table does not exist!")
            conn.close()
            return jsonify({'error': 'Predictions table not found'}), 500

        # Get table structure
        c.execute("PRAGMA table_info(predictions)")
        columns = c.fetchall()
        print(f"Table structure: {columns}")

        # Get record count
        c.execute("SELECT COUNT(*) FROM predictions")
        count = c.fetchone()[0]
        print(f"Total predictions in database: {count}")

        if count == 0:
            print("No predictions found in database")
            conn.close()
            return jsonify([])

        # Fetch records
        c.execute(
            "SELECT id, filename, predicted_class_name, probability, timestamp FROM predictions ORDER BY timestamp DESC LIMIT 50")
        rows = c.fetchall()
        print(f"Fetched {len(rows)} rows from database")

        if rows:
            print(f"Sample row: {rows[0]}")

        conn.close()

        result = []
        for r in rows:
            try:
                item = {
                    'id': r[0],
                    'image_url': f"/uploads/{r[1]}",
                    'class': r[2],
                    'confidence': float(r[3]) if r[3] is not None else 0.0,
                    'timestamp': r[4]
                }
                result.append(item)
                print(f"Processed item: {item}")
            except Exception as item_error:
                print(f"Error processing row {r}: {item_error}")
                continue

        print(f"Returning {len(result)} items to frontend")
        return jsonify(result)

    except sqlite3.Error as db_error:
        print(f"SQLite error in history: {db_error}")
        traceback.print_exc()
        return jsonify({'error': f'Database error: {str(db_error)}'}), 500
    except Exception as e:
        print(f"General error in history: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch history: {str(e)}'}), 500


@app.route('/debug/db', methods=['GET'])
def debug_db():
    try:
        print("Debug DB endpoint called")

        db_path = os.path.abspath(DATABASE)
        db_exists = os.path.exists(DATABASE)

        print(f"Database path: {db_path}")
        print(f"Database exists: {db_exists}")

        if not db_exists:
            return jsonify({
                'database_file': DATABASE,
                'database_path': db_path,
                'database_exists': False,
                'error': 'Database file not found'
            })

        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()

        # Check if table exists
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='predictions'")
        table_exists = c.fetchone() is not None

        # Get table info
        c.execute("PRAGMA table_info(predictions)")
        columns = c.fetchall()

        # Get row count
        c.execute("SELECT COUNT(*) FROM predictions")
        total_count = c.fetchone()[0]

        # Get all data
        c.execute("SELECT * FROM predictions ORDER BY timestamp DESC LIMIT 10")
        rows = c.fetchall()

        conn.close()

        return jsonify({
            'database_file': DATABASE,
            'database_path': db_path,
            'database_exists': db_exists,
            'table_exists': table_exists,
            'columns': columns,
            'total_count': total_count,
            'sample_rows': rows
        })
    except Exception as e:
        print(f"Debug DB error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Backend is working!',
        'cors': 'enabled',
        'model_loaded': interpreter is not None,
        'database_exists': os.path.exists(DATABASE),
        'uploads_folder_exists': os.path.exists(UPLOAD_FOLDER)
    })


if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5001")
    print(f"Database path: {os.path.abspath(DATABASE)}")
    print(f"Uploads folder: {os.path.abspath(UPLOAD_FOLDER)}")
    app.run(debug=True, host='0.0.0.0', port=5001)