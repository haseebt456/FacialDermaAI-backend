from flask import Flask, request, jsonify, send_from_directory
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from flask_cors import CORS


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

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    img_file = request.files["image"]
    upload_folder = os.path.abspath("uploads")
    os.makedirs("uploads", exist_ok=True) 
    img_path = os.path.join(upload_folder, img_file.filename)
    
    try:
        img_file.save(img_path)
        print(f"Image saved successfully at {img_path}")
    except Exception as e:
        print(f"Error saving image: {e}")
        return jsonify({"error": "Failed to save image"}), 500

    try:
        input_image = preprocess_image(img_path)
        prediction = model.predict(input_image)[0]
        predicted_class = np.argmax(prediction)
        predicted_label = labels_map.get(predicted_class, "Unknown")
        confidence_score = round(float(np.max(prediction)), 3)

        # os.remove(img_path)

        return jsonify(
            {
                "predicted_label": predicted_label,
                "confidence_score": confidence_score,
                "image_url": f"/uploads/{img_file.filename}",
            }
        )

    except Exception as e:
        print("Prediction Error:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

