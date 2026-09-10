# SlopeSentinel NER
## AI-Based Early Warning, Landslide Risk Monitoring & Disaster Decision Support System

---

# 1. PROJECT OVERVIEW

## 1.1 Project Name

**SlopeSentinel NER**

Full name:

**AI-Based Early Warning, Landslide Risk Monitoring and Decision Support System for the North Eastern Region of India**

---

## 1.2 Problem Statement

Build an AI-powered platform for monitoring and predicting landslide risk across the North Eastern Region (NER) of India.

The system must combine historical landslide information, rainfall, terrain, soil, satellite/land-cover information and infrastructure/exposure data to produce a dynamic landslide risk assessment.

The platform must go beyond a conventional GIS heatmap.

It must answer:

1. Where is landslide risk currently high?
2. Why is the risk high?
3. Is the risk increasing or decreasing?
4. Which locations are likely to become critical?
5. What areas, roads, villages and infrastructure may be affected?
6. What should authorities prioritize?
7. What happens under increased rainfall scenarios?
8. How confident is the AI prediction based on available data?
9. How can citizen/field reports improve situational awareness?
10. How can warnings be delivered in low-connectivity environments?

---

# 2. CORE PRODUCT IDEA

The platform follows:

**PREDICT → EXPLAIN → SIMULATE → PRIORITIZE → WARN → RESPOND**

The application must NOT be presented as merely a landslide prediction website.

The primary product is an:

**AI-powered disaster decision-support system.**

---

# 3. DIFFERENTIATION / INNOVATION

Existing systems commonly provide one or more of:

- landslide inventories
- susceptibility maps
- GIS visualization
- rainfall monitoring
- warning systems
- satellite monitoring
- sensor monitoring

SlopeSentinel NER should integrate these capabilities while adding a decision-support layer.

The primary differentiators are:

## 3.1 Dynamic Risk Score

Instead of only showing "high/medium/low", calculate:

**Risk Score: 0–100**

Example:

Current Risk: 82/100
Risk Level: HIGH

---

## 3.2 Risk Acceleration

Track how risk changes over time.

Example:

45 → 52 → 61 → 69 → 78 → 84

Display:

- Increasing
- Stable
- Decreasing

and the rate of change.

Do NOT invent real-time values when actual time-series data is unavailable.

For demonstration, clearly label simulated values as:

**DEMO / SIMULATION DATA**

---

## 3.3 Explainable AI

Every prediction must show the major contributing factors.

Example:

WHY IS THIS AREA HIGH RISK?

- Rainfall
- Slope
- Soil moisture
- Historical landslides
- Land cover

Show the actual model-derived feature importance/SHAP values when available.

Do not display fabricated feature contributions.

---

## 3.4 Estimated Warning Window

The platform should provide an estimated critical window when sufficient temporal information exists.

Example:

**Estimated critical window: 2–4 HOURS**

This must be explicitly described as a **model estimate**, not a guaranteed prediction.

If the model cannot reliably estimate lead time, show:

**Lead-time estimate unavailable**

---

## 3.5 Impact-Aware Risk

Landslide hazard and human risk must be treated separately.

Calculate:

**LANDSLIDE HAZARD + EXPOSURE = COMMUNITY RISK**

Exposure can include:

- villages
- roads
- highways
- bridges
- schools
- hospitals
- important infrastructure
- estimated population

---

## 3.6 Road Vulnerability / Connectivity Risk

Identify roads or road segments that intersect potential high-risk areas.

Show:

- Road risk
- Potential exposure
- Priority
- Alternative route where available

If actual road blockage training data is unavailable, do NOT claim validated physical blockage prediction.

Label it:

**Potential road exposure / scenario estimate**

---

## 3.7 What-If Simulator

Allow the user to modify rainfall conditions.

Example:

Current
+10%
+20%
+30%
+40%
+50%

After changing rainfall:

- recalculate risk
- update risk map
- identify newly affected areas
- update exposed villages
- update road exposure
- show risk changes

Clearly label scenario results as:

**SIMULATION — NOT A FORECAST**

---

## 3.8 AI Field Report Verification

Citizen/field officers can upload geo-tagged photos/videos of:

- cracks
- slope movement
- rockfall
- road blockage
- landslide

