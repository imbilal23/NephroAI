import os
import joblib
import pandas as pd
import numpy as np
import warnings
from sklearn.exceptions import InconsistentVersionWarning
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, static_folder='Web', template_folder='Web', static_url_path='')
CORS(app)

# 1. Configuration & Features
REQUIRED_FEATURES = ["sg", "hemo", "sc", "al", "htn", "dm", "age", "bp", "su", "bgr", "bu", "sod", "pot", "pcv", "rbcc"]
OPTIONAL_FEATURES = ["appet", "wbcc", "rbc", "pc", "pcc", "ba", "cad", "pe", "ane"]

# The exact 24-feature order used during training
FEATURE_ORDER = [
    'age', 'bp', 'sg', 'al', 'su', 'rbc', 'pc', 'pcc', 'ba', 'bgr', 
    'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wbcc', 'rbcc', 'htn', 'dm', 
    'cad', 'appet', 'pe', 'ane'
]

# 2. Load Models Safely
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'Models')

# Initialize to None so we can detect load failures gracefully
imputer_scaler = None
imputer = None
model = None

try:
    loaded_imputer = joblib.load(os.path.join(MODELS_DIR, 'imputer_scaler.pkl'))
    imputer_scaler = loaded_imputer['imputer_scaler'] if isinstance(loaded_imputer, dict) else loaded_imputer
    imputer = loaded_imputer['knn_imputer'] if isinstance(loaded_imputer, dict) else loaded_imputer
    
    loaded_model = joblib.load(os.path.join(MODELS_DIR, 'Voting.pkl'))
    model = loaded_model['model'] if isinstance(loaded_model, dict) else loaded_model
    
    print("SUCCESS: All models loaded successfully.")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"ERROR: Error loading models: {e}")


# 3. Helper Functions
def get_assessment(prediction, probability, data):
    """Generate dynamic risk assessment identifying specific clinical risk factors."""
    confidence_pct = float(probability * 100)
    
    # 1. Identify specific abnormal risk factors
    findings = []
    
    # Check numerical markers (handling potential N/A or empty strings)
    try:
        sc = float(data.get('sc', 0))
        if sc > 1.2: findings.append(f"Elevated Creatinine ({sc} mg/dL)")
        
        hemo = float(data.get('hemo', 15))
        if hemo < 12.0: findings.append(f"Low Haemoglobin ({hemo} g/dL)")
        
        bp = float(data.get('bp', 0))
        if bp > 90: findings.append(f"Elevated Blood Pressure ({bp} mmHg)")
        
        al = float(data.get('al', 0))
        if al > 0: findings.append(f"Proteinuria (Albumin level {int(al)})")
        
        sg = float(data.get('sg', 1.020))
        if sg < 1.015: findings.append(f"Low Urine Specific Gravity ({sg})")
    except (ValueError, TypeError):
        pass

    # Check categorical markers
    if data.get('htn') == '1' or data.get('htn') == 1: findings.append("Hypertension")
    if data.get('dm') == '1' or data.get('dm') == 1: findings.append("Diabetes Mellitus")
    if data.get('pe') == '1' or data.get('pe') == 1: findings.append("Pedal Oedema")

    # 2. Build the assessment text
    risk_factors_str = "; ".join(findings) if findings else "No specific acute markers identified"
    
    if prediction == 1:
        risk_level = "High Risk" if confidence_pct > 80 else "Moderate Risk"
        
        if risk_level == "High Risk":
            assessment = f"Analysis identified significant risk indicators: {risk_factors_str}. This profile is highly consistent with Chronic Kidney Disease. Immediate clinical intervention is prioritized."
            actions = [
                "Urgent Nephrology referral within 48 hours.",
                "Verify findings with repeat renal function panel and electrolytes.",
                "Evaluate for secondary complications (e.g., Anaemia of CKD).",
                "Strict blood pressure and glycaemic management.",
                "Refer to renal dietitian for protein/sodium restriction."
            ]
        else:
            assessment = f"Analysis noted several concerning findings: {risk_factors_str}. While early stage, these markers suggest declining renal reserve. Close proactive monitoring is advised."
            actions = [
                "Schedule clinical review within 2–4 weeks.",
                "Monitor eGFR and Urine Albumin/Creatinine Ratio (uACR) quarterly.",
                "Patient education on avoiding nephrotoxins (NSAIDs, etc.).",
                "Lifestyle optimization: smoking cessation and dietary adjustments."
            ]
    else:
        risk_level = "Low Risk"
        assessment = f"Clinical parameters are largely stable. Observed markers: {risk_factors_str}. No immediate indications of advanced renal dysfunction identified."
        actions = [
            "Continue routine annual screening and preventive care.",
            "Maintain target blood pressure and glucose levels.",
            "Encourage adequate hydration and heart-healthy diet.",
            "Repeat urinalysis and serum creatinine in 12 months."
        ]
        
    return {
        "riskLevel": risk_level,
        "confidenceScore": round(confidence_pct, 1),
        "primaryAssessment": assessment,
        "recommendedActions": actions
    }


