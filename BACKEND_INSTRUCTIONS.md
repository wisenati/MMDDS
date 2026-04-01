# 🥭 Mango Disease Detection System - Complete Implementation Guide

This document provides complete instructions for setting up the Python ML backend for your mango disease detection system.

## 📁 Complete Project Structure

```
MANGO DISEASE DETECTION/
├── dataset/
│   └── images/
│       ├── Anthracnose/
│       ├── Bacterial Canker/
│       ├── Cutting Weevil/
│       ├── Die Back/
│       ├── Gall Midge/
│       ├── Healthy/
│       ├── Powdery Mildew/
│       └── Sooty Mould/
├── mango_dataset.csv
├── models/                          # Created after training
│   └── mango_disease_model.h5
├── backend/
│   ├── app.py                       # Flask API server
│   ├── train_model.py               # Model training script
│   ├── requirements.txt             # Python dependencies
│   └── utils.py                     # Helper functions
└── frontend/                        # (This Lovable project)
```

---

## 🛠️ Step 1: Setup Python Environment

Open Command Prompt/Terminal in your `MANGO DISEASE DETECTION` folder:

```bash
# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Create backend folder
mkdir backend
cd backend
```

---

## 📦 Step 2: Create requirements.txt

Create `backend/requirements.txt`:

```txt
tensorflow==2.15.0
keras==3.0.0
numpy==1.26.2
pandas==2.1.3
pillow==10.1.0
scikit-learn==1.3.2
matplotlib==3.8.2
flask==3.0.0
flask-cors==4.0.0
opencv-python==4.8.1.78
seaborn==0.13.0
tqdm==4.66.1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 🧠 Step 3: Create Training Script

Create `backend/train_model.py`:

```python
"""
Mango Disease Detection - CNN Model Training Script
Author: MangoCare AI
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from keras import layers, models, callbacks
from keras.preprocessing.image import ImageDataGenerator
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import json
from datetime import datetime

# Configuration
CONFIG = {
    'image_size': (224, 224),
    'batch_size': 32,
    'epochs': 50,
    'learning_rate': 0.0001,
    'validation_split': 0.2,
    'test_split': 0.1,
    'random_state': 42
}

# Disease classes
CLASSES = [
    'Anthracnose',
    'Bacterial Canker',
    'Cutting Weevil',
    'Die Back',
    'Gall Midge',
    'Healthy',
    'Powdery Mildew',
    'Sooty Mould'
]


def create_data_generators(data_dir):
    """Create training and validation data generators with augmentation."""
    
    # Training data augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=True,
        fill_mode='nearest',
        validation_split=CONFIG['validation_split']
    )
    
    # Validation data - only rescaling
    valid_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=CONFIG['validation_split']
    )
    
    # Training generator
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=CONFIG['image_size'],
        batch_size=CONFIG['batch_size'],
        class_mode='categorical',
        subset='training',
        shuffle=True,
        seed=CONFIG['random_state']
    )
    
    # Validation generator
    valid_generator = valid_datagen.flow_from_directory(
        data_dir,
        target_size=CONFIG['image_size'],
        batch_size=CONFIG['batch_size'],
        class_mode='categorical',
        subset='validation',
        shuffle=False,
        seed=CONFIG['random_state']
    )
    
    return train_generator, valid_generator


def build_model(num_classes):
    """Build CNN model using transfer learning with MobileNetV2."""
    
    # Base model - MobileNetV2 pretrained on ImageNet
    base_model = keras.applications.MobileNetV2(
        input_shape=(*CONFIG['image_size'], 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model layers
    base_model.trainable = False
    
    # Build model
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=CONFIG['learning_rate']),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model


def fine_tune_model(model, base_model_layers=100):
    """Fine-tune the model by unfreezing some base model layers."""
    
    base_model = model.layers[0]
    base_model.trainable = True
    
    # Freeze all layers except the last `base_model_layers`
    for layer in base_model.layers[:-base_model_layers]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=CONFIG['learning_rate'] / 10),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model


def train_model(data_dir, output_dir='../models'):
    """Main training function."""
    
    print("=" * 60)
    print("🥭 MANGO DISEASE DETECTION - MODEL TRAINING")
    print("=" * 60)
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Create data generators
    print("\n📊 Loading dataset...")
    train_gen, valid_gen = create_data_generators(data_dir)
    
    print(f"Training samples: {train_gen.samples}")
    print(f"Validation samples: {valid_gen.samples}")
    print(f"Classes: {list(train_gen.class_indices.keys())}")
    
    # Save class indices
    class_indices = train_gen.class_indices
    with open(os.path.join(output_dir, 'class_indices.json'), 'w') as f:
        json.dump(class_indices, f, indent=2)
    
    # Build model
    print("\n🏗️ Building model...")
    num_classes = len(class_indices)
    model = build_model(num_classes)
    model.summary()
    
    # Callbacks
    model_checkpoint = callbacks.ModelCheckpoint(
        os.path.join(output_dir, 'mango_disease_model_best.h5'),
        monitor='val_accuracy',
        mode='max',
        save_best_only=True,
        verbose=1
    )
    
    early_stopping = callbacks.EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True,
        verbose=1
    )
    
    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.2,
        patience=5,
        min_lr=1e-7,
        verbose=1
    )
    
    # Phase 1: Train with frozen base
    print("\n🚀 Phase 1: Training with frozen base model...")
    history1 = model.fit(
        train_gen,
        validation_data=valid_gen,
        epochs=CONFIG['epochs'] // 2,
        callbacks=[model_checkpoint, early_stopping, reduce_lr],
        verbose=1
    )
    
    # Phase 2: Fine-tuning
    print("\n🔧 Phase 2: Fine-tuning model...")
    model = fine_tune_model(model)
    
    history2 = model.fit(
        train_gen,
        validation_data=valid_gen,
        epochs=CONFIG['epochs'] // 2,
        callbacks=[model_checkpoint, early_stopping, reduce_lr],
        verbose=1
    )
    
    # Save final model
    model.save(os.path.join(output_dir, 'mango_disease_model.h5'))
    print(f"\n✅ Model saved to {output_dir}/mango_disease_model.h5")
    
    # Evaluate model
    print("\n📈 Evaluating model...")
    evaluate_model(model, valid_gen, output_dir)
    
    # Plot training history
    plot_training_history(history1, history2, output_dir)
    
    return model


def evaluate_model(model, valid_gen, output_dir):
    """Evaluate model and generate reports."""
    
    # Predictions
    valid_gen.reset()
    predictions = model.predict(valid_gen, verbose=1)
    y_pred = np.argmax(predictions, axis=1)
    y_true = valid_gen.classes
    
    # Classification report
    class_names = list(valid_gen.class_indices.keys())
    report = classification_report(y_true, y_pred, target_names=class_names)
    print("\n📊 Classification Report:")
    print(report)
    
    # Save report
    with open(os.path.join(output_dir, 'classification_report.txt'), 'w') as f:
        f.write(report)
    
    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Reds',
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix - Mango Disease Detection')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'confusion_matrix.png'), dpi=150)
    plt.close()
    print(f"📊 Confusion matrix saved to {output_dir}/confusion_matrix.png")


def plot_training_history(history1, history2, output_dir):
    """Plot and save training history."""
    
    # Combine histories
    acc = history1.history['accuracy'] + history2.history['accuracy']
    val_acc = history1.history['val_accuracy'] + history2.history['val_accuracy']
    loss = history1.history['loss'] + history2.history['loss']
    val_loss = history1.history['val_loss'] + history2.history['val_loss']
    
    epochs = range(1, len(acc) + 1)
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    # Accuracy plot
    ax1.plot(epochs, acc, 'r-', label='Training Accuracy', linewidth=2)
    ax1.plot(epochs, val_acc, 'b-', label='Validation Accuracy', linewidth=2)
    ax1.axvline(x=len(history1.history['accuracy']), color='gray', 
                linestyle='--', label='Fine-tuning Start')
    ax1.set_title('Model Accuracy', fontsize=14, fontweight='bold')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True, alpha=0.3)
    
    # Loss plot
    ax2.plot(epochs, loss, 'r-', label='Training Loss', linewidth=2)
    ax2.plot(epochs, val_loss, 'b-', label='Validation Loss', linewidth=2)
    ax2.axvline(x=len(history1.history['loss']), color='gray',
                linestyle='--', label='Fine-tuning Start')
    ax2.set_title('Model Loss', fontsize=14, fontweight='bold')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'training_history.png'), dpi=150)
    plt.close()
    print(f"📈 Training history saved to {output_dir}/training_history.png")


if __name__ == '__main__':
    # Path to your dataset
    DATA_DIR = '../dataset/images'
    
    # Check if dataset exists
    if not os.path.exists(DATA_DIR):
        print(f"❌ Error: Dataset not found at {DATA_DIR}")
        print("Please ensure your images are in the correct folder structure.")
        exit(1)
    
    # Train the model
    model = train_model(DATA_DIR)
    print("\n" + "=" * 60)
    print("🎉 TRAINING COMPLETE!")
    print("=" * 60)
```

---

## 🌐 Step 4: Create Flask API Server

Create `backend/app.py`:

```python
"""
Mango Disease Detection - Flask API Server
Author: MangoCare AI
"""

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
```

---

## 🔧 Step 5: Create Utility Functions

Create `backend/utils.py`:

```python
"""
Utility functions for Mango Disease Detection
"""

import os
import cv2
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt


def visualize_predictions(image_path, predictions, class_names, top_k=5):
    """Visualize prediction results."""
    
    # Load image
    image = Image.open(image_path)
    
    # Get top-k predictions
    top_indices = np.argsort(predictions[0])[-top_k:][::-1]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    # Show image
    ax1.imshow(image)
    ax1.set_title('Input Image')
    ax1.axis('off')
    
    # Show predictions bar chart
    classes = [class_names[i] for i in top_indices]
    probs = [predictions[0][i] for i in top_indices]
    colors = ['#dc2626' if i == top_indices[0] else '#94a3b8' for i in top_indices]
    
    ax2.barh(classes, probs, color=colors)
    ax2.set_xlabel('Confidence')
    ax2.set_title('Disease Predictions')
    ax2.set_xlim(0, 1)
    
    for i, (cls, prob) in enumerate(zip(classes, probs)):
        ax2.text(prob + 0.02, i, f'{prob:.1%}', va='center')
    
    plt.tight_layout()
    plt.show()


def check_dataset_structure(data_dir):
    """Check and report dataset structure."""
    
    print("=" * 50)
    print("📁 DATASET STRUCTURE CHECK")
    print("=" * 50)
    
    if not os.path.exists(data_dir):
        print(f"❌ Directory not found: {data_dir}")
        return False
    
    total_images = 0
    class_counts = {}
    
    for class_name in os.listdir(data_dir):
        class_path = os.path.join(data_dir, class_name)
        if os.path.isdir(class_path):
            count = len([f for f in os.listdir(class_path) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
            class_counts[class_name] = count
            total_images += count
    
    print(f"\n📊 Dataset Summary:")
    print(f"   Total Classes: {len(class_counts)}")
    print(f"   Total Images: {total_images}")
    print(f"\n📋 Images per class:")
    
    for class_name, count in sorted(class_counts.items()):
        bar = "█" * (count // 10)
        print(f"   {class_name:20s}: {count:4d} {bar}")
    
    # Check for balance
    counts = list(class_counts.values())
    if max(counts) > min(counts) * 3:
        print("\n⚠️  Warning: Dataset appears imbalanced!")
        print("   Consider data augmentation for minority classes.")
    else:
        print("\n✅ Dataset appears reasonably balanced.")
    
    return True


if __name__ == '__main__':
    # Test dataset structure
    check_dataset_structure('../dataset/images')
```

---

## 🚀 Step 6: Running the System

### Train the Model

```bash
cd backend
python train_model.py
```

**Expected output:**
- Training progress with accuracy metrics
- Model saved to `models/mango_disease_model.h5`
- Confusion matrix and training history plots

### Start the API Server

```bash
cd backend
python app.py
```

**The server will run at: `http://localhost:5000`**

### Connect Frontend to Backend

Update `src/lib/diseaseApi.ts` in the Lovable project:

```typescript
// Change this line in analyzeImage function:
const diagnosisResult = await analyzeImageWithAPI(selectedImage);
```

---

## 📊 API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/predict` | POST | Predict disease from image |
| `/classes` | GET | List available disease classes |

### Example API Call

```bash
curl -X POST -F "image=@mango_leaf.jpg" http://localhost:5000/predict
```

### Response Format

```json
{
  "success": true,
  "disease": "Anthracnose",
  "confidence": 0.9234,
  "severity": "high",
  "all_predictions": {
    "Anthracnose": 0.9234,
    "Bacterial Canker": 0.0321,
    "Healthy": 0.0156,
    ...
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 🎯 Tips for Best Results

1. **Image Quality**: Use clear, well-lit photos of mango leaves
2. **Focus**: Ensure the diseased area is visible and in focus
3. **Background**: Plain backgrounds work best
4. **Training Data**: More images = better accuracy
5. **Augmentation**: The training script includes data augmentation

---

## 🆘 Troubleshooting

### Common Issues

1. **"Module not found"**: Ensure virtual environment is activated
2. **"CUDA error"**: Install CPU version of TensorFlow if no GPU
3. **"Memory error"**: Reduce batch size in CONFIG
4. **"Model not found"**: Run `train_model.py` first

### GPU Support (Optional)

```bash
pip install tensorflow[and-cuda]
```

---

## 📈 Improving Accuracy

1. Add more training images per class (500+ recommended)
2. Increase epochs in CONFIG
3. Try different base models (ResNet50, EfficientNet)
4. Fine-tune hyperparameters
5. Use class weights for imbalanced data
