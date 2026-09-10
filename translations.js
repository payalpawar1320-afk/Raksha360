// ═══════════════════════════════════════════════════════════════
// Raksha360 — BILINGUAL LOCALIZATION (English & हिन्दी)
// ═══════════════════════════════════════════════════════════════

const STATE_NAMES_HI = {
  'Meghalaya': 'मेघालय',
  'Nagaland': 'नागालैंड',
  'Mizoram': 'मिज़ोरम',
  'Assam': 'असम',
  'Sikkim': 'सिक्किम',
  'Arunachal Pradesh': 'अरुणाचल प्रदेश',
  'Manipur': 'मणिपुर',
  'Tripura': 'त्रिपुरा'
};

const STATION_NAMES_HI = {
  'Kohima': 'कोहिमा',
  'Cherrapunji': 'चेरापूंजी',
  'Mawsynram': 'मासिनराम',
  'Shillong': 'शिलांग',
  'Gangtok': 'गंगटोक',
  'Aizawl': 'आइजोल',
  'Itanagar': 'ईटानगर',
  'Imphal': 'इंफाल',
  'Agartala': 'अगरतला',
  'Guwahati': 'गुवाहाटी',
  'Diphu': 'डिफू',
  'Haflong': 'हाफलोंग',
  'Mawsynram East': 'मासिनराम पूर्व',
  'Cherrapunji Upper': 'चेरापूंजी ऊपरी',
  'Nongstoin Ridge': 'नोंग्स्टोइन रिज',
  'Aizawl North Hill': 'आइजोल उत्तरी पहाड़ी'
};

const RISK_LEVELS_HI = {
  'CRITICAL': 'अति गंभीर',
  'HIGH': 'उच्च जोखिम',
  'ELEVATED': 'बढ़ा हुआ जोखिम',
  'MODERATE': 'मध्यम जोखिम',
  'LOW': 'कम जोखिम'
};