The computer vision module may assist in detecting visible damage.

Output example:

- Possible crack detected
- Confidence
- Severity

This is decision support, not a definitive engineering assessment.

---

# 4. TARGET USERS

## 4.1 Disaster Management Authorities

Need:

- regional overview
- critical zones
- warnings
- affected infrastructure
- evacuation priorities
- incident reports

## 4.2 District Administration

Need:

- district-level risk
- village-level exposure
- road risk
- alerts
- field reports

## 4.3 Field Officers

Need:

- mobile interface
- GPS location
- photo upload
- crack reporting
- road blockage reporting
- offline report storage

## 4.4 Citizens

Need:

- Check Risk Near Me
- Report a Hazard

---

# 5. GEOGRAPHIC SCOPE

Initial system:

**North Eastern Region of India**

Include:

- Arunachal Pradesh
- Assam
- Manipur
- Meghalaya
- Mizoram
- Nagaland
- Sikkim
- Tripura

Architecture must allow additional states later.

---

# 6. DATA REQUIREMENTS

## 6.1 Historical Landslide Data

Preferred fields:

- event_id
- latitude
- longitude
- date
- time
- state
- district
- location
- landslide_type
- severity
- area
- trigger
- source
- geometry

Supported formats:

- SHP
- GeoJSON
- CSV
- GeoPackage

A shapefile is normally a collection of files:

landslide.shp
landslide.shx
landslide.dbf
landslide.prj
landslide.cpg

Treat them as one dataset.

## 6.2 Rainfall Data

Support:

- hourly rainfall
- daily rainfall
- cumulative rainfall
- 3-hour rainfall
- 6-hour rainfall
- 12-hour rainfall
- 24-hour rainfall
- 3-day rainfall
- 7-day rainfall

Preferred schema:

- timestamp
- latitude
- longitude
- rainfall_mm
- source

## 6.3 DEM / Terrain

Required or derived:

- elevation
- slope
- aspect
- curvature
- terrain_ruggedness

## 6.4 Soil Data

Possible:

- soil_type
- clay_percentage
- sand_percentage
- silt_percentage
- soil_depth
- drainage
- soil_moisture

## 6.5 Satellite / Land Cover

Possible:

- land_cover
- NDVI
- vegetation
- bare_land
- built_up
- water
- surface_change

Do not fabricate satellite observations.

## 6.6 Geological Data

Possible:

- rock_type
- lithology
- fault_distance
- lineament_distance
- geological_class

## 6.7 Infrastructure Data

Include where available:

- roads
- highways
- railways
- bridges
- schools
- hospitals
- villages
- buildings
- population

## 6.8 Citizen / Field Reports

Schema:

- report_id
- latitude
- longitude
- timestamp
- report_type
- description
- image_url
- severity
- verified
- submitted_by

Possible report types:

- crack
- slope movement
- rockfall
- road blockage
- water seepage
- landslide
- other

---

# 7. DATA INGESTION PIPELINE

RAW DATA
↓
Validation
↓
Cleaning
↓
Coordinate normalization
↓
Spatial processing
↓
Feature engineering
↓
Feature storage
↓
ML dataset

Validate:

- missing coordinates
- invalid geometries
- duplicate records
- incorrect coordinate systems
- missing values
- inconsistent timestamps

---

# 8. GIS REQUIREMENTS

The main dashboard must contain an interactive map.

Map layers:

1. Landslide Risk
2. Historical Landslides
3. Rainfall
4. Slope
5. Soil
6. Land Cover
7. Villages
8. Roads
9. Critical Infrastructure
10. Potential Impact Zone
11. Evacuation Priority
12. Risk Acceleration

The heatmap is important but must NOT be the only feature.

---

# 9. MAP INTERACTION

User must be able to:

- zoom
- search location
- select state
- select district
- click risk zone
- toggle layers
- inspect risk information
- view historical events
- view rainfall
- view affected infrastructure
- launch simulation

Clicking a location opens:

LOCATION DETAILS

- District / State
- Risk
- Level
- Trend
- Confidence
- Main drivers
- Historical events
- Nearby roads
- Nearby villages
- Data confidence

---

# 10. RISK ENGINE

Risk score:

**0–100**

Suggested configurable categories:

