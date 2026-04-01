from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configuration
MODEL_PATH = '../models/mango_disease_model.h5'
CLASS_INDICES_PATH = '../models/class_indices.json'
IMAGE_SIZE = (224, 224)

# Global variables
model = None
class_indices = None
class_names = None

# Severity mapping
SEVERITY_MAP = {
    'Anthracnose': 'high',
    'Bacterial Canker': 'critical',
    'Cutting Weevil': 'medium',
    'Die Back': 'critical',
    'Gall Midge': 'high',
    'Healthy': 'healthy',
    'Powdery Mildew': 'medium',
    'Sooty Mould': 'low'
}


def load_model():
    """Load the trained model and class indices."""
    global model, class_indices, class_names
    
    print("🔄 Loading model...")
    
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Please train the model first.")
    
    model = keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully!")
    
    # Load class indices
    with open(CLASS_INDICES_PATH, 'r') as f:
        class_indices = json.load(f)
    
    # Invert the dictionary
    class_names = {v: k for k, v in class_indices.items()}
    print(f"📋 Classes: {list(class_indices.keys())}")


def preprocess_image(image_bytes):
    """Preprocess image for prediction."""
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert('RGB')
    image = image.resize(IMAGE_SIZE)
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/predict', methods=['POST'])
def predict():
    """Predict disease from uploaded image."""
    
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    try:
        # Get image file
        image_file = request.files['image']
        image_bytes = image_file.read()
        
        # Preprocess image
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx])
        
        # Get class name
        disease_name = class_names[predicted_class_idx]
        severity = SEVERITY_MAP.get(disease_name, 'medium')
        
        # Build response
        response = {
            'success': True,
            'disease': disease_name,
            'confidence': confidence,
            'severity': severity,
            'all_predictions': {
                class_names[i]: float(predictions[0][i])
                for i in range(len(predictions[0]))
            },
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"🔍 Prediction: {disease_name} ({confidence:.2%})")
        return jsonify(response)
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/classes', methods=['GET'])
def get_classes():
    """Get list of disease classes."""
    return jsonify({
        'classes': list(class_indices.keys()) if class_indices else [],
        'count': len(class_indices) if class_indices else 0
    })


if __name__ == '__main__':
    # Load model on startup
    try:
        load_model()
    except FileNotFoundError as e:
        print(f"⚠️ Warning: {e}")
        print("The server will start but predictions won't work until the model is trained.")
    
    print("\n" + "=" * 50)
    print("🚀 MangoCare API Server Starting...")
    print("=" * 50)
    print("📡 API Endpoints:")
    print("   GET  /health  - Health check")
    print("   POST /predict - Upload image for prediction")
    print("   GET  /classes - Get disease classes")
    print("=" * 50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)