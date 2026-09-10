# Raksha360 (SlopeSentinel NER) 🛡️⛰️

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Status](https://img.shields.io/badge/Status-Live-success)](#)
[![Region](https://img.shields.io/badge/Focus_Region-North_East_India_(NER)-blue)](#)
[![Built for](https://img.shields.io/badge/Hackathon-SIH_Disaster_Management-orange)](#)

> **AI-Based Landslide Early Warning, Risk Monitoring & Decision Support System for North East India**  
> *Predict → Explain → Simulate → Prioritize → Warn → Respond*

---

## 📌 Overview

**Raksha360** is an advanced AI-powered disaster decision-support system built to predict, monitor, and mitigate landslide hazards across the 8 states of the **North Eastern Region (NER) of India** (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura).

Unlike static GIS susceptibility heatmaps, Raksha360 functions as a **dynamic early warning platform**:
- **Where** is landslide risk currently high?
- **Why** is the risk high? (Explainable multi-factor attribution)
- **Is the risk accelerating?** (Temporal tracking)
- **What happens under heavy monsoon rain?** (Interactive "What-If" scenario simulation)
- **What critical infrastructure is vulnerable?** (Roads, highways, habitations)

---

## ✨ Key Features

- 🗺️ **Dynamic GIS Risk Map**: Interactive Leaflet-powered mapping of critical NER stations and high-risk slope corridors with colour-coded alert states.
- 📈 **Dynamic Risk Scoring (0–100)**: Quantitative risk evaluation factoring in cumulative rainfall, slope angle, soil saturation, and geology.
- ⚡ **Risk Acceleration Monitoring**: Detects rapid risk escalation over consecutive 24h/48h periods.
- 🧪 **What-If Rainfall Scenario Simulation**: Real-time slider to simulate precipitation spikes (+10mm to +150mm) and preview consequence levels on slope stability.
- 🔍 **Explainable AI (XAI)**: Breakdown of risk drivers (e.g., *Antecedent Rainfall 45%, Terrain Slope 30%, Soil Moisture 25%*).
- 🚨 **Multi-Tier Early Warning System**: Color-coded warnings (Normal, Watch, Warning, Red Alert) with recommended standard operating procedures (SOPs).
- 📡 **Offline & Low-Bandwidth Readiness**: Formats alerts for low-connectivity SMS broadcast and field-level emergency teams.
- 👥 **Citizen Hazard Reporting**: Crowdsourced reporting module for ground cracks, rockfalls, and blocked drainages.
- 🌐 **Bilingual Interface**: Native support for **English** and **हिन्दी (Hindi)**.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, Modern CSS3 (Glassmorphism & Responsive Dashboard), Vanilla JavaScript (ES6+)
- **Mapping & Geospatial**: [Leaflet.js](https://leafletjs.com/) & OpenStreetMap tiles
- **Analytics & Visualizations**: [Chart.js](https://www.chartjs.org/)
- **Data & ML Pipelines**: Python (`pandas`, `scikit-learn`), CSV/JSON regional rainfall and station datasets

---

## 📂 Project Structure

```text
SIH/
├── index.html                  # Main application & interactive dashboard
├── style.css                   # Modern responsive CSS styles & theme
├── script.js                   # Map logic, risk calculations & dashboard controller
├── translations.js             # Internationalization (EN / HI)
├── SlopeSentinel_NER_SPEC.md   # Architectural & product specification
├── .gitignore                  # Git ignore rules
├── data/
│   ├── ner_data.js             # Station coordinates, terrain data & baselines
│   ├── ner_predictions.js      # Precomputed AI risk predictions
│   ├── ner_predictions.json    # JSON prediction models
│   ├── ner_rainfall_2025_2026.csv # Rainfall historical & telemetry data
│   ├── fetch_ner_data.py       # Data extraction & aggregation utility
│   ├── train_model.py          # Machine learning model training script
│   └── verify_dashboard.py     # Verification & validation tests
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started Locally

Because Raksha360 is built with modern, zero-dependency web standards, no complex build tools or `npm install` steps are required to run the frontend.

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- (Optional) Python 3.8+ if you want to run the data collection/training scripts

### Run with Local Server

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   cd <YOUR_REPO_NAME>
   ```

2. **Start a local development server**:
   - Using Python:
     ```bash
     python -m http.server 8000
     ```
   - Or using Node `npx serve`:
     ```bash
     npx serve .
     ```
   - Or using VS Code extension:
     Right-click `index.html` and select **"Open with Live Server"**.

3. **Open in browser**:
   Navigate to `http://localhost:8000`.

---

## ☁️ Deployment

### Deploy to Vercel (1-Click)

1. Push your code to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import this repository.
4. Keep the default settings (**Framework Preset: Other**, **Root Directory: ./**).
5. Click **Deploy**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
