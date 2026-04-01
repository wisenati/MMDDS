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