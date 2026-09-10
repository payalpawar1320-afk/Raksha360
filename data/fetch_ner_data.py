"""
SlopeSentinel NER -- Real Data Fetcher
Fetches daily rainfall, temperature, and terrain data for all 8 NER states
from Open-Meteo Archive API (free, no auth required).
Covers Jan 2025 to Sep 2026.
"""

import urllib.request
import json
import csv
import os
import time

# NER State Capitals and Key Monitoring Stations
NER_STATIONS = [
    {"state": "Assam",             "district": "Kamrup",          "lat": 26.10, "lon": 91.77, "station": "Guwahati"},
    {"state": "Assam",             "district": "Cachar",          "lat": 24.81, "lon": 92.79, "station": "Silchar"},
    {"state": "Assam",             "district": "Dibrugarh",       "lat": 27.48, "lon": 94.91, "station": "Dibrugarh"},
    {"state": "Arunachal Pradesh", "district": "Papum Pare",      "lat": 27.08, "lon": 93.61, "station": "Itanagar"},
    {"state": "Arunachal Pradesh", "district": "East Siang",      "lat": 28.06, "lon": 95.33, "station": "Pasighat"},
    {"state": "Manipur",           "district": "Imphal West",     "lat": 24.82, "lon": 93.94, "station": "Imphal"},
    {"state": "Meghalaya",         "district": "East Khasi Hills","lat": 25.57, "lon": 91.88, "station": "Shillong"},
    {"state": "Meghalaya",         "district": "East Khasi Hills","lat": 25.27, "lon": 91.73, "station": "Cherrapunji"},
    {"state": "Mizoram",           "district": "Aizawl",          "lat": 23.73, "lon": 92.72, "station": "Aizawl"},
    {"state": "Nagaland",          "district": "Kohima",          "lat": 25.67, "lon": 94.12, "station": "Kohima"},
    {"state": "Sikkim",            "district": "East Sikkim",     "lat": 27.33, "lon": 88.62, "station": "Gangtok"},
    {"state": "Tripura",           "district": "West Tripura",    "lat": 23.83, "lon": 91.28, "station": "Agartala"},
]

START_DATE = "2025-01-01"
END_DATE   = "2026-09-08"

OUTPUT_DIR   = os.path.dirname(os.path.abspath(__file__))
RAINFALL_CSV = os.path.join(OUTPUT_DIR, "ner_rainfall_2025_2026.csv")
TERRAIN_CSV  = os.path.join(OUTPUT_DIR, "ner_terrain_stations.csv")


def fetch_daily_weather(lat, lon, start, end):
    url = (
        "https://archive-api.open-meteo.com/v1/archive"
        "?latitude=" + str(lat) + "&longitude=" + str(lon) +
        "&start_date=" + start + "&end_date=" + end +
        "&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,windspeed_10m_max"
        "&timezone=Asia%2FKolkata"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "SlopeSentinel/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def fetch_elevation(lat, lon):
    url = "https://api.open-meteo.com/v1/elevation?latitude=" + str(lat) + "&longitude=" + str(lon)
    req = urllib.request.Request(url, headers={"User-Agent": "SlopeSentinel/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())
        elev_list = data.get("elevation", [None])
        return elev_list[0] if elev_list else None


def compute_rolling(values, window):
    result = []
    for i in range(len(values)):
        start_i = max(0, i - window + 1)
        chunk = [v for v in values[start_i:i+1] if v is not None]
        result.append(round(sum(chunk), 2))
    return result


def main():
    print("=" * 60)
    print("SlopeSentinel NER -- Real Data Fetcher")
    print("Period: " + START_DATE + " to " + END_DATE)
    print("Stations: " + str(len(NER_STATIONS)))
    print("=" * 60)

    all_rows = []

    for stn in NER_STATIONS:
        print("\n-> Fetching: " + stn["station"] + " (" + stn["state"] + ")")
        try:
            data  = fetch_daily_weather(stn["lat"], stn["lon"], START_DATE, END_DATE)
            daily = data["daily"]
            times  = daily["time"]
            precip = daily.get("precipitation_sum",   [None] * len(times))
            tmax   = daily.get("temperature_2m_max",  [None] * len(times))
            tmin   = daily.get("temperature_2m_min",  [None] * len(times))
            wind   = daily.get("windspeed_10m_max",   [None] * len(times))

            r3d  = compute_rolling(precip, 3)
            r7d  = compute_rolling(precip, 7)
            r14d = compute_rolling(precip, 14)

            elev = fetch_elevation(stn["lat"], stn["lon"])
            print("   OK: " + str(len(times)) + " days | Elevation: " + str(elev) + "m")

            for i, date in enumerate(times):
                all_rows.append({
                    "date":            date,
                    "state":           stn["state"],
                    "district":        stn["district"],
                    "station":         stn["station"],
                    "latitude":        stn["lat"],
                    "longitude":       stn["lon"],
                    "elevation_m":     elev,
                    "rainfall_mm":     precip[i],
                    "rainfall_3d_mm":  r3d[i],
                    "rainfall_7d_mm":  r7d[i],
                    "rainfall_14d_mm": r14d[i],
                    "temp_max_c":      tmax[i],
                    "temp_min_c":      tmin[i],
                    "wind_kmh":        wind[i],
                })

            time.sleep(0.5)

        except Exception as e:
            print("   ERROR: " + str(e))

    if all_rows:
        fieldnames = list(all_rows[0].keys())
        with open(RAINFALL_CSV, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_rows)
        print("\nRAINFALL CSV SAVED: " + RAINFALL_CSV)
        print("Total rows: " + str(len(all_rows)))

    terrain_rows = []
    for stn in NER_STATIONS:
        elev = next((r["elevation_m"] for r in all_rows if r["station"] == stn["station"]), None)
        slope_deg = round(max(5.0, min(60.0, float(elev or 100) / 50.0)), 1) if elev else None
        terrain_rows.append({
            "state":            stn["state"],
            "district":         stn["district"],
            "station":          stn["station"],
            "latitude":         stn["lat"],
            "longitude":        stn["lon"],
            "elevation_m":      elev,
            "slope_deg_approx": slope_deg,
            "source":           "Open-Meteo Elevation API",
        })

    with open(TERRAIN_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(terrain_rows[0].keys()))
        writer.writeheader()
        writer.writerows(terrain_rows)
    print("TERRAIN CSV SAVED: " + TERRAIN_CSV)

    print("\n" + "=" * 60)
    print("SUMMARY BY STATE")
    print("=" * 60)
    states = sorted(set(r["state"] for r in all_rows))
    for state in states:
        count    = sum(1 for r in all_rows if r["state"] == state)
        max_rain = max((r["rainfall_mm"] or 0) for r in all_rows if r["state"] == state)
        print("  " + state.ljust(25) + " -> " + str(count) + " records | Max daily rain: " + str(max_rain) + "mm")
    print("\nDone.")


if __name__ == "__main__":
    main()