0–20 LOW
21–40 MODERATE
41–60 ELEVATED
61–80 HIGH
81–100 CRITICAL

Do not claim these thresholds are scientifically validated unless they actually are.

---

# 11. ML PIPELINE

## 11.1 Baseline Model

Random Forest

## 11.2 Main Model

XGBoost if supported.

## 11.3 Optional

- LightGBM
- Logistic Regression
- temporal models
- neural networks

Prefer a model that performs well under proper validation.

---

# 12. TARGET VARIABLE

Possible primary target:

**landslide_occurred**

Binary:

0 = no landslide
1 = landslide

Alternative target:

risk_class

LOW
MODERATE
HIGH
CRITICAL

Document exactly which target is used.

---

# 13. TRAINING DATA CREATION

Positive samples:

Locations/times associated with actual historical landslide events.

Negative samples:

Locations/times without recorded landslide events.

IMPORTANT:

Do not blindly assume that an absent record means no landslide occurred.

Document this limitation.

---

# 14. FEATURE ENGINEERING

Potential features:

- rainfall_1h
- rainfall_3h
- rainfall_6h
- rainfall_12h
- rainfall_24h
- rainfall_3day
- rainfall_7day
- elevation
- slope
- aspect
- curvature
- soil_moisture
- soil_type
- NDVI
- land_cover
- historical_landslide_count
- distance_to_previous_landslide
- distance_to_road
- distance_to_village
- distance_to_bridge
- geology

---

# 15. MODEL VALIDATION

Avoid random train/test splitting when it causes spatial or temporal leakage.

Prefer:

- spatial validation
- temporal validation
- grouped validation

Report:

- Accuracy
- Precision
- Recall
- F1 Score
- ROC-AUC
- PR-AUC
- Confusion Matrix

Pay special attention to recall for landslide events.

Use actual measured metrics only.

---

# 16. MODEL EXPLAINABILITY

Use SHAP where appropriate.

Dashboard should show actual top contributing factors.

Example:

1. 24h rainfall
2. slope
3. soil moisture
4. previous landslide history
5. land cover

No hard-coded fake explanations.

---

# 17. DATA CONFIDENCE ENGINE

Every risk prediction should have:

- HIGH
- MEDIUM
- LOW

Confidence should depend on:

- data completeness
- data freshness
- sensor availability
- historical coverage
- spatial coverage
- model confidence

Example:

Prediction: 78/100
Confidence: MEDIUM

Reason:
Recent rainfall available.
No local sensor data.
Limited historical events nearby.

---

# 18. RISK ACCELERATION ENGINE

Store historical predictions.

Example:

10:00 → 42
11:00 → 48
12:00 → 57
13:00 → 69
14:00 → 78

Calculate:

- risk_change
- risk_velocity
- risk_acceleration

Display:

**RAPIDLY INCREASING**

when configurable thresholds are exceeded.

---

# 19. COMMUNITY IMPACT ENGINE

Calculate exposure using:

- hazard
- population
- infrastructure
- road connectivity

Show:

- Hazard Score
- Exposure Score
- Community Risk
- Potentially affected villages
- Population
- Road segments
- Bridges
- Schools
- Hospitals

Values must come from actual datasets or be clearly marked demo data.

---

# 20. EVACUATION PRIORITY

Categories:

- P1 — Immediate
- P2 — High
- P3 — Monitor

Consider:

- risk
- population
- proximity to hazard
- infrastructure importance
- available routes

Recommendations must not be presented as a replacement for emergency authorities.

---

# 21. WHAT-IF SIMULATOR

Rainfall scenario controls:

Current
+10%
+20%
+30%
+40%
+50%

Show:

- risk before
- risk after
- new critical zones
- newly exposed villages
- newly exposed roads

All results must say:

**SIMULATION — NOT A FORECAST**

---

# 22. CITIZEN REPORTING

Citizen form:

- GPS
- Photo
- Report type
- Description
- Timestamp

Report types:

- Crack
- Landslide
- Rockfall
- Road blockage
- Water seepage
- Other

---

# 23. COMPUTER VISION MODULE

Optional but recommended.

Analyze images for visible:

- cracks
- rockfall
- landslide debris
- road blockage
- slope damage

Return:

- classification
- confidence
- severity

Clearly label this as decision support.