const TRANSLATIONS = {
  en: {
    // Topbar
    logo_tagline: 'Landslide Early Warning · NER',
    nav_home: 'Home',
    nav_map: 'Risk Map',
    nav_alerts: 'Alerts',
    nav_scenario: 'Rainfall Scenario',
    nav_report: 'Report Hazard',
    nav_about: 'About',
    live: 'Live',
    authority_btn: 'Authority',
    authority_exit: '← Exit Authority',

    // Modal
    modal_title: '📍 Check Risk Near Me',
    modal_sub: 'No account needed — public risk information',
    modal_use_location: '📡 Use My Location',
    modal_or_select: 'or select manually',
    modal_state: 'State',
    modal_select_state: 'Select State…',
    modal_station: 'District / Station',
    modal_select_station: 'Select Station…',
    modal_view_risk: 'View Risk Assessment →',

    // Hero
    hero_badge: 'NER Landslide Monitoring System · SIH 2026',
    hero_title_sub: 'AI-Powered Landslide Early Warning & Risk Monitoring',
    hero_tagline: '"Detect the Signs. Protect Lives."',
    hero_desc: 'AI-powered landslide risk monitoring that helps communities and authorities understand changing terrain risk before it becomes a disaster. Covering all of North East India — real rainfall data, real AI predictions.',
    hero_cta_near: '📍 Check Risk Near Me',
    hero_cta_map: '🗺 Explore Risk Map',
    hero_cta_report: '📷 Report a Hazard',
    hero_cta_authority: '🏛 Authority Dashboard',

    // Landing Stats
    stat_stations: 'Monitored Stations',
    stat_high_risk: 'High / Critical Risk',
    stat_states: 'NER States Covered',
    stat_accuracy: 'AI Model Accuracy',

    // Workflow
    wf_title: '⚡ How Raksha360 Protects Lives Across North East India',
    wf_sub: 'A seamless 8-step pipeline from meteorological satellites to on-ground disaster response',

    // Citizen View Station Bar
    citizen_title: '⛰ Regional Station Risk Monitor',
    citizen_sub: 'Select a station or search your district to inspect slope stability & AI predictions',
    search_placeholder: '🔍 Search station or state…',
    filter_all_states: 'All States',
    filter_all_risks: 'All Risk Levels',
    filter_critical: '🔴 Critical',
    filter_high: '🟠 High',
    filter_moderate: '🟡 Moderate',
    filter_low: '🟢 Low',

    // Table Headers
    th_station: 'Station / District',
    th_state: 'State',
    th_risk: 'Risk Score',
    th_status: 'Level',
    th_rain: 'Today Rain',
    th_action: 'Action',

    // Detail Panel
    detail_landslide_risk: 'Landslide Risk',
    detail_today_rain: '🌧 Today Rain',
    detail_7d_rain: '📅 7-Day',
    detail_14d_rain: '📆 14-Day',
    detail_elevation: '⛰ Elevation',
    detail_temp: '🌡 Temperature',
    why_title: '🔍 Why is this area at risk? (Explainable AI)',
    why_rain_today: "Today's Rainfall",
    why_rain_7d: '7-Day Accumulation',
    why_elev: 'Elevation & Slope Risk',
    why_temp: 'Temp. Variability',

    // Trend Chart
    trend_title: '📈 Is the Risk Rising?',
    trend_sub: '30-day daily rainfall (bars) + 7-day rolling average (line) — rising trend signals higher risk',

    // Risk Map
    map_title: '🗺 Interactive Risk Map',
    map_sub: 'Click a marker to inspect that station · Colours show current risk level',
    map_layer_risk: '⚠ Risk',
    map_layer_labels: '🏷 Labels',
    map_layer_rainfall: '🌧 Rainfall',
    map_layer_terrain: '⛰ Terrain',
    map_base_street: 'Street',
    map_base_satellite: 'Satellite',
    map_legend_title: 'Risk Level:',
    map_legend_critical: 'Critical',
    map_legend_high: 'High',
    map_legend_moderate: 'Moderate',
    map_legend_low: 'Low',
    map_legend_selected: '★ = Selected station',
    map_info_click_prompt: 'Click a station marker on the map to see instant analytics.',
    map_info_view_full: 'View Full Details →',
    map_info_score_label: 'LANDSLIDE RISK SCORE',
    map_info_trend: '📈 Trend',
    map_info_today_rain: '🌧 Today Rain',
    map_info_7d_rain: '📅 7-Day Rain',
    map_info_elev: '⛰ Elevation',
    map_info_temp: '🌡 Temp Range',
    map_info_district: '📍 District',

    // What-if Simulator
    sim_title: '🧪 Rainfall Scenario Simulator',
    sim_sub: 'Simulate how extreme rainfall would impact landslide risk at this location',
    sim_current: 'Current Score:',
    sim_add_rain: 'Simulate Additional Rainfall:',
    sim_predicted: 'Simulated Risk Score:',
    sim_reset: 'Reset Simulation',

    // Priority Block
    priority_title: '🚨 Authority Priority Ranking',
    priority_sub: 'High-risk zones requiring immediate monitoring and resource deployment',

    // Report Hazard
    report_title: '📷 Report a Hazard',
    report_sub: 'Observed something concerning? Report it — it helps protect your community.',
    report_obs_label: 'What did you observe?',
    report_opt_select: 'Select observation…',
    report_opt_crack: '⚡ Ground Cracks / Fissures',
    report_opt_tilt: '📐 Tilted Trees / Electric Poles',
    report_opt_debris: '🌊 Mudflow / Debris Washout',
    report_opt_rock: '🪨 Rockfall / Fallen Stones',
    report_opt_spring: '💧 New Water Springs Appearing',
    report_opt_other: '⚠️ Other Slope Instability',
    report_desc_label: 'Describe what you saw',
    report_desc_placeholder: 'Tell us what happened, exact landmark, road name…',
    report_lat_label: 'Latitude',
    report_lon_label: 'Longitude',
    report_submit: 'Submit Report',
    report_submitted: '✅ Report submitted successfully.',
    report_step1: '✅ Report received',
    report_step2: '⏳ Cross-checking rainfall data…',
    report_step3: '⏳ Checking against risk model…',
    report_step4: '⏳ Issuing verification…',

    // Warnings & Actions
    warnings_title: '⚠️ Active System Warnings',
    warnings_sub: 'Generated from real-time risk scores and field observations',
    action_title: '🛡️ What Should You Do?',
    action_evac: '🚨 Evacuation Advisory: Move to designated community shelters if living below steep or saturated slopes.',
    action_road: '🚗 Road Travel Vigilance: Avoid mountain passes (NH-40, NH-29) during heavy rain; watch for falling debris.',
    action_crack: '👀 Ground Watch: Report fresh fissures, muddy runoff, or tilted infrastructure immediately.',
    action_emergency: '📞 Emergency Contacts: State Disaster Management Authority (SDMA) Helpline: 1070 / 112.',

    // Authority Dashboard
    auth_title: '🏛 Authority Command Center',
    auth_sub: 'Real-time situational awareness, priority dispatch ranking & citizen report verification for Disaster Management Authorities',
    auth_stats_critical: 'Critical Risk Zones',
    auth_stats_pending: 'Pending Field Reports',
    auth_stats_alerted: 'Public Warnings Active',
    auth_stats_stations: 'Total NER Stations',
    auth_reports_title: '📷 Field Hazard Reports',
    auth_reports_sub: 'Citizen-submitted field observations — review and verify each report',
    auth_tab_all: 'All',
    auth_tab_pending: '🟡 Pending',
    auth_tab_verified: '✅ Verified',
    auth_tab_rejected: '❌ Rejected',
    auth_btn_verify: '✅ Verify Report',
    auth_btn_reject: '❌ Reject',

    // Mobile Nav
    mnav_home: 'Home',
    mnav_map: 'Map',
    mnav_alerts: 'Alerts',
    mnav_report: 'Report',

    // Footer
    footer_note: 'Risk scores are model estimates (Gradient Boosting AI). Not certified forecasts — always follow official government advisories and local authority instructions.'
  },

  hi: {
    // Topbar
    logo_tagline: 'भूस्खलन पूर्व चेतावनी प्रणाली · पूर्वोत्तर',
    nav_home: 'होम',
    nav_map: 'जोखिम मानचित्र',
    nav_alerts: 'चेतावनी',
    nav_scenario: 'वर्षा परिदृश्य',
    nav_report: 'खतरे की सूचना',
    nav_about: 'के बारे में',
    live: 'सक्रिय',
    authority_btn: 'प्राधिकरण',
    authority_exit: '← नागरिक दृश्य पर लौटें',

    // Modal
    modal_title: '📍 मेरे पास का जोखिम जांचें',
    modal_sub: 'बिना खाते के — सार्वजनिक जोखिम सूचना',
    modal_use_location: '📡 मेरे स्थान का उपयोग करें',
    modal_or_select: 'या मैन्युअल रूप से चुनें',
    modal_state: 'राज्य',
    modal_select_state: 'राज्य चुनें…',
    modal_station: 'ज़िला / स्टेशन',
    modal_select_station: 'स्टेशन चुनें…',
    modal_view_risk: 'जोखिम मूल्यांकन देखें →',

    // Hero
    hero_badge: 'पूर्वोत्तर भूस्खलन निगरानी प्रणाली · SIH 2026',
    hero_title_sub: 'एआई-आधारित भूस्खलन पूर्व चेतावनी व जोखिम निगरानी',
    hero_tagline: '"संकेतों को पहचानें। जीवन बचाएं।"',
    hero_desc: 'एआई-संचालित भूस्खलन जोखिम निगरानी प्रणाली जो समुदायों और आपदा प्रबंधन अधिकारियों को आपदा बनने से पहले बदलते भू-जोखिम को समझने में मदद करती है। पूरे पूर्वोत्तर भारत को कवर करती है — वास्तविक वर्षा डेटा और एआई पूर्वानुमान।',
    hero_cta_near: '📍 मेरे पास का जोखिम जांचें',
    hero_cta_map: '🗺 जोखिम मानचित्र देखें',
    hero_cta_report: '📷 खतरे की सूचना दें',
    hero_cta_authority: '🏛 प्राधिकरण डैशबोर्ड',

    // Landing Stats
    stat_stations: 'निगरानी स्टेशन',
    stat_high_risk: 'अति संवेदनशील / उच्च जोखिम',
    stat_states: 'पूर्वोत्तर के सभी 8 राज्य',
    stat_accuracy: 'एआई मॉडल सटीकता',

    // Workflow
    wf_title: '⚡ Raksha360 पूर्वोत्तर में जीवन की सुरक्षा कैसे करता है',
    wf_sub: 'मौसम उपग्रहों से लेकर ज़मीनी आपदा प्रतिक्रिया तक 8-चरणीय निर्बाध प्रणाली',

    // Citizen View Station Bar
    citizen_title: '⛰ क्षेत्रीय स्टेशन जोखिम निगरानी',
    citizen_sub: 'ढलान स्थिरता और एआई पूर्वानुमान देखने के लिए कोई स्टेशन चुनें या खोजें',
    search_placeholder: '🔍 स्टेशन या राज्य खोजें…',
    filter_all_states: 'सभी राज्य',
    filter_all_risks: 'सभी जोखिम स्तर',
    filter_critical: '🔴 अति गंभीर',
    filter_high: '🟠 उच्च',
    filter_moderate: '🟡 मध्यम',
    filter_low: '🟢 कम (सुरक्षित)',

    // Table Headers
    th_station: 'स्टेशन / ज़िला',
    th_state: 'राज्य',
    th_risk: 'जोखिम स्कोर',
    th_status: 'स्तर',
    th_rain: 'आज की वर्षा',
    th_action: 'कार्रवाई',

    // Detail Panel
    detail_landslide_risk: 'भूस्खलन जोखिम',
    detail_today_rain: '🌧 आज की वर्षा',
    detail_7d_rain: '📅 7-दिवसीय',
    detail_14d_rain: '📆 14-दिवसीय',
    detail_elevation: '⛰ ऊंचाई',
    detail_temp: '🌡 तापमान',
    why_title: '🔍 यह क्षेत्र जोखिम में क्यों है? (स्पष्टीकरणीय एआई)',
    why_rain_today: 'आज की वर्षा',
    why_rain_7d: '7-दिवसीय संचयी वर्षा',
    why_elev: 'ऊंचाई व ढलान जोखिम',
    why_temp: 'तापमान में बदलाव',

    // Trend Chart
    trend_title: '📈 क्या जोखिम बढ़ रहा है?',
    trend_sub: '30-दिवसीय दैनिक वर्षा (बार) + 7-दिवसीय औसत (रेखा) — बढ़ती रेखा उच्च जोखिम का संकेत है',

    // Risk Map
    map_title: '🗺 इंटरएक्टिव जोखिम मानचित्र',
    map_sub: 'स्टेशन का विवरण देखने के लिए मार्कर पर क्लिक करें · रंग वर्तमान जोखिम स्तर दर्शाते हैं',
    map_layer_risk: '⚠ जोखिम',
    map_layer_labels: '🏷 नाम',
    map_layer_rainfall: '🌧 वर्षा',
    map_layer_terrain: '⛰ स्थलाकृति',
    map_base_street: 'सड़क मानचित्र',
    map_base_satellite: 'उपग्रह (Satellite)',
    map_legend_title: 'जोखिम स्तर:',
    map_legend_critical: 'अति गंभीर',
    map_legend_high: 'उच्च',
    map_legend_moderate: 'मध्यम',
    map_legend_low: 'कम',
    map_legend_selected: '★ = चयनित स्टेशन',
    map_info_click_prompt: 'त्वरित विश्लेषण देखने के लिए मानचित्र पर किसी स्टेशन मार्कर पर क्लिक करें।',
    map_info_view_full: 'पूर्ण विवरण देखें →',
    map_info_score_label: 'भूस्खलन जोखिम स्कोर',
    map_info_trend: '📈 प्रवृत्ति',
    map_info_today_rain: '🌧 आज की वर्षा',
    map_info_7d_rain: '📅 7-दिवसीय वर्षा',
    map_info_elev: '⛰ ऊंचाई',
    map_info_temp: '🌡 तापमान सीमा',
    map_info_district: '📍 ज़िला',

    // What-if Simulator
    sim_title: '🧪 वर्षा परिदृश्य सिम्युलेटर',
    sim_sub: 'अनुकरण करें कि अत्यधिक वर्षा होने पर इस स्थान पर भूस्खलन जोखिम कैसे बदलता है',
    sim_current: 'वर्तमान स्कोर:',
    sim_add_rain: 'अतिरिक्त वर्षा का अनुकरण करें:',
    sim_predicted: 'अनुमानित जोखिम स्कोर:',
    sim_reset: 'रीसेट करें',

    // Priority Block
    priority_title: '🚨 प्राधिकरण प्राथमिकता रैंकिंग',
    priority_sub: 'तत्काल निगरानी और संसाधन तैनाती की आवश्यकता वाले उच्च जोखिम क्षेत्र',

    // Report Hazard
    report_title: '📷 खतरे की सूचना दें',
    report_sub: 'क्या आपने कोई चिंताजनक संकेत देखा? तुरंत रिपोर्ट करें — इससे आपके समुदाय की सुरक्षा होगी।',
    report_obs_label: 'आपने क्या देखा?',
    report_opt_select: 'अवलोकन चुनें…',
    report_opt_crack: '⚡ जमीन में दरारें / विदर',
    report_opt_tilt: '📐 झुके हुए पेड़ / बिजली के खंभे',
    report_opt_debris: '🌊 कीचड़ और मलबा बहाव',
    report_opt_rock: '🪨 चट्टान या पत्थर गिरना',
    report_opt_spring: '💧 नया जल स्रोत फूटना',
    report_opt_other: '⚠️ अन्य ढलान अस्थिरता',
    report_desc_label: 'जो देखा उसका विवरण दें',
    report_desc_placeholder: 'क्या हुआ, सटीक स्थान, सड़क का नाम लिखें…',
    report_lat_label: 'अक्षांश (Latitude)',
    report_lon_label: 'देशांतर (Longitude)',
    report_submit: 'रिपोर्ट सबमिट करें',
    report_submitted: '✅ रिपोर्ट सफलतापूर्वक सबमिट हो गई।',
    report_step1: '✅ रिपोर्ट प्राप्त हुई',
    report_step2: '⏳ वर्षा डेटा की पुष्टि हो रही है…',
    report_step3: '⏳ जोखिम मॉडल से मिलान किया जा रहा है…',
    report_step4: '⏳ प्राधिकरण सत्यापन जारी है…',

    // Warnings & Actions
    warnings_title: '⚠️ सक्रिय प्रणाली चेतावनियां',
    warnings_sub: 'वास्तविक समय जोखिम स्कोर और फील्ड अवलोकनों से तैयार',
    action_title: '🛡️ आपको क्या करना चाहिए?',
    action_evac: '🚨 निकासी सलाह: यदि आप खड़ी या अत्यधिक गीली ढलानों के नीचे रहते हैं, तो तुरंत सुरक्षित सामुदायिक आश्रय स्थल पर जाएं।',
    action_road: '🚗 पर्वतीय यात्रा में सावधानी: भारी बारिश के दौरान पर्वतीय मार्गों (NH-40, NH-29) पर जाने से बचें; गिरते मलबे पर नजर रखें।',
    action_crack: '👀 ज़मीनी निगरानी: ताज़ा दरारें, मटमैला पानी या झुके हुए खंभों की तुरंत रिपोर्ट करें।',
    action_emergency: '📞 आपातकालीन हेल्पलाइन: राज्य आपदा प्रबंधन प्राधिकरण (SDMA) हेल्पलाइन: 1070 / 112।',

    // Authority Dashboard
    auth_title: '🏛 प्राधिकरण कमान केंद्र',
    auth_sub: 'आपदा प्रबंधन अधिकारियों के लिए वास्तविक समय स्थिति जागरूकता, प्राथमिकता प्रेषण रैंकिंग और नागरिक रिपोर्ट सत्यापन',
    auth_stats_critical: 'अति गंभीर जोखिम क्षेत्र',
    auth_stats_pending: 'लंबित फील्ड रिपोर्ट',
    auth_stats_alerted: 'सक्रिय सार्वजनिक चेतावनियां',
    auth_stats_stations: 'कुल पूर्वोत्तर स्टेशन',
    auth_reports_title: '📷 फील्ड खतरे की रिपोर्ट',
    auth_reports_sub: 'नागरिकों द्वारा सबमिट किए गए अवलोकन — समीक्षा करें और सत्यापित करें',
    auth_tab_all: 'सभी',
    auth_tab_pending: '🟡 लंबित',
    auth_tab_verified: '✅ सत्यापित',
    auth_tab_rejected: '❌ खारिज',
    auth_btn_verify: '✅ सत्यापित करें',
    auth_btn_reject: '❌ खारिज',

    // Mobile Nav
    mnav_home: 'होम',
    mnav_map: 'मानचित्र',
    mnav_alerts: 'अलर्ट',
    mnav_report: 'रिपोर्ट',

    // Footer
    footer_note: 'जोखिम स्कोर एआई मॉडल अनुमान हैं (ग्रेडिएंट बूस्टिंग)। प्रमाणित पूर्वानुमान नहीं — हमेशा आधिकारिक सरकारी सलाह और स्थानीय प्रशासन के निर्देशों का पालन करें।'
  }
};
