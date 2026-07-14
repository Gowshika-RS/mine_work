import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

def generate_synthetic_data(num_samples=2000):
    np.random.seed(42)
    
    # Generate sensor features
    # Methane (CH4) level in % (normally 0-1%, >2% is dangerous)
    methane = np.random.uniform(0.0, 3.5, num_samples)
    
    # Carbon Monoxide (CO) level in ppm (normally 0-25 ppm, >50 ppm is dangerous)
    co = np.random.uniform(0.0, 100.0, num_samples)
    
    # Temperature in Celsius (normally 20-30°C, >38°C is hazardous in deep mines)
    temperature = np.random.uniform(18.0, 45.0, num_samples)
    
    # Humidity in % (normally 50-80%, >90% combined with high temp is hazardous)
    humidity = np.random.uniform(40.0, 95.0, num_samples)
    
    # Air velocity in m/s (normally 0.5-2.0 m/s, <0.3 m/s indicates poor ventilation)
    air_velocity = np.random.uniform(0.1, 3.0, num_samples)
    
    # Create DataFrame
    df = pd.DataFrame({
        'methane_level': methane,
        'co_level': co,
        'temperature': temperature,
        'humidity': humidity,
        'air_velocity': air_velocity
    })
    
    # Determine risk level based on mining safety thresholds with some noise
    # Risk Levels: 0 = Safe, 1 = Warning, 2 = Critical
    def determine_risk(row):
        # Base scoring
        score = 0
        
        # Methane thresholds
        if row['methane_level'] >= 2.0:
            score += 3
        elif row['methane_level'] >= 1.0:
            score += 1.5
            
        # CO thresholds
        if row['co_level'] >= 50.0:
            score += 3
        elif row['co_level'] >= 25.0:
            score += 1.5
            
        # Temperature thresholds
        if row['temperature'] >= 38.0:
            score += 2
        elif row['temperature'] >= 33.0:
            score += 1
            
        # Ventilation thresholds (low air velocity increases risk)
        if row['air_velocity'] <= 0.3:
            score += 1.5
        elif row['air_velocity'] <= 0.6:
            score += 0.5
            
        # High heat + high humidity combination
        if row['temperature'] >= 35.0 and row['humidity'] >= 85.0:
            score += 1.5
            
        # Add random noise to make it realistic
        noise = np.random.normal(0, 0.2)
        final_score = score + noise
        
        if final_score >= 3.5:
            return 2 # Critical
        elif final_score >= 1.5:
            return 1 # Warning
        else:
            return 0 # Safe
            
    df['risk_level'] = df.apply(determine_risk, axis=1)
    return df

def train_and_save_model():
    print("Generating synthetic mining dataset...")
    df = generate_synthetic_data()
    
    X = df[['methane_level', 'co_level', 'temperature', 'humidity', 'air_velocity']]
    y = df['risk_level']
    
    print("Dataset distribution:")
    print(y.value_counts(normalize=True))
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("\nTraining Random Forest model...")
    # Using Random Forest as it handle non-linear boundaries well and doesn't require scaling inputs
    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    print(f"Train Accuracy: {train_acc:.4f}")
    print(f"Test Accuracy: {test_acc:.4f}")
    
    # Save model
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model saved successfully to {model_path}")

if __name__ == '__main__':
    train_and_save_model()
