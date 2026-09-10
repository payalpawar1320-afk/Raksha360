"""
SlopeSentinel NER -- ML Training Pipeline
Trains a Random Forest classifier on real 2025-2026 NER rainfall + terrain data.
Target: landslide_risk_class (LOW / MODERATE / HIGH / CRITICAL)
Exports predictions as JSON for the dashboard.
"""

import csv
import json
import os
import math
from collections import defaultdict

# ── scikit-learn ───────────────────────────────────────────────
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

DATA_DIR   = os.path.dirname(os.path.abspath(__file__))
CSV_FILE   = os.path.join(DATA_DIR, "ner_rainfall_2025_2026.csv")
OUT_JSON   = os.path.join(DATA_DIR, "ner_predictions.json")
OUT_JS     = os.path.join(DATA_DIR, "ner_predictions.js")

# ── 1. Load Data ───────────────────────────────────────────────
print("=" * 60)
print("SlopeSentinel NER -- ML Training Pipeline")
print("=" * 60)
print("\nLoading data from:", CSV_FILE)

with open(CSV_FILE, "r", encoding="utf-8") as f:
    raw = list(csv.DictReader(f))

print("Rows loaded:", len(raw))

# ── 2. Feature Engineering ─────────────────────────────────────
#
# Features per row:
#   rainfall_mm         - daily rainfall
#   rainfall_3d_mm      - 3-day rolling sum
#   rainfall_7d_mm      - 7-day rolling sum
#   rainfall_14d_mm     - 14-day rolling sum
#   elevation_m         - station elevation
#   temp_max_c          - max temp
#   temp_min_c          - min temp
#   temp_range          - derived: max - min (instability proxy)
#   wind_kmh            - wind speed
#   month               - seasonal encoding
#   is_monsoon          - June-September flag
#
# Target: risk_class derived from rainfall thresholds + elevation
#   CRITICAL: 7d > 200mm AND elev > 500m
#   HIGH:     7d > 100mm OR (7d > 60mm AND elev > 800m)
#   MODERATE: 7d > 40mm OR daily > 20mm
#   LOW:      otherwise
#
# Note: In absence of actual landslide occurrence labels, we use
# a physics-informed threshold as proxy. Documented limitation.

def derive_risk_class(rain_1d, rain_7d, rain_14d, elev):
    """Threshold-based proxy label (documented limitation)."""
    if rain_7d > 200 and elev > 500:
        return "CRITICAL"
    if rain_7d > 120 or (rain_7d > 70 and elev > 800):
        return "HIGH"
    if rain_7d > 40 or rain_1d > 25:
        return "MODERATE"
    return "LOW"

rows_features = []
rows_labels   = []
rows_meta     = []

for r in raw:
    try:
        rain1d  = float(r["rainfall_mm"]     or 0)
        rain3d  = float(r["rainfall_3d_mm"]  or 0)
        rain7d  = float(r["rainfall_7d_mm"]  or 0)
        rain14d = float(r["rainfall_14d_mm"] or 0)
        elev    = float(r["elevation_m"]     or 0)
        tmax    = float(r["temp_max_c"]      or 25)
        tmin    = float(r["temp_min_c"]      or 15)
        wind    = float(r["wind_kmh"]        or 0)
        month   = int(r["date"][5:7])
        is_mon  = 1 if 6 <= month <= 9 else 0
        t_range = tmax - tmin

        feats = [
            rain1d, rain3d, rain7d, rain14d,
            elev, tmax, tmin, t_range, wind,
            float(month), float(is_mon),
        ]
        label = derive_risk_class(rain1d, rain7d, rain14d, elev)

        rows_features.append(feats)
        rows_labels.append(label)
        rows_meta.append({
            "date":    r["date"],
            "station": r["station"],
            "state":   r["state"],
            "district":r["district"],
            "lat":     float(r["latitude"]),
            "lon":     float(r["longitude"]),
        })
    except Exception as e:
        pass  # skip malformed rows

X = np.array(rows_features, dtype=float)
FEATURE_NAMES = [
    "rainfall_1d", "rainfall_3d", "rainfall_7d", "rainfall_14d",
    "elevation_m", "temp_max", "temp_min", "temp_range", "wind_kmh",
    "month", "is_monsoon",
]

# Encode labels
le = LabelEncoder()
y  = le.fit_transform(rows_labels)  # CRITICAL=0, HIGH=1, LOW=2, MODERATE=3

print("\nClass distribution (threshold-based proxy labels):")
for cls in sorted(set(rows_labels)):
    cnt = rows_labels.count(cls)
    pct = 100 * cnt / len(rows_labels)
    print("  " + cls.ljust(10) + ": " + str(cnt) + " rows (" + str(round(pct, 1)) + "%)")

# ── 3. Train Random Forest ─────────────────────────────────────
print("\n--- Training Random Forest ---")

rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_leaf=4,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced",
)

# Temporal cross-validation: train on first 70%, test on last 30%
split_idx = int(len(X) * 0.70)
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)

