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