---

# 24. FIELD OFFICER MODE

Mobile-friendly features:

- GPS
- report creation
- photo capture
- incident list
- assigned tasks
- offline storage
- synchronization

---

# 25. OFFLINE MODE

When internet is unavailable:

- view cached critical information
- create reports
- store reports locally
- queue submissions

When connection returns:

Local Queue
↓
Sync
↓
Server

---

# 26. ALERT ENGINE

Alert levels:

- INFO
- WATCH
- WARNING
- CRITICAL

Example:

CRITICAL LANDSLIDE RISK

Location:
XYZ District

Risk:
84/100

Main factor:
Extreme rainfall

Potential impact:
2 villages
1 road corridor

Recommended action:
Field inspection required.

---

# 27. MULTILINGUAL SUPPORT

Initial:

- English
- Hindi

Architecture should support future:

- Assamese
- Bengali
- Nepali
- Manipuri
- Mizo
- Khasi
- other relevant regional languages

Use internationalization. Do not hard-code all UI text.

---

# 28. ALERT DELIVERY

Prototype channels:

- in-app alert
- dashboard alert
- browser notification where supported
- SMS integration placeholder
- email integration placeholder

If no provider is connected, implement notification simulation and label it clearly.

---

# 29. AUTHENTICATION

Roles:

- ADMIN
- AUTHORITY
- FIELD_OFFICER
- CITIZEN

Role-based permissions.

---

# 30. DATABASE

Preferred:

**PostgreSQL + PostGIS**

Alternative:

**MongoDB**

Core tables/collections:

- users
- landslides
- rainfall
- terrain
- soil
- landcover
- infrastructure
- villages
- risk_predictions
- risk_history
- citizen_reports
- alerts
- simulation_runs
- model_versions

---

# 31. API DESIGN

Suggested:

GET /api/risk
GET /api/risk/:location
GET /api/risk/history/:location

GET /api/landslides
GET /api/rainfall

GET /api/map/layers

POST /api/reports
GET /api/reports

POST /api/simulation
GET /api/simulation/:id

GET /api/alerts
POST /api/alerts

GET /api/model/status
GET /api/model/explanation

---

# 32. FRONTEND PAGES

1. Landing Page
2. Main Dashboard
3. Risk Map
4. Location Details
5. What-If Simulator
6. Alerts
7. Citizen Reporting
8. Field Officer
9. Analytics
10. Admin / Model

---

# 33. UI DESIGN

Professional disaster-management platform.

Avoid:

- excessive gradients
- cartoon graphics
- unnecessary animations
- generic AI illustrations
- excessive glassmorphism

Preferred:

- clean
- professional
- map-centric
- high readability
- strong hierarchy
- responsive

Risk colors:

LOW = Green
MODERATE = Yellow
HIGH = Orange
CRITICAL = Red

Do not use color alone to communicate risk.

---

# 34. TECHNOLOGY STACK

Frontend:

- React
- TypeScript
- Tailwind CSS
- MapLibre GL JS or Leaflet

Backend:

- Python
- FastAPI

ML:

- pandas
- NumPy
- scikit-learn
- XGBoost
- SHAP

GIS:

- GeoPandas
- Rasterio
- Shapely
- PostGIS

Database:

- PostgreSQL + PostGIS preferred
- MongoDB alternative

---

# 35. PROJECT DIRECTORY

slopesentinel-ner/

frontend/
  src/
    components/
    pages/
    map/
    charts/
    services/
    utils/

backend/
  app/
    api/
    models/
    services/
    gis/
    ml/
    main.py

data/
  raw/
  processed/
  sample/

models/
  trained/
  metadata/

notebooks/
scripts/
docs/
tests/

.env.example
README.md
SPEC.md

---

# 36. DATASET HANDLING

The system must support the team's existing landslide ZIP dataset.

If the ZIP contains:

.shp
.shx
.dbf
.prj
.cpg

do not treat .shp as a standalone CSV.

Use GeoPandas/Fiona/GDAL-compatible tooling.

Pipeline:

ZIP
↓
Extract
↓
Validate shapefile components
↓
Read geometry
↓
Read attributes
↓
Reproject coordinates
↓
Clean
↓
Store as GeoJSON/PostGIS/processed format

