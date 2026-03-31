from fastapi import FastAPI
from pydantic import BaseModel
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
import numpy as np
import shap

app = FastAPI(title="DriftSense Inference API")

# Connect to the MLflow Docker Container
mlflow.set_tracking_uri("http://mlflow:5000")
mlflow.set_experiment("DriftSense_Sprint1")

# Global variable to hold our model
model = None

# 1. We create a Pydantic model to define the expected JSON body structure
class SensorData(BaseModel):
    temperature: float
    vibration: float

@app.on_event("startup")
def train_dummy_model():
    """
    On startup, this function trains a basic model to simulate our 'Healthy' vs 'Failure' logic
    and logs the model directly to our MLflow container.
    """
    global model
    print("Training dummy model and logging to MLflow...")
    
    # Generate dummy sensor data: Feature 1 (Temperature), Feature 2 (Vibration)
    np.random.seed(42)
    X = np.random.rand(100, 2) * 100
    # Rule: If Temp + Vibration > 100, the machine fails (Class 1)
    y = (X[:, 0] + X[:, 1] > 100).astype(int) 
    
    # Start MLflow tracking run
    with mlflow.start_run():
        model = RandomForestClassifier(n_estimators=10, random_state=42)
        model.fit(X, y)
        
        # Log the parameters and the trained model to the Docker container
        mlflow.log_param("n_estimators", 10)
        mlflow.sklearn.log_model(model, "random_forest_model")
        
        print("Model successfully trained and logged to MLflow!")

# 2. We update the endpoint to expect the Pydantic model (JSON Body)
@app.post("/predict")
def predict(data: SensorData):
    """
    Takes live sensor data and returns a prediction using the trained model.
    """
    if model is None:
        return {"error": "Model not trained yet"}
    
    # 3. Access the data using dot notation (data.temperature)
    instance = np.array([[data.temperature, data.vibration]])
    prediction = model.predict(instance)
    status = "Warning/Failure" if prediction[0] == 1 else "Healthy"
    
    # --- Explainable AI (XAI) Engine ---
    # Calculate SHAP values to explain the specific prediction
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(instance)
    
    # Extract the impact on the positive class (Failure = index 1)
    if isinstance(shap_values, list):
        class_1_shap = shap_values[1][0]
    elif len(np.array(shap_values).shape) == 3:
        # If SHAP returns a 3D array: (n_samples, n_features, n_classes)
        class_1_shap = shap_values[0, :, 1]
    else:
        class_1_shap = shap_values[0]

    # Force the values into a flattened 1D array to avoid multi-dimensional indexing issues
    class_1_shap = np.array(class_1_shap).flatten()

    # Calculate percentage contributions based on absolute impact
    abs_shap = np.abs(class_1_shap)
    total_shap = float(np.sum(abs_shap))
    
    if total_shap == 0:
        temp_impact, vib_impact = 50.0, 50.0
    else:
        # Wrap the math in float() so Python's built-in round() works correctly
        temp_impact = round(float((abs_shap[0] / total_shap) * 100), 2)
        vib_impact = round(float((abs_shap[1] / total_shap) * 100), 2)

    return {
        "sensor_temperature": data.temperature,
        "sensor_vibration": data.vibration,
        "prediction_class": int(prediction[0]),
        "system_status": status,
        "explanation": {
            "temperature_impact": temp_impact,
            "vibration_impact": vib_impact
        }
    }

@app.post("/retrain")
def retrain_model():
    """
    Triggered by the Spring Boot orchestrator when concept drift is detected.
    Pulls 'new' data, trains a new model, logs to MLflow, and hot-swaps it into memory.
    """
    global model
    print("🚨 Concept Drift Alert received! Initiating self-healing retraining cycle...")
    
    # 1. Simulate pulling new, "drifted" data from the database.
    # The machine is degrading. The old failure rule was Temp + Vib > 100.
    # The NEW reality is that the machine now fails if Temp + Vib > 80.
    X_new = np.random.rand(200, 2) * 100
    y_new = (X_new[:, 0] + X_new[:, 1] > 80).astype(int) 
    
    # 2. Start a new MLflow tracking run
    with mlflow.start_run():
        # Train a slightly heavier model to handle the new complex data
        new_model = RandomForestClassifier(n_estimators=25, random_state=100)
        new_model.fit(X_new, y_new)
        
        # Log the new parameters and the new model version to Docker
        mlflow.log_param("n_estimators", 25)
        mlflow.log_param("drift_rule", "threshold_80")
        mlflow.sklearn.log_model(new_model, "drift_corrected_model")
        
        # 3. ZERO-DOWNTIME HOT-SWAP
        # We overwrite the global model variable. The very next /predict request 
        # will instantly use this new model without the server ever restarting.
        model = new_model
        
        print("✅ Model successfully retrained, logged, and hot-swapped!")

    return {
        "status": "Success",
        "message": "Self-healing complete. New model deployed.",
        "new_parameters": {"n_estimators": 25, "drift_rule": "threshold_80"}
    }