import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import matplotlib.pyplot as plt

# Load the trained model
model = load_model("ResNet_Model.keras")

# Define class labels based on training directory structure
labels_map = {0: "Acne", 1: "Melanoma", 2: "Normal", 3: "Perioral_Dermatitis", 4: "Rosacea", 5: "Warts"}

# Function to preprocess the image
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))  # Resize to match model input
    img_array = image.img_to_array(img)  # Convert to array
    img_array = img_array / 255.0  # Normalize
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

# Path to test image
test_image_path = "./wartss.jpg"  # Replace with your image path

# Preprocess and predict
input_image = preprocess_image(test_image_path)
prediction = model.predict(input_image)

# Get predicted class index
predicted_class = np.argmax(prediction)
predicted_label = labels_map.get(predicted_class, "Unknown")

# Display image and prediction
plt.imshow(image.load_img(test_image_path))
plt.axis("off")
plt.title(f"Predicted Class: {predicted_label}")
plt.show()