Keep original ZIP untouched in:

data/raw/

---

# 37. IMPORTANT DATA RULE

Never fabricate real-world environmental data.

If a dataset is missing:

Do NOT generate fake historical landslides and present them as real.

For UI demonstration only, synthetic data may be used if clearly labeled:

**DEMO DATA**

or

**SIMULATION**

---

# 38. DEMO DATA MODE

Provide a visible switch:

DATA MODE

● REAL DATA
○ DEMO / SIMULATION

When demo mode is active, show:

**DEMO MODE**

---

# 39. SYSTEM RESILIENCE

If one data source is unavailable, continue operating with reduced confidence.

Example:

Satellite data: Unavailable
Sensor data: Unavailable
Rainfall: Available
Terrain: Available
Prediction confidence: MEDIUM

---

# 40. MODEL VERSIONING

Store:

- model_name
- version
- training_date
- features
- dataset_version
- validation_metrics

Example:

Model: XGBoost
Version: v1.2

Use actual metrics only.

---

# 41. SECURITY

Implement:

- input validation
- file type validation
- upload size limits
- authentication
- authorization
- secure environment variables
- no API keys in frontend
- safe file names
- basic rate limiting

---

# 42. PRIVACY

Citizen reports may contain:

- location
- image
- description

Only collect information necessary for the system.

Avoid unnecessary personally identifiable information.

---

# 43. PERFORMANCE

Target:

- dashboard initial load under a few seconds on normal broadband
- responsive map
- lazy-load large GIS layers
- paginate reports
- cache frequently requested data

Do not load huge raw shapefiles directly into the browser.

---

# 44. ERROR HANDLING

Every major page needs:

- Loading state
- No data state
- Data unavailable state
- Low confidence state
- Server error state
- Offline state

Never show a blank screen.

---

# 45. ACCESSIBILITY

Provide:

- readable text
- keyboard navigation where practical
- sufficient contrast
- labels in addition to colors
- accessible buttons
- responsive design

---

# 46. TESTING

Backend:

- API tests
- data validation tests
- risk calculation tests
- simulation tests

ML:

- feature consistency
- model loading
- prediction format
- missing-data handling

Frontend:

- map loading
- filters
- risk details
- simulation
- report submission

---

# 47. DEMO SCENARIO

The SIH demonstration should follow one disaster story.

STEP 1 — Normal conditions

Risk: 18/100
Status: LOW

STEP 2 — Rainfall increases

Risk: 46/100
Status: ELEVATED

STEP 3 — Other risk factors increase

Risk: 68/100
Status: HIGH
Trend: Increasing

STEP 4 — Risk acceleration

Risk: 82/100
Status: CRITICAL
Risk acceleration: HIGH

STEP 5 — AI explanation

Show the actual major drivers.

STEP 6 — Impact analysis

Identify:

- villages
- highway
- bridge
- other infrastructure

STEP 7 — Action recommendation

Prioritize inspection and preparedness.

STEP 8 — What-if simulation

Increase rainfall by 40%.

Show the changed impact zone.

STEP 9 — Citizen report

Upload demonstration image.

Run optional computer vision analysis.

STEP 10 — Warning

Display a geo-targeted critical warning.

---

# 48. JUDGE-FACING VALUE

The system must demonstrate:

Prediction:
What is likely to happen?

Explanation:
Why?

Lead Time:
How soon might it become critical?

Impact:
Who/what could be affected?

Decision:
What should authorities prioritize?

Simulation:
What if rainfall becomes worse?

Verification:
What is happening on the ground?

Communication:
How do we warn people?

---

# 49. WHAT NOT TO CLAIM

Never claim:

- 100% prediction accuracy
- guaranteed landslide prediction
- guaranteed evacuation safety
- official government warning status
- replacement of government agencies
- real-time satellite data unless connected
- real IoT sensor data unless available
- real SMS delivery unless provider is connected
- validated lead-time prediction unless properly validated
- real population estimates without supporting data
- validated road blockage probability without appropriate training data

---

# 50. MVP PRIORITY

If time is limited:

Priority 1 — Interactive NER risk map
Priority 2 — Historical landslide + rainfall + terrain
Priority 3 — Working ML prediction
Priority 4 — Explainable AI
Priority 5 — Risk acceleration
Priority 6 — Impact analysis
Priority 7 — What-if simulator
Priority 8 — Citizen reporting
Priority 9 — Offline field mode
Priority 10 — Computer vision