# 4. API Routes
@app.route('/')
def index():
    return render_template('index_kidney.html')

@app.route('/api/kidney-analyze', methods=['POST'])
def analyze():
    try:
        # ensure models loaded successfully at startup
        if model is None or imputer is None or imputer_scaler is None:
            return jsonify({'error': 'ML models failed to load. Check server logs for scikit-learn version compatibility.'}), 503

        data = request.json
        
        # A. Validate Required Features
        for req in REQUIRED_FEATURES:
            if req not in data or data[req] == '' or data[req] is None:
                return jsonify({'error': f'Missing required feature: {req}'}), 400
                
        # B. Parse and structure the data
        patient_data = {}
        for col in FEATURE_ORDER:
            val = data.get(col)
            if val is None or str(val).strip() == '':
                patient_data[col] = np.nan
            else:
                try:
                    patient_data[col] = float(val)
                except ValueError:
                    patient_data[col] = np.nan
                    
        # C. Create DataFrame ensuring column order
        df = pd.DataFrame([patient_data], columns=FEATURE_ORDER)
        
        # D. Preprocessing Pipeline
        # Step 1: Scale & Impute (24 columns)
        df_scaled = pd.DataFrame(imputer_scaler.transform(df), columns=FEATURE_ORDER)
        df_imputed = pd.DataFrame(imputer.transform(df_scaled), columns=FEATURE_ORDER)
        
        # Step 2: Inverse scale with the 24-column imputer_scaler to get raw values back
        df_raw = pd.DataFrame(imputer_scaler.inverse_transform(df_imputed), columns=FEATURE_ORDER)
        
        # Step 3: Final formatting (clip binaries, round numbers)
        INT_COLS   = ['age','bp','al','su','bgr','pcv','wbcc','sod']
        FLOAT_COLS = ['sg','bu','sc','pot','hemo','rbcc']
        cat_cols = ['rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 'cad', 'appet', 'pe', 'ane']
        for col in cat_cols:
            df_raw[col] = df_raw[col].clip(0, 1).round().astype(int)
        for col in INT_COLS:
            df_raw[col] = df_raw[col].round().astype(int)
        for col in FLOAT_COLS:
            df_raw[col] = df_raw[col].round(3)    
        
        # Step 4: Ensure all 24 columns are in correct order for the model
        df_model_input = df_raw[FEATURE_ORDER]
        
        # E. Model Prediction
        prediction = int(model.predict(df_model_input)[0])
        
        # Get probabilities
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(df_model_input)[0]
            probability = probabilities[1] if prediction == 1 else probabilities[0]
        else:
            probability = 0.95 # Fallback if soft voting isn't enabled
            
        # F. Format Response
        response = get_assessment(prediction, probability, patient_data)
        return jsonify(response)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error during prediction: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
