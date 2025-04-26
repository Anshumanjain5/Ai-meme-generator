from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # ← This allows your frontend to talk to backend

@app.route('/save-json', methods=['POST'])
def save_json():
    data = request.json
    with open('data.json', 'w') as f:
        json.dump(data, f, indent=2)
    return jsonify({"message": "Data saved successfully!"}), 200

if __name__ == '__main__':
    app.run(debug=True)
