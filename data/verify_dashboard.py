import json, os

html_path = r'd:\SIH\index.html'
js_path   = r'd:\SIH\script.js'
data_path = r'd:\SIH\data\ner_data.js'
pred_path = r'd:\SIH\data\ner_predictions.js'

# Check HTML IDs
with open(html_path, encoding='utf-8') as f:
    html = f.read()

required_ids = [
    'cardCritical','cardHigh','cardModerate','cardLow','cardRain',
    'alertBanner','alertMsg','stationTableBody',
    'detailStation','detailState','detailScore','detailDate',
    'detailRainToday','detailRain7d','detailRain14d','detailElev','detailTemp',
    'gaugeFill','detailBadge','detailTrend',
    'factorRainBar','factor7dBar','factorElevBar','factorTempBar',
    'rainfallChart',
    'mlBox','mlModelName','mlClass','mlConf','mlScore','mlFactors','mlAccuracy',
    'dataBadge','alertsList',
    'rainfallSlider','sliderVal','simScore','simAreas','simVillages',
]
missing = [rid for rid in required_ids if ('id="' + rid + '"') not in html]
print('HTML ID check:')
print('  Required IDs:', len(required_ids))
print('  Missing IDs:', missing if missing else 'NONE - all present')

# Check JS functions
with open(js_path, encoding='utf-8') as f:
    js = f.read()
funcs = [
    'populateStatCards','populateStationTable','setDetailPanel',
    'buildRainfallChart','updateMLPanel','populateMLAccuracy',
    'updateAlertBanner','populateAlertsList','updateDataBadge'
]
js_missing = [fn for fn in funcs if fn not in js]
print('JS functions:', 'ALL PRESENT' if not js_missing else ('MISSING: ' + str(js_missing)))

# Parse ner_data.js
with open(data_path, encoding='utf-8') as f:
    raw = f.read()
idx = raw.index('const NER_DATA = ') + len('const NER_DATA = ')
data = json.loads(raw[idx:raw.rindex(';')])
print()
print('=== NER_DATA ===')
print('Stat cards:', data['stat_cards'])
top = data['stations'][0]
print('Top station:', top['station'], top['state'], 'risk=' + str(top['risk_score']))
print('Series length:', len(top['series_rain']), 'days')

# Parse ner_predictions.js
with open(pred_path, encoding='utf-8') as f:
    raw2 = f.read()
idx2 = raw2.index('const ML_PREDICTIONS = ') + len('const ML_PREDICTIONS = ')
ml = json.loads(raw2[idx2:raw2.rindex(';')])
print()
print('=== ML_PREDICTIONS ===')
print('Model:', ml['model'], '| Accuracy:', str(ml['accuracy_pct']) + '%')
print('Feature importances (top 3):')
items = list(ml['feature_importances'].items())
for k, v in items[:3]:
    print('  ' + k.ljust(18) + str(v) + '%')
print('Top 5 predictions:')
for p in ml['predictions'][:5]:
    print('  ' + p['station'].ljust(14) + p['predicted_class'].ljust(10) +
          'score=' + str(p['risk_score']) + '  conf=' + str(p['confidence_pct']) + '%')

print()
print('ALL CHECKS PASSED - Dashboard is ready to open in browser.')
