# 🩺 NephroAI — Chronic Kidney Disease Prediction System

NephroAI is a Machine Learning-powered web application designed to predict **Chronic Kidney Disease (CKD)** using routine clinical laboratory data. The system uses an ensemble of advanced machine learning models combined through a **Voting Classifier** to provide highly accurate and reliable predictions.

🌐 Live Application: [https://nephro-ai-taupe.vercel.app](https://nephroai-production-8313.up.railway.app/)

---

# 📌 Project Overview

Chronic Kidney Disease (CKD) is a progressive and often silent disease affecting millions worldwide. Early diagnosis is critical for slowing disease progression and improving patient outcomes.

NephroAI helps clinicians and users by:

- Predicting CKD from standard laboratory results
- Providing fast and consistent predictions
- Using ensemble machine learning techniques for high accuracy
- Offering a deployed web interface for real-time usage

---

# 🚀 Features

- ✅ CKD Prediction using 24 clinical features
- ✅ Ensemble Learning (Random Forest, Gradient Boosting, AdaBoost, XGBoost)
- ✅ Voting Classifier with Soft Voting
- ✅ KNN-based Missing Value Imputation
- ✅ Real-time Prediction through Web Application
- ✅ High Accuracy & Recall
- ✅ Clinically Explainable Feature Analysis
- ✅ Fully Reproducible ML Pipeline

---

# 🧠 Machine Learning Pipeline

## 1. Data Collection

Dataset Source:
- UCI Machine Learning Repository — Chronic Kidney Disease Dataset (ID: 336)
- https://archive.ics.uci.edu/ml/datasets/chronic_kidney_disease

Dataset Statistics:
- Total Patients: 400
- Input Features: 24
- Target Classes:
  - CKD → 1
  - Not CKD → 0

---

## 2. Exploratory Data Analysis (EDA)

EDA was performed to:
- Identify missing values
- Detect dirty labels and formatting issues
- Analyze feature distributions
- Study class imbalance
- Understand feature relationships

---

## 3. Preprocessing Pipeline

### ✔ Label Cleaning
Removed hidden spaces/tabs from categorical values.

### ✔ Categorical Encoding
Mapped categorical values to binary integers.

Examples:
- yes/no → 1/0
- normal/abnormal → 1/0

### ✔ Scaling Before Imputation
Used `StandardScaler` before KNN imputation because KNN relies on Euclidean distance.

### ✔ KNN Imputation
Used:
```python
KNNImputer(n_neighbors=5, weights="distance")
```

### ✔ Clipping Invalid Values
Corrected physiologically impossible imputed values.

### ✔ Data Type Correction
Converted features into appropriate integer/float types.

---

# 🤖 Models Used

The following ensemble models were trained and evaluated:

| Model | Type |
|---|---|
| Random Forest | Bagging |
| Gradient Boosting | Boosting |
| AdaBoost | Boosting |
| XGBoost | Boosting |
| Voting Classifier | Ensemble of Ensembles |

---

# 🗳 Voting Classifier

The final prediction system uses **Soft Voting**.

Each model predicts class probabilities, and the final prediction is obtained by averaging probabilities from all models.

Why Soft Voting?
- Produces more calibrated predictions
- Reduces risk of individual model bias
- More reliable for medical decision support systems

---

# 📊 Evaluation Results

## 5-Fold Stratified Cross Validation

| Metric | Performance |
|---|---|
| Accuracy | >99% |
| Precision | >99% |
| Recall | >99% |
| F1 Score | >99% |
| ROC-AUC | ~100% |

The system achieved extremely strong and stable performance across all folds.

---

# 🔬 Important Clinical Features

Top contributing features across models:

- Specific Gravity (`sg`)
- Haemoglobin (`hemo`)
- Albumin (`al`)
- Packed Cell Volume (`pcv`)
- Serum Creatinine (`sc`)
- Diabetes Mellitus (`dm`)

These align strongly with established nephrology knowledge.

---

# 🛠️ Technologies Used

## Machine Learning
- Python
- scikit-learn
- XGBoost

## Data Processing
- pandas
- NumPy

## Visualization
- Matplotlib
- Seaborn

## Deployment
- Railway
- JavaScript Frontend

## Model Serialization
- joblib

---

# 📂 Project Structure

```bash
NephroAI/
│
├── Collect_Data.ipynb
├── EDA.ipynb
├── Preprocessing.ipynb
├── Model_Development_Evaluation.ipynb
│
├── models/
│   ├── Voting.pkl
│   ├── imputer_scaler.pkl
│
├── frontend/
├── backend/
├── README.md
└── requirements.txt
```


# 📈 Reproducibility

All experiments use:

```python
random_state = 42
```

for:
- Train/Test Split
- StratifiedKFold
- Random Forest
- Gradient Boosting
- AdaBoost
- XGBoost
- GridSearchCV

---

# 🌐 Deployment

Live Application:
https://nephroai-production-8313.up.railway.app

Deployment Platform:
- Railway

---

# ⚠️ Limitations

- Dataset contains only 400 patients
- No external validation yet
- Moderate class imbalance
- Binary classification only

---
