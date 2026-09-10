// SlopeSentinel NER -- ML Predictions (auto-generated)
// Model: Gradient Boosting | Accuracy: 99.9%
// Note: Labels are threshold-based proxies, not actual landslide records.
const ML_PREDICTIONS = {
  "model": "Gradient Boosting",
  "accuracy_pct": 99.9,
  "trained_on": 5174,
  "tested_on": 2218,
  "generated_at": "2026-09-08",
  "feature_names": [
    "rainfall_1d",
    "rainfall_3d",
    "rainfall_7d",
    "rainfall_14d",
    "elevation_m",
    "temp_max",
    "temp_min",
    "temp_range",
    "wind_kmh",
    "month",
    "is_monsoon"
  ],
  "feature_importances": {
    "rainfall_7d": 46.9,
    "rainfall_14d": 18.9,
    "elevation_m": 8.9,
    "rainfall_3d": 8.0,
    "temp_min": 5.2,
    "temp_max": 3.3,
    "rainfall_1d": 2.8,
    "temp_range": 2.6,
    "month": 1.4,
    "is_monsoon": 1.1,
    "wind_kmh": 0.9
  },
  "label_note": "Labels are threshold-based proxies (not actual landslide occurrence records). Document this limitation. Replace with real NDMA/ISRO event data when available.",
  "predictions": [
    {
      "station": "Kohima",
      "state": "Nagaland",
      "district": "Kohima",
      "lat": 25.67,
      "lon": 94.12,
      "date": "2026-09-08",
      "predicted_class": "CRITICAL",
      "risk_score": 100,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 17.5,
        "rainfall_3d_mm": 71.9,
        "rainfall_7d_mm": 246.8,
        "rainfall_14d_mm": 329.6,
        "elevation_m": 1458.0,
        "temp_max_c": 24.8,
        "temp_min_c": 18.9
      },
      "top_factors": [
        [
          "elevation_m",
          130.176
        ],
        [
          "rainfall_7d",
          115.783
        ],
        [
          "rainfall_14d",
          62.433
        ],
        [
          "rainfall_3d",
          5.737
        ]
      ]
    },
    {
      "station": "Aizawl",
      "state": "Mizoram",
      "district": "Aizawl",
      "lat": 23.73,
      "lon": 92.72,
      "date": "2026-09-08",
      "predicted_class": "HIGH",
      "risk_score": 70,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 24.8,
        "rainfall_3d_mm": 49.6,
        "rainfall_7d_mm": 85.7,
        "rainfall_14d_mm": 189.1,
        "elevation_m": 973.0,
        "temp_max_c": 27.4,
        "temp_min_c": 19.7
      },
      "top_factors": [
        [
          "elevation_m",
          86.873
        ],
        [
          "rainfall_7d",
          40.205
        ],
        [
          "rainfall_14d",
          35.82
        ],
        [
          "rainfall_3d",
          3.958
        ]
      ]
    },
    {
      "station": "Gangtok",
      "state": "Sikkim",
      "district": "East Sikkim",
      "lat": 27.33,
      "lon": 88.62,
      "date": "2026-09-08",
      "predicted_class": "HIGH",
      "risk_score": 70,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 5.3,
        "rainfall_3d_mm": 29.8,
        "rainfall_7d_mm": 76.9,
        "rainfall_14d_mm": 169.5,
        "elevation_m": 1588.0,
        "temp_max_c": 24.7,
        "temp_min_c": 17.8
      },
      "top_factors": [
        [
          "elevation_m",
          141.783
        ],
        [
          "rainfall_7d",
          36.077
        ],
        [
          "rainfall_14d",
          32.107
        ],
        [
          "rainfall_3d",
          2.378
        ]
      ]
    },
    {
      "station": "Guwahati",
      "state": "Assam",
      "district": "Kamrup",
      "lat": 26.1,
      "lon": 91.77,
      "date": "2026-09-08",
      "predicted_class": "MODERATE",
      "risk_score": 40,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 4.8,
        "rainfall_3d_mm": 20.7,
        "rainfall_7d_mm": 54.6,
        "rainfall_14d_mm": 142.7,
        "elevation_m": 161.0,
        "temp_max_c": 32.6,
        "temp_min_c": 25.7
      },
      "top_factors": [
        [
          "rainfall_14d",
          27.03
        ],
        [
          "rainfall_7d",
          25.615
        ],
        [
          "elevation_m",
          14.375
        ],
        [
          "rainfall_3d",
          1.652
        ]
      ]
    },
    {
      "station": "Silchar",
      "state": "Assam",
      "district": "Cachar",
      "lat": 24.81,
      "lon": 92.79,
      "date": "2026-09-08",
      "predicted_class": "MODERATE",
      "risk_score": 40,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 12.4,
        "rainfall_3d_mm": 44.9,
        "rainfall_7d_mm": 111.1,
        "rainfall_14d_mm": 291.7,
        "elevation_m": 22.0,
        "temp_max_c": 32.1,
        "temp_min_c": 25.1
      },
      "top_factors": [
        [
          "rainfall_14d",
          55.254
        ],
        [
          "rainfall_7d",
          52.121
        ],
        [
          "rainfall_3d",
          3.583
        ],
        [
          "elevation_m",
          1.964
        ]
      ]
    },
    {
      "station": "Dibrugarh",
      "state": "Assam",
      "district": "Dibrugarh",
      "lat": 27.48,
      "lon": 94.91,
      "date": "2026-09-08",
      "predicted_class": "MODERATE",
      "risk_score": 40,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 9.4,
        "rainfall_3d_mm": 32.0,
        "rainfall_7d_mm": 76.1,
        "rainfall_14d_mm": 173.0,
        "elevation_m": 107.0,
        "temp_max_c": 32.3,
        "temp_min_c": 25.4
      },
      "top_factors": [
        [
          "rainfall_7d",
          35.701
        ],
        [
          "rainfall_14d",
          32.77
        ],
        [
          "elevation_m",
          9.553
        ],
        [
          "rainfall_3d",
          2.553
        ]
      ]
    },
    {
      "station": "Itanagar",
      "state": "Arunachal Pradesh",
      "district": "Papum Pare",
      "lat": 27.08,
      "lon": 93.61,
      "date": "2026-09-08",
      "predicted_class": "MODERATE",
      "risk_score": 40,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 3.9,
        "rainfall_3d_mm": 14.2,
        "rainfall_7d_mm": 56.2,
        "rainfall_14d_mm": 116.6,
        "elevation_m": 220.0,
        "temp_max_c": 30.6,
        "temp_min_c": 24.6
      },
      "top_factors": [
        [
          "rainfall_7d",
          26.366
        ],
        [
          "rainfall_14d",
          22.087
        ],
        [
          "elevation_m",
          19.642
        ],
        [
          "temp_min",
          1.288
        ]
      ]
    },
    {
      "station": "Pasighat",
      "state": "Arunachal Pradesh",
      "district": "East Siang",
      "lat": 28.06,
      "lon": 95.33,
      "date": "2026-09-08",
      "predicted_class": "MODERATE",
      "risk_score": 40,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 4.4,
        "rainfall_3d_mm": 29.2,
        "rainfall_7d_mm": 68.7,
        "rainfall_14d_mm": 147.1,
        "elevation_m": 163.0,
        "temp_max_c": 32.2,
        "temp_min_c": 25.1
      },
      "top_factors": [
        [
          "rainfall_7d",
          32.23
        ],
        [
          "rainfall_14d",
          27.864
        ],
        [
          "elevation_m",
          14.553
        ],
        [
          "rainfall_3d",
          2.33
        ]
      ]
    },
    {
      "station": "Imphal",
      "state": "Manipur",
      "district": "Imphal West",
      "lat": 24.82,
      "lon": 93.94,
      "date": "2026-09-08",
      "predicted_class": "MODERATE",
      "risk_score": 40,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 9.7,
        "rainfall_3d_mm": 13.0,
        "rainfall_7d_mm": 47.4,
        "rainfall_14d_mm": 152.7,
        "elevation_m": 782.0,
        "temp_max_c": 27.6,
        "temp_min_c": 22.6
      },
      "top_factors": [
        [
          "elevation_m",
          69.82
        ],
        [
          "rainfall_14d",
          28.925
        ],
        [
          "rainfall_7d",
          22.237
        ],
        [
          "temp_min",
          1.183
        ]
      ]
    },
    {
      "station": "Agartala",
      "state": "Tripura",
      "district": "West Tripura",
      "lat": 23.83,
      "lon": 91.28,
      "date": "2026-09-08",
      "predicted_class": "MODERATE",
      "risk_score": 40,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 5.6,
        "rainfall_3d_mm": 56.9,
        "rainfall_7d_mm": 88.5,
        "rainfall_14d_mm": 156.0,
        "elevation_m": 12.0,
        "temp_max_c": 32.2,
        "temp_min_c": 25.2
      },
      "top_factors": [
        [
          "rainfall_7d",
          41.519
        ],
        [
          "rainfall_14d",
          29.55
        ],
        [
          "rainfall_3d",
          4.54
        ],
        [
          "temp_min",
          1.319
        ]
      ]
    },
    {
      "station": "Cherrapunji",
      "state": "Meghalaya",
      "district": "East Khasi Hills",
      "lat": 25.27,
      "lon": 91.73,
      "date": "2026-09-08",
      "predicted_class": "MODERATE",
      "risk_score": 40,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 4.7,
        "rainfall_3d_mm": 11.5,
        "rainfall_7d_mm": 65.1,
        "rainfall_14d_mm": 130.4,
        "elevation_m": 1304.0,
        "temp_max_c": 24.2,
        "temp_min_c": 18.5
      },
      "top_factors": [
        [
          "elevation_m",
          116.426
        ],
        [
          "rainfall_7d",
          30.541
        ],
        [
          "rainfall_14d",
          24.701
        ],
        [
          "temp_min",
          0.968
        ]
      ]
    },
    {
      "station": "Shillong",
      "state": "Meghalaya",
      "district": "East Khasi Hills",
      "lat": 25.57,
      "lon": 91.88,
      "date": "2026-09-08",
      "predicted_class": "LOW",
      "risk_score": 10,
      "confidence_pct": 100.0,
      "feature_values": {
        "rainfall_today_mm": 6.9,
        "rainfall_3d_mm": 13.6,
        "rainfall_7d_mm": 33.7,
        "rainfall_14d_mm": 89.6,
        "elevation_m": 1513.0,
        "temp_max_c": 25.0,
        "temp_min_c": 18.0
      },
      "top_factors": [
        [
          "elevation_m",
          135.086
        ],
        [
          "rainfall_14d",
          16.972
        ],
        [
          "rainfall_7d",
          15.81
        ],
        [
          "rainfall_3d",
          1.085
        ]
      ]
    }
  ]
};