acc = 100 * (y_pred == y_test).mean()
print("Temporal split accuracy (train on 70%, test on 30%): " + str(round(acc, 1)) + "%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# Feature importances
importances = rf.feature_importances_
feat_ranked = sorted(zip(FEATURE_NAMES, importances), key=lambda x: -x[1])
print("Feature importances (top 6):")
for name, imp in feat_ranked[:6]:
    bar = "#" * int(imp * 50)
    print("  " + name.ljust(16) + bar + " " + str(round(imp * 100, 1)) + "%")

# ── 4. Gradient Boosting (secondary model) ────────────────────
print("\n--- Training Gradient Boosting ---")
gb = GradientBoostingClassifier(
    n_estimators=150, max_depth=5, learning_rate=0.1,
    random_state=42,
)
gb.fit(X_train, y_train)
gb_pred = gb.predict(X_test)
gb_acc  = 100 * (gb_pred == y_test).mean()
print("GBoost temporal accuracy: " + str(round(gb_acc, 1)) + "%")

# Use best model
best_model  = rf if acc >= gb_acc else gb
best_name   = "Random Forest" if acc >= gb_acc else "Gradient Boosting"
best_acc    = max(acc, gb_acc)
print("\nBest model: " + best_name + " (" + str(round(best_acc, 1)) + "% accuracy)")

# ── 5. Generate Predictions for Latest Date per Station ───────
print("\n--- Generating Station Predictions ---")

# Group by station and get last row per station
latest_by_stn = {}
for meta, feat, label in zip(rows_meta, rows_features, rows_labels):
    stn = meta["station"]
    if stn not in latest_by_stn or meta["date"] > latest_by_stn[stn]["meta"]["date"]:
        latest_by_stn[stn] = {"meta": meta, "feat": feat, "true_label": label}

predictions = []
for stn, data in latest_by_stn.items():
    feat_arr = np.array([data["feat"]])
    pred_class_idx = best_model.predict(feat_arr)[0]
    pred_proba     = best_model.predict_proba(feat_arr)[0]
    pred_label     = le.classes_[pred_class_idx]
    confidence_pct = round(float(pred_proba[pred_class_idx]) * 100, 1)

    # Risk score: weighted probability
    risk_score = 0
    for i, cls in enumerate(le.classes_):
        weight = {"CRITICAL": 100, "HIGH": 70, "MODERATE": 40, "LOW": 10}.get(cls, 20)
        risk_score += pred_proba[i] * weight
    risk_score = round(risk_score)

    # Top features (importances x feature values, normalised)
    feat_contribs = {}
    for fname, fval, fimp in zip(FEATURE_NAMES, data["feat"], importances):
        feat_contribs[fname] = round(float(fval) * float(fimp), 3)

    predictions.append({
        "station":        stn,
        "state":          data["meta"]["state"],
        "district":       data["meta"]["district"],
        "lat":            data["meta"]["lat"],
        "lon":            data["meta"]["lon"],
        "date":           data["meta"]["date"],
        "predicted_class": pred_label,
        "risk_score":     risk_score,
        "confidence_pct": confidence_pct,
        "feature_values": {
            "rainfall_today_mm": round(data["feat"][0], 1),
            "rainfall_3d_mm":    round(data["feat"][1], 1),
            "rainfall_7d_mm":    round(data["feat"][2], 1),
            "rainfall_14d_mm":   round(data["feat"][3], 1),
            "elevation_m":       round(data["feat"][4], 0),
            "temp_max_c":        round(data["feat"][5], 1),
            "temp_min_c":        round(data["feat"][6], 1),
        },
        "top_factors": sorted(feat_contribs.items(), key=lambda x: -x[1])[:4],
    })

predictions.sort(key=lambda x: -x["risk_score"])

print("\nML PREDICTIONS (current snapshot):")
print("-" * 65)
for p in predictions:
    print("  " + p["station"].ljust(14) + p["state"].ljust(22) +
          p["predicted_class"].ljust(10) + " score=" + str(p["risk_score"]) +
          " conf=" + str(p["confidence_pct"]) + "%")

# ── 6. Export JSON + JS ───────────────────────────────────────
output = {
    "model":         best_name,
    "accuracy_pct":  round(best_acc, 1),
    "trained_on":    len(X_train),
    "tested_on":     len(X_test),
    "generated_at":  rows_meta[-1]["date"] if rows_meta else "unknown",
    "feature_names": FEATURE_NAMES,
    "feature_importances": {n: round(float(v)*100,1) for n,v in feat_ranked},
    "label_note": (
        "Labels are threshold-based proxies (not actual landslide occurrence records). "
        "Document this limitation. Replace with real NDMA/ISRO event data when available."
    ),
    "predictions": predictions,
}

with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2)
print("\nJSON saved:", OUT_JSON)

js_content = (
    "// SlopeSentinel NER -- ML Predictions (auto-generated)\n"
    "// Model: " + best_name + " | Accuracy: " + str(round(best_acc,1)) + "%\n"
    "// Note: Labels are threshold-based proxies, not actual landslide records.\n"
    "const ML_PREDICTIONS = " + json.dumps(output, indent=2) + ";\n"
)
with open(OUT_JS, "w", encoding="utf-8") as f:
    f.write(js_content)
print("JS saved:", OUT_JS)

print("\n" + "=" * 60)
print("TRAINING COMPLETE")
print("  Best model:   " + best_name)
print("  Accuracy:     " + str(round(best_acc, 1)) + "%")
print("  Stations:     " + str(len(predictions)))
print("=" * 60)
