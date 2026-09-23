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
- **Backend**: Node.js + Express (`server.js`), JWT authentication, Nodemailer/Resend email service
- **Database**: MongoDB (via Mongoose) with automatic fallback to embedded local JSON storage
- **Data & ML Pipelines**: Python (`pandas`, `scikit-learn`), CSV/JSON regional rainfall and station datasets

---

## 🗄️ Database Setup (MongoDB)

Raksha360 supports two storage modes and **automatically selects the best available option** at startup:

| Mode | When Used | Persistence |
|---|---|---|
| **MongoDB** (recommended) | `MONGODB_URI` is set in `.env` | Cloud / Server |
| **Embedded Local Storage** | No URI provided or connection fails | `data/local_storage.json` |

> **Note:** MongoDB is *optional* for local development. The app runs fully without it using the embedded JSON fallback.

---

### Option A — MongoDB Atlas (Cloud, Recommended for Production)

1. **Create a free Atlas cluster**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create a Free Cluster** (M0 Sandbox).
   - Choose a cloud provider & region close to your users.

2. **Create a database user**
   - In Atlas: **Database Access** → **Add New Database User**.
   - Set a strong username and password. Keep them handy.

3. **Whitelist your IP (or allow all)**
   - In Atlas: **Network Access** → **Add IP Address**.
   - For development, click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - For production, add only your server's IP.

4. **Get your connection string**
   - In Atlas: **Database** → **Connect** → **Connect your application**.
   - Select **Node.js / 5.x or later** and copy the URI, e.g.:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/raksha360?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

5. **Set the URI in your `.env`**
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/raksha360?retryWrites=true&w=majority
   ```

---

### Option B — Local MongoDB (Self-hosted)

1. **Install MongoDB Community Edition**
   - Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
   - Follow the installer instructions for your OS.

2. **Start the MongoDB service**
   ```bash
   # macOS / Linux
   sudo systemctl start mongod
   # or
   brew services start mongodb/brew/mongodb-community

   # Windows (PowerShell as Admin)
   net start MongoDB
   ```

3. **Verify it's running**
   ```bash
   mongosh
   # You should see the MongoDB shell prompt
   ```

4. **Set the URI in your `.env`**
   ```env
   MONGODB_URI=mongodb://localhost:27017/raksha360
   ```

---

### Collections Created Automatically

Raksha360 uses Mongoose and **auto-creates** the following collections on first run:

| Collection | Purpose |
|---|---|
| `users` | Registered citizens & authority accounts |
| `alertlogs` | History of all dispatched early-warning alerts |

Default seed accounts are also inserted on first startup (see `.env.example` for credentials).

---

## 📂 Project Structure

```text
SIH/
├── index.html                  # Main application & interactive dashboard
├── style.css                   # Modern responsive CSS styles & theme
├── script.js                   # Map logic, risk calculations & dashboard controller
├── translations.js             # Internationalization (EN / HI)
├── server.js                   # Node.js/Express backend — auth, alerts, API routes
├── db.js                       # Database layer — MongoDB (Mongoose) + local JSON fallback
├── emailService.js             # Email alert dispatcher (Resend / Nodemailer SMTP)
├── .env.example                # Environment variable template
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

Raksha360 can be run in two modes:

| Mode | What you get | Requirements |
|---|---|---|
| **Frontend Only** | Interactive dashboard, maps, risk simulation | Browser only |
| **Full Stack** | + Auth, user accounts, email alerts, persistent DB | Node.js 18+ |

---

### Prerequisites

- Any modern web browser (Chrome, Firefox, Edge, Safari)
- **Node.js 18+** — for the backend server (`server.js`)
- (Optional) Python 3.8+ — for data collection/ML training scripts
- (Optional) MongoDB — see [Database Setup](#️-database-setup-mongodb) above

---

### Mode 1 — Frontend Only (No install required)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   cd <YOUR_REPO_NAME>
   ```

2. **Start a local static server**:
   - Using Python:
     ```bash
     python -m http.server 8000
     ```
   - Or using Node `npx serve`:
     ```bash
     npx serve .
     ```
   - Or using VS Code **Live Server** extension:
     Right-click `index.html` → **"Open with Live Server"**.

3. **Open in browser**: Navigate to `http://localhost:8000`.

---

### Mode 2 — Full Stack (Node.js + MongoDB)

1. **Clone the repository** (if not done already):
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   cd <YOUR_REPO_NAME>
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in the required values:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=<your_random_secret>

   # MongoDB (optional — leave blank for local JSON fallback)
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/raksha360

   # Email service (Resend or SMTP)
   RESEND_API_KEY=<your_resend_key>
   ```

4. **Start the backend server**:
   ```bash
   node server.js
   ```
   You should see:
   ```
   ✅ Connected to MongoDB via Mongoose.
   🚀 Raksha360 server running on http://localhost:5000
   ```
   > If no `MONGODB_URI` is set, you'll see `ℹ️ Using Local Embedded Storage` instead — the app still works fine.

5. **Open in browser**: Navigate to `http://localhost:5000`.

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