---

# 51. DO NOT OVERBUILD

Do not spend most of the hackathon on:

- complicated authentication
- unnecessary animations
- generic chatbots
- decorative AI graphics
- dozens of dashboards
- fake live data
- unnecessary deep learning

Focus on:

**DATA → MODEL → MAP → EXPLANATION → IMPACT → ACTION**

---

# 52. FINAL PRODUCT POSITIONING

Use:

> SlopeSentinel NER is an AI-powered landslide decision-support platform that combines environmental, terrain, historical and geospatial data to estimate localized landslide risk, explain why risk is changing, identify potentially affected communities and infrastructure, simulate worsening rainfall scenarios, and support timely disaster-response decisions.

---

# 53. UNIQUE VALUE PROPOSITION

Do not pitch:

> "An AI model that predicts landslides."

Pitch:

> **"A system that turns landslide prediction into an actionable disaster decision."**

Core pipeline:

**PREDICT → EXPLAIN → TRACK RISK ACCELERATION → ESTIMATE IMPACT → SIMULATE → PRIORITIZE → WARN → VERIFY**

---

# 54. ANTIGRAVITY IMPLEMENTATION INSTRUCTION

Antigravity must build incrementally.

Do NOT generate the entire production system in one step.

Implementation order:

1. Project setup
2. Database + sample data
3. GIS map
4. ML pipeline
5. Risk engine
6. Explainability
7. Risk acceleration
8. Impact engine
9. What-if simulator
10. Citizen reporting
11. Offline mode
12. Testing + polish

After each phase:

1. Run the application.
2. Test the feature.
3. Fix errors.
4. Do not proceed until the previous phase works.
5. Keep existing functionality intact.

---

# 55. ANTIGRAVITY CODING RULES

1. Use TypeScript for frontend.
2. Use Python/FastAPI for backend.
3. Keep frontend and backend separated.
4. Use environment variables for secrets.
5. Never hard-code API keys.
6. Never fabricate real-world data.
7. Label simulated/demo data.
8. Use reusable components.
9. Keep GIS processing on the backend.
10. Do not load massive raw GIS files into the browser.
11. Add error and loading states.
12. Use meaningful variable names.
13. Add comments for complex GIS/ML logic.
14. Maintain a clean project structure.
15. Do not delete working functionality without explicit reason.
16. Validate uploaded files.
17. Keep ML preprocessing identical between training and inference.
18. Save model metadata.
19. Record data source and timestamp where possible.
20. Make risk thresholds configurable.

---

# 56. ACCEPTANCE CRITERIA

## Data

- [ ] Landslide GIS dataset loads
- [ ] Coordinates display correctly
- [ ] Historical events appear on map
- [ ] Rainfall data can be loaded
- [ ] Terrain features can be loaded

## AI

- [ ] ML model trains
- [ ] Model predicts risk
- [ ] Risk score is 0–100
- [ ] Confidence is displayed
- [ ] Explainability works
- [ ] Model metrics are available

## GIS

- [ ] NER map works
- [ ] Risk heatmap works
- [ ] Historical layer works
- [ ] Infrastructure layers work
- [ ] Location details work

## Decision Support

- [ ] Risk acceleration works
- [ ] Impact analysis works
- [ ] Priority ranking works
- [ ] What-if simulation works

## Reporting

- [ ] Citizen report works
- [ ] Photo upload works
- [ ] GPS/location works
- [ ] Offline queue works or is clearly implemented as prototype

## UX

- [ ] Responsive design
- [ ] Loading states
- [ ] Error states
- [ ] Demo mode indicator
- [ ] Professional dashboard

---

# 57. FINAL DESIGN PRINCIPLE

The application should make a judge understand within 30 seconds:

**WHERE is the danger?**
↓
**WHY is it dangerous?**
↓
**IS the danger increasing?**
↓
**WHO will be affected?**
↓
**WHAT happens if rainfall increases?**
↓
**WHAT should authorities do?**

If the application answers these six questions, it successfully implements the SlopeSentinel NER concept.

---

# END OF SPECIFICATION
