from flask import Flask, request, jsonify, send_from_directory
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from flask_cors import CORS
import cv2
import cvlib as cv


app = Flask(__name__)
CORS(app)

model = load_model("ResNet_Model.keras")

labels_map = {
    0: "Acne",
    1: "Melanoma",
    2: "Normal",
    3: "Perioral_Dermatitis",
    4: "Rosacea",
    5: "Warts",
}

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

def is_blurry(image_path, threshold=100.0):
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    return fm < threshold

def contains_face(image_path):
    image = cv2.imread(image_path)
    faces, confidences = cv.detect_face(image)
    return len(faces) > 0

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    img_file = request.files["image"]
    upload_folder = os.path.abspath("uploads")
    os.makedirs(upload_folder, exist_ok=True)
    img_path = os.path.join(upload_folder, img_file.filename)

    try:
        # Save image temporarily
        img_file.save(img_path)
        print(f"Image saved successfully at {img_path}")

        # === Image Validation ===
        if is_blurry(img_path):
            os.remove(img_path)
            return jsonify({"error": "Image is too blurry"}), 400

        if not contains_face(img_path):
            os.remove(img_path)
            return jsonify({"error": "No face detected in the image"}), 400

        # Preprocess and predict
        input_image = preprocess_image(img_path)
        prediction = model.predict(input_image)[0]
        predicted_class = np.argmax(prediction)
        predicted_label = labels_map.get(predicted_class, "Unknown")
        confidence_score = round(float(np.max(prediction)), 3)

        # Clean up image after prediction
        os.remove(img_path)

        return jsonify({
            "predicted_label": predicted_label,
            "confidence_score": confidence_score,
            "image_filename": img_file.filename  # Node will build full URL
        })

    except Exception as e:
        # Attempt cleanup in case of error
        if os.path.exists(img_path):
            os.remove(img_path)
        print("Prediction Error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
