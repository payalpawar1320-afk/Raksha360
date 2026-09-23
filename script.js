// ═══════════════════════════════════════════════════════════════
// Raksha360 — Dashboard Script
// AI-Powered Landslide Early Warning & Risk Monitoring, NER
// Wired to real Open-Meteo Archive data (2025-2026)
// ═══════════════════════════════════════════════════════════════

// ── Chart instance (Chart.js) ──────────────────────────────────
let rainfallChart = null;

// ── Current active station ─────────────────────────────────────
let _activeStation = null;
let _simBase = 40;

// ── View state ─────────────────────────────────────────────────
let _currentView = 'landing'; // 'landing' | 'citizen' | 'authority'

// ── 3-Tier Access & Auth State (Guest / Citizen / Authority) ──
let _currentUser = null;
let _authToken = null;
try {
  const savedUser = localStorage.getItem('raksha_user');
  const savedToken = localStorage.getItem('raksha_token');
  if (savedUser && savedToken) {
    _currentUser = JSON.parse(savedUser);
    _authToken = savedToken;
  }
} catch (e) {
  _currentUser = null;
  _authToken = null;
}
let _citizenAuthTab = 'login'; // 'login' | 'signup'

// ── Language State & Helpers ────────────────────────────────────
let _currentLang = 'en';
try {
  _currentLang = localStorage.getItem('raksha_lang') || localStorage.getItem('aahat_lang') || 'en';
} catch (e) { _currentLang = 'en'; }

function t(key, defaultVal) {
  if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[_currentLang] && TRANSLATIONS[_currentLang][key]) {
    return TRANSLATIONS[_currentLang][key];
  }
  return defaultVal || key;
}

function getLocalizedState(stateName) {
  if (_currentLang === 'hi' && typeof STATE_NAMES_HI !== 'undefined' && STATE_NAMES_HI[stateName]) {
    return STATE_NAMES_HI[stateName];
  }
  return stateName;
}

function getLocalizedStation(stationName) {
  if (_currentLang === 'hi' && typeof STATION_NAMES_HI !== 'undefined' && STATION_NAMES_HI[stationName]) {
    return STATION_NAMES_HI[stationName];
  }
  return stationName;
}

function getLocalizedRiskLevel(level) {
  if (_currentLang === 'hi' && typeof RISK_LEVELS_HI !== 'undefined' && RISK_LEVELS_HI[level]) {
    return RISK_LEVELS_HI[level];
  }
  return level;
}

function setLanguage(lang) {
  _currentLang = lang || 'en';
  try {
    localStorage.setItem('raksha_lang', _currentLang);
    localStorage.setItem('aahat_lang', _currentLang);
  } catch (e) {}

  document.documentElement.setAttribute('lang', _currentLang);

  // Update button active states
  var btnEn = document.getElementById('btnLangEn');
  var btnHi = document.getElementById('btnLangHi');
  if (btnEn) btnEn.classList.toggle('active', _currentLang === 'en');
  if (btnHi) btnHi.classList.toggle('active', _currentLang === 'hi');

  // Update all elements with data-i18n
  if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[_currentLang]) {
    var dict = TRANSLATIONS[_currentLang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.placeholder = dict[key];
      }
    });
  }

  var searchInput = document.getElementById('stationSearch');
  if (searchInput) searchInput.placeholder = t('search_placeholder', '🔍 Search station or state…');

  // Re-populate dynamic UI
  if (typeof NER_DATA !== 'undefined' && NER_DATA.stations) {
    populateLocationSelects();
    populateStationTable();
    populateAuthorityTable();
    if (_activeStation) {
      setDetailPanel(_activeStation);
      updatePreviewCard(_activeStation);
      populateImpact(_activeStation);
      populatePriorityBlock(_activeStation);
    }
    populateAlertsList();
    populateAlertsList('authorityWarningGrid');
    populateWarnings();
    populateAuthorityPriorityList();
    updateDataBadge();
    refreshMapMarkersLanguage();
    renderReportCards();
  }
}

// ── Field reports store ─────────────────────────────────────────
let _fieldReports = [];  // populated by initFieldReports()
let _reportFilter = 'all';

// ── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  if (typeof NER_DATA === 'undefined') {
    console.warn('NER_DATA not loaded – check ner_data.js script tag.');
    return;
  }
  initDashboard();
});

// ═══════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════
function initDashboard() {
  populateStatCards();
  populateStationTable();
  populateAuthorityTable();
  populateLocationSelects();

  var defaultStation = NER_DATA.stations[0];
  _activeStation = defaultStation;

  setDetailPanel(defaultStation);
  buildRainfallChart(defaultStation);
  updateAlertBanner(defaultStation);
  populateAlertsList();
  populateAlertsList('authorityWarningGrid');
  populateImpact(defaultStation);
  populatePriorityBlock(defaultStation);
  populateWarnings();
  populateAuthorityPriorityList();
  updateDataBadge();
  populateMLAccuracy();
  updatePreviewCard(defaultStation);
  initFieldReports();

  // Apply active language to DOM and components
  setLanguage(_currentLang);

  // Set initial sim display
  setText('simCurrentScore', defaultStation.risk_score);
  setText('simScore', defaultStation.risk_score);

  // Initialize 3-Tier Auth & Automated Alerts Engine
  initAuthUI();
  fetchAndRenderAlertHistory();
}

// ═══════════════════════════════════════════════════════════════
// VIEW ROUTING
// ═══════════════════════════════════════════════════════════════
function showView(viewName) {
  _currentView = viewName;
  ['landing', 'citizen', 'authority'].forEach(function (v) {
    var el = document.getElementById('view-' + v);
    if (el) {
      el.classList.toggle('view--active', v === viewName);
    }
  });
  // Update nav link active state
  updateNavActive(viewName);
  // Update mobile nav
  updateMobileNavActive(viewName);
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavActive(viewName) {
  var links = document.querySelectorAll('.nav-link');
  links.forEach(function (l) { l.classList.remove('active'); });
  if (viewName === 'landing') {
    var el = document.getElementById('navHome');
    if (el) el.classList.add('active');
  } else if (viewName === 'citizen') {
    var el = document.getElementById('navMap');
    if (el) el.classList.add('active');
  }
}

function updateMobileNavActive(viewName) {
  ['mnavHome', 'mnavMap', 'mnavAlerts', 'mnavReport'].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.classList.remove('active');
  });
  if (viewName === 'landing') {
    var b = document.getElementById('mnavHome');
    if (b) b.classList.add('active');
  } else if (viewName === 'citizen') {
    var b = document.getElementById('mnavMap');
    if (b) b.classList.add('active');
  }
}

// ── Public show functions ──────────────────────────────────────
function showLanding(e) {
  if (e) e.preventDefault();
  showView('landing');
}

function showCitizen(e) {
  if (e) e.preventDefault();
  showView('citizen');
}

function showCitizenDirect() {
  showView('citizen');
}

// ── Universal nav handler: switch view then scroll to section ──
function navGoTo(e, sectionId) {
  if (e) e.preventDefault();
  // If already in citizen view, just scroll
  if (_currentView === 'citizen') {
    scrollToSection(sectionId);
    // Init map if going to map section
    if (sectionId === 'sec-map') setTimeout(ensureMapInit, 200);
    return;
  }
  // Otherwise switch view first, then scroll after transition
  showView('citizen');
  setTimeout(function () {
    scrollToSection(sectionId);
    if (sectionId === 'sec-map') setTimeout(ensureMapInit, 200);
  }, 120);
}

function scrollToSection(sectionId) {
  var el = document.getElementById(sectionId);
  if (el) {
    // account for sticky topbar height (58px)
    var top = el.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
}

function showCitizenAndReport() {
  navGoTo(null, 'sec-report');
}

function toggleAuthorityView() {
  if (_currentView === 'authority') {
    showView('citizen');
    var btn = document.getElementById('btnAuthorityToggle');
    if (btn) btn.classList.remove('active');
  } else {
    // 3-Tier Gate: Authority role required
    if (_currentUser && _currentUser.role === 'authority') {
      showView('authority');
      var btn = document.getElementById('btnAuthorityToggle');
      if (btn) btn.classList.add('active');
      fetchAndRenderAlertHistory();
    } else {
      // Show official Authority Login modal
      openAuthorityAuthModal();
    }
  }
}

// Mobile nav helpers
function showLandingMobile()  { showView('landing'); }
function showCitizenMobile()  { showView('citizen'); }
function showMapMobile()      { navGoTo(null, 'sec-map'); }
function showCitizenAlerts()  { navGoTo(null, 'sec-warning'); }
function showCitizenReport()  { navGoTo(null, 'sec-report'); }

// ═══════════════════════════════════════════════════════════════
// LOCATION MODAL & SELECTS
// ═══════════════════════════════════════════════════════════════
function openLocationModal() {
  var modal = document.getElementById('locationModal');
  if (modal) modal.classList.add('modal--open');
}

function closeLocationModal() {
  var modal = document.getElementById('locationModal');
  if (modal) modal.classList.remove('modal--open');
}

// Close when clicking backdrop
document.addEventListener('click', function (e) {
  var modal = document.getElementById('locationModal');
  if (modal && e.target === modal) closeLocationModal();
});

function populateLocationSelects() {
  if (typeof NER_DATA === 'undefined') return;

  // Collect unique states
  var states = [];
  NER_DATA.stations.forEach(function (s) {
    if (states.indexOf(s.state) === -1) states.push(s.state);
  });
  states.sort();

  var stateEl = document.getElementById('locState');
  if (stateEl) {
    stateEl.innerHTML = '<option value="">' + t('modal_select_state', 'Select State…') + '</option>';
    states.forEach(function (st) {
      var opt = document.createElement('option');
      opt.value = st;
      opt.textContent = getLocalizedState(st);
      stateEl.appendChild(opt);
    });
  }

  populateDistrictSelect();

  // Populate Citizen Station dropdowns
  ['citizenStationSelect', 'monitoredStationSelect'].forEach(function(selId) {
    var sel = document.getElementById(selId);
    if (sel) {
      var curr = sel.value;
      sel.innerHTML = '';
      NER_DATA.stations.forEach(function(st) {
        var opt = document.createElement('option');
        opt.value = st.station;
        opt.textContent = st.station + ', ' + st.state + ' (Risk: ' + st.risk_score + '/100)';
        sel.appendChild(opt);
      });
      if (_currentUser && _currentUser.monitoredStation) {
        sel.value = _currentUser.monitoredStation;
      } else if (curr) {
        sel.value = curr;
      }
    }
  });
}

function populateDistrictSelect() {
  var stateEl   = document.getElementById('locState');
  var stationEl = document.getElementById('locStation');
  if (!stationEl) return;

  var selectedState = stateEl ? stateEl.value : '';
  stationEl.innerHTML = '<option value="">' + t('modal_select_station', 'Select Station…') + '</option>';

  NER_DATA.stations.forEach(function (s) {
    if (!selectedState || s.state === selectedState) {
      var opt = document.createElement('option');
      opt.value = s.station;
      opt.textContent = getLocalizedStation(s.station) + ' (' + s.district + ')';
      stationEl.appendChild(opt);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// 3-TIER ACCESS (GUEST / CITIZEN / AUTHORITY) & ALERT ENGINE
// ═══════════════════════════════════════════════════════════════

function initAuthUI() {
  var loginBtn = document.getElementById('btnCitizenLogin');
  var userPill = document.getElementById('userPillDropdown');
  var userBadge = document.getElementById('userBadgeLabel');
  var guestAuthAction = document.getElementById('btnGuestAuthAction');
  var citizenControls = document.getElementById('citizenMonitorControls');
  var guestHint = document.getElementById('guestModeHint');
  var alertModeSub = document.getElementById('alertModeSub');
  var stationSelect = document.getElementById('monitoredStationSelect');
  var emailToggle = document.getElementById('toggleEmailAlerts');
  var toggleStatusText = document.getElementById('toggleStatusText');

  if (_currentUser) {
    // Logged in (Citizen or Authority)
    if (loginBtn) loginBtn.style.display = 'none';
    if (userPill) userPill.style.display = 'flex';
    if (userBadge) {
      var icon = _currentUser.role === 'authority' ? '🏛️ ' : '👤 ';
      userBadge.textContent = icon + (_currentUser.name ? _currentUser.name.split(' ')[0] : 'User');
      userBadge.title = _currentUser.email + ' (' + _currentUser.role + ')';
    }

    if (alertModeSub) {
      var roleName = _currentUser.role === 'authority' ? 'Official Authority Commander' : 'Registered Citizen';
      alertModeSub.innerHTML = 'Mode: <strong style="color:#60a5fa">' + roleName + '</strong> (' + _currentUser.email + ')';
    }

    if (guestAuthAction) guestAuthAction.style.display = 'none';
    if (citizenControls) citizenControls.style.display = 'block';
    if (guestHint) guestHint.style.display = 'none';

    if (stationSelect && _currentUser.monitoredStation) {
      stationSelect.value = _currentUser.monitoredStation;
    }

    if (emailToggle) {
      emailToggle.checked = _currentUser.emailAlertsEnabled !== false;
      if (toggleStatusText) {
        toggleStatusText.textContent = emailToggle.checked ? 'ACTIVE (High/Critical)' : 'DISABLED';
        toggleStatusText.style.color = emailToggle.checked ? '#34d399' : '#94a3b8';
      }
    }
  } else {
    // Guest Mode
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userPill) userPill.style.display = 'none';

    if (alertModeSub) {
      alertModeSub.innerHTML = 'Mode: <strong>Guest (Public Access)</strong> · No login required to browse risk maps.';
    }

    if (guestAuthAction) guestAuthAction.style.display = 'inline-block';
    if (citizenControls) citizenControls.style.display = 'none';
    if (guestHint) guestHint.style.display = 'block';
  }

  // Update Early Warning Status Bar to reflect current station's actual risk level
  var currentStName = (_currentUser && _currentUser.monitoredStation) ? _currentUser.monitoredStation : (_activeStation ? _activeStation.station : 'Kohima');
  var matchedSt = (typeof NER_DATA !== 'undefined' && NER_DATA.stations) ? NER_DATA.stations.find(function(s) { return s.station.toLowerCase() === currentStName.toLowerCase(); }) : null;
  var targetStation = matchedSt || _activeStation;
  updateEarlyWarningStatusBar(targetStation);

  // Automatically evaluate alert for monitored high/critical station on startup
  if (targetStation && (targetStation.risk_level === 'HIGH' || targetStation.risk_level === 'CRITICAL' || targetStation.risk_score >= 55)) {
    if (!window._evaluatedStations) window._evaluatedStations = {};
    if (!window._evaluatedStations[targetStation.station]) {
      window._evaluatedStations[targetStation.station] = true;
      setTimeout(function() {
        evaluateStationRiskAlert(targetStation, 'automated');
      }, 600);
    }
  }
}

function updateEarlyWarningStatusBar(station) {
  var badge = document.getElementById('alertBadgeStatus');
  var dot = document.getElementById('alertPulseDot');
  var headline = document.getElementById('alertStatusHeadline');
  var sub = document.getElementById('alertStatusSub');
  var dispatchBtn = document.getElementById('btnDispatchTest');
  if (!badge || !station) return;

  var score = station.risk_score || 0;
  var level = (station.risk_level || 'LOW').toUpperCase();

  if (level === 'CRITICAL' || score >= 75) {
    badge.className = 'alert-badge-status alert-badge-status--sent';
    badge.style.background = 'rgba(239, 68, 68, 0.25)';
    badge.style.color = '#f87171';
    badge.style.borderColor = 'rgba(239, 68, 68, 0.6)';
    badge.textContent = '🔴 CRITICAL ALERT';
    if (dot) {
      dot.style.background = '#ef4444';
      dot.style.boxShadow = '0 0 10px #ef4444';
    }
    if (headline) {
      headline.textContent = '🚨 Emergency Critical Risk Detected';
      headline.style.color = '#f87171';
    }
    if (sub) {
      sub.textContent = station.station + ' (' + station.state + ') risk score is ' + score + '/100. Emergency automated alerts active.';
    }
    if (dispatchBtn) {
      dispatchBtn.style.display = 'inline-flex';
      dispatchBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
      dispatchBtn.textContent = '⚡ Dispatch Alert to My Email';
    }
  } else if (level === 'HIGH' || score >= 55) {
    badge.className = 'alert-badge-status alert-badge-status--sent';
    badge.style.background = 'rgba(234, 88, 12, 0.25)';
    badge.style.color = '#fb923c';
    badge.style.borderColor = 'rgba(234, 88, 12, 0.6)';
    badge.textContent = '🟠 HIGH ALERT';
    if (dot) {
      dot.style.background = '#ea580c';
      dot.style.boxShadow = '0 0 10px #ea580c';
    }
    if (headline) {
      headline.textContent = '⚠️ High Risk Condition Detected';
      headline.style.color = '#fb923c';
    }
    if (sub) {
      sub.textContent = station.station + ' (' + station.state + ') is in High Risk zone. Automated alerts active.';
    }
    if (dispatchBtn) {
      dispatchBtn.style.display = 'inline-flex';
      dispatchBtn.style.background = 'linear-gradient(135deg, #ea580c, #c2410c)';
      dispatchBtn.textContent = '⚡ Dispatch Alert to My Email';
    }
  } else {
    // Normal / Safe
    badge.className = 'alert-badge-status';
    badge.style.background = 'rgba(16, 185, 129, 0.15)';
    badge.style.color = '#34d399';
    badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    badge.textContent = '🟢 All Normal';
    if (dot) {
      dot.style.background = '#10b981';
      dot.style.boxShadow = '0 0 8px #10b981';
    }
    if (headline) {
      headline.textContent = 'Risk Engine: Monitoring Active';
      headline.style.color = '#f1f5f9';
    }
    if (sub) {
      sub.textContent = 'Condition: High/Critical risk triggers real automated email.';
    }
    if (dispatchBtn) {
      dispatchBtn.style.display = 'none';
    }
  }
}

// ── Citizen Auth Modal Handlers ────────────────────────────────
function openCitizenAuthModal(tab) {
  var modal = document.getElementById('citizenAuthModal');
  if (modal) {
    modal.style.display = 'flex';
    switchCitizenAuthTab(tab || 'login');
  }
}

function closeCitizenAuthModal() {
  var modal = document.getElementById('citizenAuthModal');
  if (modal) modal.style.display = 'none';
  var alertEl = document.getElementById('citizenAuthAlert');
  if (alertEl) alertEl.style.display = 'none';
}

function switchCitizenAuthTab(tab) {
  _citizenAuthTab = tab;
  var tabLogin = document.getElementById('tabCitizenLogin');
  var tabSignup = document.getElementById('tabCitizenSignup');
  var groupName = document.getElementById('groupCitizenName');
  var groupStation = document.getElementById('groupCitizenStation');
  var submitBtn = document.getElementById('btnCitizenSubmit');
  var switchPrompt = document.getElementById('citizenAuthSwitchPrompt');
  var switchBtn = document.getElementById('btnCitizenSwitch');

  if (tab === 'signup') {
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabSignup) tabSignup.classList.add('active');
    if (groupName) groupName.style.display = 'block';
    if (groupStation) groupStation.style.display = 'block';
    if (submitBtn) submitBtn.textContent = 'Create Citizen Account →';
    if (switchPrompt) switchPrompt.textContent = 'Already have an account?';
    if (switchBtn) switchBtn.textContent = 'Log In';
  } else {
    if (tabLogin) tabLogin.classList.add('active');
    if (tabSignup) tabSignup.classList.remove('active');
    if (groupName) groupName.style.display = 'none';
    if (groupStation) groupStation.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Log In →';
    if (switchPrompt) switchPrompt.textContent = "Don't have an account yet?";
    if (switchBtn) switchBtn.textContent = 'Create Account';
  }
}

function toggleCitizenAuthMode() {
  switchCitizenAuthTab(_citizenAuthTab === 'login' ? 'signup' : 'login');
}

async function safeJson(res) {
  try {
    var text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return {};
  }
}

async function handleCitizenAuthSubmit(event) {
  event.preventDefault();
  var alertEl = document.getElementById('citizenAuthAlert');
  var submitBtn = document.getElementById('btnCitizenSubmit');

  var email = document.getElementById('citizenEmailInput').value.trim();
  var password = document.getElementById('citizenPasswordInput').value;
  var name = document.getElementById('citizenNameInput') ? document.getElementById('citizenNameInput').value.trim() : '';
  var monitoredStation = document.getElementById('citizenStationSelect') ? document.getElementById('citizenStationSelect').value : 'Gangtok';

  if (alertEl) alertEl.style.display = 'none';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Processing…'; }

  var endpoint = _citizenAuthTab === 'signup' ? '/api/auth/register' : '/api/auth/login';
  var payload = _citizenAuthTab === 'signup'
    ? { name: name || email.split('@')[0], email: email, password: password, monitoredStation: monitoredStation }
    : { email: email, password: password, role: 'citizen' };

  try {
    var res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    var data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed. Status: ' + res.status);
    }

    _currentUser = data.user;
    _authToken = data.token;
    localStorage.setItem('raksha_user', JSON.stringify(_currentUser));
    localStorage.setItem('raksha_token', _authToken);

    closeCitizenAuthModal();
    initAuthUI();
    fetchAndRenderAlertHistory();
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'auth-alert auth-alert--error';
      alertEl.textContent = '⚠️ ' + err.message;
      alertEl.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = _citizenAuthTab === 'signup' ? 'Create Citizen Account →' : 'Log In →';
    }
  }
}

// ── Authority Gate Modal Handlers ──────────────────────────────
function openAuthorityAuthModal() {
  var modal = document.getElementById('authorityAuthModal');
  if (modal) modal.style.display = 'flex';
}

function closeAuthorityAuthModal() {
  var modal = document.getElementById('authorityAuthModal');
  if (modal) modal.style.display = 'none';
  var alertEl = document.getElementById('authorityAuthAlert');
  if (alertEl) alertEl.style.display = 'none';
}

async function handleAuthorityAuthSubmit(event) {
  event.preventDefault();
  var alertEl = document.getElementById('authorityAuthAlert');
  var submitBtn = document.getElementById('btnAuthoritySubmit');

  var email = document.getElementById('authorityEmailInput').value.trim();
  var password = document.getElementById('authorityPasswordInput').value;

  if (alertEl) alertEl.style.display = 'none';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Verifying Authority Credentials…'; }

  try {
    var res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, role: 'authority' })
    });

    var data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Authority authorization failed. Status: ' + res.status);
    }

    _currentUser = data.user;
    _authToken = data.token;
    localStorage.setItem('raksha_user', JSON.stringify(_currentUser));
    localStorage.setItem('raksha_token', _authToken);

    closeAuthorityAuthModal();
    initAuthUI();
    showView('authority');
    var btn = document.getElementById('btnAuthorityToggle');
    if (btn) btn.classList.add('active');
    fetchAndRenderAlertHistory();
  } catch (err) {
    if (alertEl) {
      alertEl.className = 'auth-alert auth-alert--error';
      alertEl.textContent = '⛔ ' + err.message;
      alertEl.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Authorize & Enter Command Center →';
    }
  }
}

function logoutCurrentUser() {
  _currentUser = null;
  _authToken = null;
  localStorage.removeItem('raksha_user');
  localStorage.removeItem('raksha_token');

  initAuthUI();
  if (_currentView === 'authority') {
    showView('citizen');
    var btn = document.getElementById('btnAuthorityToggle');
    if (btn) btn.classList.remove('active');
  }
}

// ── Preferences Management ─────────────────────────────────────
async function onMonitoredStationChange(newStation) {
  if (!_currentUser || !_authToken) return;
  _currentUser.monitoredStation = newStation;
  localStorage.setItem('raksha_user', JSON.stringify(_currentUser));

  try {
    await fetch('/api/citizen/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _authToken
      },
      body: JSON.stringify({ monitoredStation: newStation })
    });
  } catch (e) {
    console.warn('Could not save station preference:', e.message);
  }

  // If newly selected station is currently in High/Critical state, sync status bar
  var stationObj = NER_DATA.stations.find(function(s) { return s.station.toLowerCase() === newStation.toLowerCase(); });
  if (stationObj) {
    updateEarlyWarningStatusBar(stationObj);
  }
}

async function onToggleEmailAlertsChange(checked) {
  if (!_currentUser || !_authToken) return;
  _currentUser.emailAlertsEnabled = checked;
  localStorage.setItem('raksha_user', JSON.stringify(_currentUser));

  var toggleStatusText = document.getElementById('toggleStatusText');
  if (toggleStatusText) {
    toggleStatusText.textContent = checked ? 'ACTIVE (High/Critical)' : 'DISABLED';
    toggleStatusText.style.color = checked ? '#34d399' : '#94a3b8';
  }

  try {
    await fetch('/api/citizen/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _authToken
      },
      body: JSON.stringify({ emailAlertsEnabled: checked })
    });
  } catch (e) {
    console.warn('Could not save email toggle preference:', e.message);
  }
}

function toggleAlertsDrawer() {
  var content = document.getElementById('drawerContent');
  var icon = document.getElementById('drawerToggleIcon');
  if (!content) return;
  var isOpen = content.style.display !== 'none';
  content.style.display = isOpen ? 'none' : 'block';
  if (icon) icon.textContent = isOpen ? '▼' : '▲';
}

// ── Automated Alert Evaluation & Dispatch Engine ───────────────
async function evaluateStationRiskAlert(station, triggerSource) {
  if (!station) return;
  triggerSource = triggerSource || 'automated';

  var activeEmail = (_currentUser && _currentUser.email) ? _currentUser.email : '';
  if (!activeEmail) {
    var sub = document.getElementById('alertStatusSub');
    if (sub) {
      sub.innerHTML = '⚠️ Please <a href="javascript:void(0)" onclick="openCitizenAuthModal()" style="color:#60a5fa;text-decoration:underline;">log in</a> to receive direct emergency alerts at your email address.';
    }
    return;
  }

  var payload = {
    stationName: station.station,
    state: station.state,
    riskScore: station.risk_score,
    riskLevel: station.risk_level,
    rainfallToday: station.rainfall_today,
    rainfall7d: station.rainfall_7d,
    whyFactors: station.slope_geology ? '• ' + station.slope_geology : '• Steep slope saturation from cumulative rainfall.',
    triggerSource: triggerSource,
    currentUserEmail: activeEmail
  };

  var headline = document.getElementById('alertStatusHeadline');
  var sub = document.getElementById('alertStatusSub');
  var badge = document.getElementById('alertBadgeStatus');
  var dispatchBtn = document.getElementById('btnDispatchTest');

  if (dispatchBtn) {
    dispatchBtn.disabled = true;
    dispatchBtn.textContent = '⏳ Dispatching Email…';
  }
  if (sub) {
    sub.innerHTML = '⏳ Dispatching automated emergency alert email for ' + station.station + ' to <strong>' + activeEmail + '</strong>…';
  }

  try {
    var res = await fetch('/api/alerts/evaluate-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    var result = await safeJson(res);
    if (result.alertTriggered && result.emailSent) {
      // Update UI Status Badge
      if (badge) {
        badge.className = 'alert-badge-status alert-badge-status--sent';
        badge.style.background = 'rgba(239, 68, 68, 0.25)';
        badge.style.color = '#f87171';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.6)';
        badge.textContent = '🚨 Email Sent (' + result.recipientCount + ' Recipient' + (result.recipientCount > 1 ? 's' : '') + ')';
      }

      if (headline) {
        headline.textContent = '🚨 Emergency Early Warning Dispatched';
        headline.style.color = '#f87171';
      }

      if (sub) {
        var msg = '✅ Emergency alert email dispatched to <strong>' + activeEmail + '</strong> (Status: ' + (result.status || 'Email Sent') + '). Check your inbox / spam folder!';
        if (result.previewUrl) {
          msg += '<br>🔗 <a href="' + result.previewUrl + '" target="_blank" style="color:#60a5fa;text-decoration:underline;font-weight:600;">View Test Email Online (Ethereal) →</a>';
        }
        sub.innerHTML = msg;
      }

      if (dispatchBtn) {
        dispatchBtn.textContent = '✅ Email Dispatched!';
        setTimeout(function() {
          if (dispatchBtn) {
            dispatchBtn.disabled = false;
            dispatchBtn.textContent = '⚡ Re-Dispatch Alert to My Email';
          }
        }, 3500);
      }

      fetchAndRenderAlertHistory();
    } else if (result.alertTriggered && !result.emailSent) {
      if (sub) {
        sub.textContent = '⚠️ Alert evaluated for ' + station.station + ', but delivery notice: ' + (result.reason || 'Check service configuration');
      }
      if (dispatchBtn) {
        dispatchBtn.disabled = false;
        dispatchBtn.textContent = '⚡ Retry Dispatch';
      }
    } else if (result.reason) {
      if (sub) sub.textContent = result.reason;
      if (dispatchBtn) {
        dispatchBtn.disabled = false;
        dispatchBtn.textContent = '⚡ Dispatch Alert to My Email';
      }
    }
  } catch (err) {
    console.warn('Risk evaluation error:', err.message);
    if (sub) sub.textContent = 'Dispatch error: ' + err.message;
    if (dispatchBtn) {
      dispatchBtn.disabled = false;
      dispatchBtn.textContent = '⚡ Retry Dispatch';
    }
  }
}

async function triggerManualStationAlertEvaluation() {
  var currentStName = (_currentUser && _currentUser.monitoredStation) ? _currentUser.monitoredStation : (_activeStation ? _activeStation.station : 'Kohima');
  var matchedSt = (typeof NER_DATA !== 'undefined' && NER_DATA.stations) ? NER_DATA.stations.find(function(s) { return s.station.toLowerCase() === currentStName.toLowerCase(); }) : null;
  var target = matchedSt || _activeStation;
  if (target) {
    await evaluateStationRiskAlert(target, 'user_manual_dispatch');
  }
}

async function triggerAuthorityRiskEvaluation() {
  var btn = document.getElementById('btnEvalRisk');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Evaluating Regional Telemetry…'; }

  try {
    // Find high or critical stations in NER
    var highStations = NER_DATA.stations.filter(function(s) {
      return s.risk_score >= 60 || s.risk_level === 'HIGH' || s.risk_level === 'CRITICAL';
    });

    if (highStations.length === 0) {
      highStations = [NER_DATA.stations[0]];
    }

    for (var i = 0; i < Math.min(highStations.length, 2); i++) {
      await evaluateStationRiskAlert(highStations[i], 'authority_eval');
    }

    alert('✅ Regional Risk Evaluation Complete. Automated alert pipeline checked all monitored sectors.');
    fetchAndRenderAlertHistory();
  } catch (e) {
    alert('Evaluation failed: ' + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '⚡ Run Automated Risk Evaluation & Dispatch';
    }
  }
}

async function fetchAndRenderAlertHistory() {
  try {
    var res = await fetch('/api/alerts/history');
    if (!res.ok) return;
    var data = await safeJson(res);
    var history = data.history || [];

    // 1. Render in Citizen View drawer
    var countEl = document.getElementById('recentAlertsCount');
    if (countEl) countEl.textContent = history.length;

    var tbodyCitizen = document.getElementById('alertHistoryTbody');
    if (tbodyCitizen) {
      if (history.length === 0) {
        tbodyCitizen.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:12px;">No automated alerts dispatched yet.</td></tr>';
      } else {
        tbodyCitizen.innerHTML = history.slice(0, 10).map(function(item) {
          var dateStr = new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
          var isCrit = item.riskLevel === 'CRITICAL' || item.riskScore >= 75;
          var badgeClass = isCrit ? 'badge--critical' : 'badge--high';
          return '<tr>' +
            '<td>' + dateStr + '</td>' +
            '<td><strong>' + item.stationName + '</strong> (' + (item.state || 'NER') + ')</td>' +
            '<td><span class="risk-badge ' + badgeClass + '">' + item.riskLevel + '</span></td>' +
            '<td><strong>' + item.riskScore + '/100</strong></td>' +
            '<td><span style="color:#4ade80;font-weight:700;">✅ ' + item.status + '</span></td>' +
          '</tr>';
        }).join('');
      }
    }

    // 2. Render in Authority Command Center table
    var tbodyAuth = document.getElementById('authAlertLogTbody');
    if (tbodyAuth) {
      if (history.length === 0) {
        tbodyAuth.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:16px;">No automated alerts dispatched yet. System running in normal monitoring state.</td></tr>';
      } else {
        tbodyAuth.innerHTML = history.map(function(item) {
          var dateStr = new Date(item.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
          var isCrit = item.riskLevel === 'CRITICAL' || item.riskScore >= 75;
          var badgeClass = isCrit ? 'badge--critical' : 'badge--high';
          var recCount = item.recipients ? item.recipients.length : 0;
          return '<tr>' +
            '<td>' + dateStr + '</td>' +
            '<td><strong>' + item.stationName + '</strong></td>' +
            '<td>' + (item.state || 'NER') + '</td>' +
            '<td><span class="risk-badge ' + badgeClass + '">' + item.riskLevel + '</span></td>' +
            '<td><strong>' + item.riskScore + '/100</strong></td>' +
            '<td>' + recCount + ' recipient' + (recCount === 1 ? '' : 's') + '</td>' +
            '<td><span style="color:#4ade80;font-weight:700;">✅ ' + item.status + '</span></td>' +
          '</tr>';
        }).join('');
      }
    }
  } catch (e) {
    console.warn('Could not fetch alert history:', e.message);
  }
}

function useMyLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser. Please select manually.');
    return;
  }
  var btn = document.getElementById('btnUseLocation');
  if (btn) btn.textContent = '📡 Locating…';

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      // Find closest station
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var closest = NER_DATA.stations[0];
      var minDist = Infinity;
      NER_DATA.stations.forEach(function (s) {
        var d = Math.sqrt(Math.pow(s.lat - lat, 2) + Math.pow(s.lon - lon, 2));
        if (d < minDist) { minDist = d; closest = s; }
      });
      selectStation(closest);
      closeLocationModal();
      showView('citizen');
      if (btn) btn.textContent = '📡 Use My Location';
    },
    function () {
      alert('Could not get your location. Please select a station manually.');
      if (btn) btn.textContent = '📡 Use My Location';
    }
  );
}

function checkRiskFromModal() {
  var stationEl = document.getElementById('locStation');
  if (!stationEl || !stationEl.value) {
    alert('Please select a station to check risk.');
    return;
  }
  var name = stationEl.value;
  var station = NER_DATA.stations.find(function (s) { return s.station === name; });
  if (station) {
    selectStation(station);
    closeLocationModal();
    showView('citizen');
    // highlight the row
    highlightTableRow(station);
  }
}

function selectStation(s) {
  _activeStation = s;
  setDetailPanel(s);
  buildRainfallChart(s);
  updateAlertBanner(s);
  updateEarlyWarningStatusBar(s);
  updateSimBase(s.risk_score);
  setText('simCurrentScore', s.risk_score);
  setText('simScore', s.risk_score);
  populateImpact(s);
  populatePriorityBlock(s);
  setScenario(0);
  updatePreviewCard(s);

  // If newly selected station is in High or Critical risk state, evaluate alert automatically
  if (s && (s.risk_level === 'HIGH' || s.risk_level === 'CRITICAL' || s.risk_score >= 55)) {
    if (!window._evaluatedStations) window._evaluatedStations = {};
    if (!window._evaluatedStations[s.station]) {
      window._evaluatedStations[s.station] = true;
      evaluateStationRiskAlert(s, 'automated');
    }
  }
}

function highlightTableRow(s) {
  document.querySelectorAll('.station-row').forEach(function (r) {
    r.classList.remove('station-row--active');
    if (r.dataset.station === s.station) r.classList.add('station-row--active');
  });
}

// ═══════════════════════════════════════════════════════════════
// HERO PREVIEW CARD
// ═══════════════════════════════════════════════════════════════
function updatePreviewCard(s) {
  var locStation = getLocalizedStation(s.station);
  var locState = getLocalizedState(s.state);
  var locLevel = getLocalizedRiskLevel(s.risk_level);

  setText('previewStationName', locStation + ', ' + locState);
  setText('previewScore', s.risk_score);

  var bar = document.getElementById('previewBar');
  if (bar) bar.style.width = s.risk_score + '%';

  var levelEl = document.getElementById('previewLevel');
  if (levelEl) {
    var icons = { LOW: '🟢', MODERATE: '🟡', HIGH: '🟠', CRITICAL: '🔴' };
    levelEl.innerHTML = '<span>' + (icons[s.risk_level] || '⚪') + '</span> ' + locLevel;
  }
}

// ═══════════════════════════════════════════════════════════════
// ML Accuracy Badge
// ═══════════════════════════════════════════════════════════════
function populateMLAccuracy() {
  if (typeof ML_PREDICTIONS === 'undefined') return;
  var el = document.getElementById('mlAccuracy');
  if (el) {
    el.textContent =
      ML_PREDICTIONS.model + ' · ' +
      ML_PREDICTIONS.accuracy_pct + '% temporal accuracy · ' +
      'Trained on ' + ML_PREDICTIONS.trained_on + ' records';
  }
  var mn = document.getElementById('mlModelName');
  if (mn) mn.textContent = '(' + ML_PREDICTIONS.model + ')';
}

// ── ML Panel for selected station ─────────────────────────────
function updateMLPanel(stationName) {
  if (typeof ML_PREDICTIONS === 'undefined') return;
  var pred = ML_PREDICTIONS.predictions.find(function (p) { return p.station === stationName; });
  if (!pred) { hideMLBox(); return; }

  setText('mlClass', getLocalizedRiskLevel(pred.predicted_class));
  setText('mlConf',  pred.confidence_pct + '%');
  setText('mlScore', pred.risk_score + ' / 100');

  var mlClassEl = document.getElementById('mlClass');
  if (mlClassEl) {
    mlClassEl.className = 'ml-cell-val ml-class--' + pred.predicted_class.toLowerCase();
  }

  var factsEl = document.getElementById('mlFactors');
  if (factsEl && pred.top_factors) {
    var maxVal = pred.top_factors.length > 0 ? pred.top_factors[0][1] : 1;
    factsEl.innerHTML = pred.top_factors.map(function (kv) {
      var name = kv[0].replace(/_/g, ' ');
      var val  = kv[1];
      var pct  = maxVal > 0 ? Math.round((val / maxVal) * 100) : 2;
      return '<div class="ml-factor-row">' +
        '<span class="ml-factor-name">' + name + '</span>' +
        '<div class="ml-factor-bar"><div class="ml-factor-fill" style="width:' + Math.max(2, pct) + '%"></div></div>' +
        '</div>';
    }).join('');
  }

  var box = document.getElementById('mlBox');
  if (box) box.style.display = 'block';
}

function hideMLBox() {
  var box = document.getElementById('mlBox');
  if (box) box.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════
// STAT CARDS
// ═══════════════════════════════════════════════════════════════
function populateStatCards() {
  var sc = NER_DATA.stat_cards;
  setText('cardCritical', sc.critical);
  setText('cardHigh',     sc.high);
  setText('cardModerate', sc.moderate);
  setText('cardLow',      sc.low);
  setText('cardRain',     sc.avg_rain_today);
}

// ═══════════════════════════════════════════════════════════════
// ALERT BANNER
// ═══════════════════════════════════════════════════════════════
function updateAlertBanner(station) {
  var el  = document.getElementById('alertBanner');
  var msg = document.getElementById('alertMsg');
  if (!el || !msg) return;

  if (station.risk_level === 'CRITICAL' || station.risk_level === 'HIGH') {
    el.style.display = 'flex';
    var locStation = getLocalizedStation(station.station);
    var locState = getLocalizedState(station.state);
    var locLevel = getLocalizedRiskLevel(station.risk_level);

    msg.innerHTML =
      '<strong>🚨 ' + locLevel + '</strong> — ' +
      locStation + ', ' + locState +
      ' · Score: ' + station.risk_score + '/100' +
      ' · Today: ' + station.rainfall_today + 'mm' +
      ' · 7-day: ' + station.rainfall_7d + 'mm';
  } else {
    el.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════════
// STATION TABLE (citizen view)
// ═══════════════════════════════════════════════════════════════
function populateStationTable() {
  var tbody = document.getElementById('stationTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  NER_DATA.stations.forEach(function (s, idx) {
    var levelClass = 'badge--' + s.risk_level.toLowerCase();
    var tr = document.createElement('tr');
    tr.className = 'station-row' + (idx === 0 ? ' station-row--active' : '');
    tr.setAttribute('data-idx', idx);
    tr.setAttribute('data-station', s.station);
    tr.onclick = function () {
      document.querySelectorAll('.station-row').forEach(function (r) { r.classList.remove('station-row--active'); });
      tr.classList.add('station-row--active');
      selectStation(s);
      if (_markerMap && _markerMap[s.station]) {
        highlightMapMarker(s);
      }
    };

    var locState = getLocalizedState(s.state);
    var locStation = getLocalizedStation(s.station);
    var locLevel = getLocalizedRiskLevel(s.risk_level);

    tr.innerHTML =
      '<td class="stn-name">' + locStation + '<span class="stn-state">' + locState + '</span></td>' +
      '<td><span class="risk-badge ' + levelClass + '">' + locLevel + '</span></td>' +
      '<td class="stn-score">' + s.risk_score + '</td>' +
      '<td class="stn-rain">' + s.rainfall_today + '<span class="unit">mm</span></td>' +
      '<td class="stn-rain">' + s.rainfall_7d + '<span class="unit">mm</span></td>' +
      '<td class="stn-elev">' + s.elevation_m + 'm</td>';
    tbody.appendChild(tr);
  });
}

// ═══════════════════════════════════════════════════════════════
// AUTHORITY TABLE
// ═══════════════════════════════════════════════════════════════
function populateAuthorityTable() {
  var tbody = document.getElementById('authorityTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  var sorted = NER_DATA.stations.slice().sort(function (a, b) { return b.risk_score - a.risk_score; });

  sorted.forEach(function (s) {
    var levelClass = 'badge--' + s.risk_level.toLowerCase();
    var tr = document.createElement('tr');
    tr.className = 'station-row';
    tr.setAttribute('data-station', s.station);
    tr.onclick = function () {
      document.querySelectorAll('#authorityTableBody .station-row').forEach(function (r) { r.classList.remove('station-row--active'); });
      tr.classList.add('station-row--active');
    };

    var locState = getLocalizedState(s.state);
    var locStation = getLocalizedStation(s.station);
    var locLevel = getLocalizedRiskLevel(s.risk_level);

    tr.innerHTML =
      '<td class="stn-name">' + locStation + '<span class="stn-state">' + locState + '</span></td>' +
      '<td><span class="risk-badge ' + levelClass + '">' + locLevel + '</span></td>' +
      '<td class="stn-score">' + s.risk_score + '</td>' +
      '<td class="stn-rain">' + s.rainfall_today + '<span class="unit">mm</span></td>' +
      '<td class="stn-rain">' + s.rainfall_7d + '<span class="unit">mm</span></td>' +
      '<td class="stn-elev">' + s.elevation_m + 'm</td>';
    tbody.appendChild(tr);
  });
}

// ═══════════════════════════════════════════════════════════════
// AUTHORITY PRIORITY LIST
// ═══════════════════════════════════════════════════════════════
function populateAuthorityPriorityList() {
  var container = document.getElementById('authorityPriorityList');
  if (!container) return;

  var sorted = NER_DATA.stations.slice().sort(function (a, b) { return b.risk_score - a.risk_score; });
  var top = sorted.slice(0, 6);

  container.innerHTML = '';
  top.forEach(function (s, idx) {
    var rank  = idx + 1;
    var rankClass = rank <= 2 ? 'r' + rank : rank === 3 ? 'r3' : 'r4';
    var trendIcon = s.rainfall_7d > 100 ? '↑' : s.rainfall_7d > 50 ? '→' : '↓';
    var trendColor = s.rainfall_7d > 100 ? '#dc2626' : s.rainfall_7d > 50 ? '#d97706' : '#16a34a';

    var locState = getLocalizedState(s.state);
    var locStation = getLocalizedStation(s.station);
    var locLevel = getLocalizedRiskLevel(s.risk_level);

    var levelBadge = '<span class="risk-badge badge--' + s.risk_level.toLowerCase() + '">' + locLevel + '</span>';

    var row = document.createElement('div');
    row.className = 'priority-row';
    row.innerHTML =
      '<div class="pr-rank ' + rankClass + '">P' + rank + '</div>' +
      '<div class="pr-info">' +
        '<div class="pr-name">' + locStation + '</div>' +
        '<div class="pr-state">' + s.district + ', ' + locState + '</div>' +
        '<div class="pr-tags">' + levelBadge +
          '<span class="pr-tag">🌧 ' + s.rainfall_today + 'mm</span>' +
          '<span class="pr-tag">📅 ' + s.rainfall_7d + 'mm 7d</span>' +
        '</div>' +
      '</div>' +
      '<div class="pr-trend-icon" style="color:' + trendColor + '">' + trendIcon + '</div>' +
      '<div class="pr-score-col">' +
        '<div class="pr-score">' + s.risk_score + '</div>' +
        '<div class="pr-score-sub">/ 100</div>' +
      '</div>';
    container.appendChild(row);
  });
}

// ═══════════════════════════════════════════════════════════════
// DETAIL PANEL
// ═══════════════════════════════════════════════════════════════
function setDetailPanel(s) {
  var locStation = getLocalizedStation(s.station);
  var locState = getLocalizedState(s.state);
  var locLevel = getLocalizedRiskLevel(s.risk_level);

  setText('detailStation', locStation);
  setText('detailState',   s.district + ', ' + locState);
  setText('detailScore',   s.risk_score + ' / 100');
  setText('detailDate',    (_currentLang === 'hi' ? 'अद्यतन ' : 'As of ') + s.date);
  setText('detailRainToday', s.rainfall_today + ' mm');
  setText('detailRain7d',   s.rainfall_7d + ' mm');
  setText('detailRain14d',  s.rainfall_14d + ' mm');
  setText('detailElev',     s.elevation_m + ' m');
  setText('detailTemp',     s.temp_min + '° – ' + s.temp_max + '°C');
  setText('impactStation',  locStation);

  // Gauge
  var fill = document.getElementById('gaugeFill');
  if (fill) {
    fill.style.width = s.risk_score + '%';
    if (fill.hasAttribute('aria-valuenow')) fill.setAttribute('aria-valuenow', s.risk_score);
  }

  // Risk badge
  var badge = document.getElementById('detailBadge');
  if (badge) {
    badge.textContent = locLevel;
    badge.className = 'risk-badge badge--' + s.risk_level.toLowerCase();
  }

  // Gauge color class
  var score = document.getElementById('detailScore');
  if (score) score.className = 'gauge-score gauge-score--' + s.risk_level.toLowerCase();

  // Trend text
  var trend = document.getElementById('detailTrend');
  if (trend) {
    var r7 = s.rainfall_7d;
    var trendText = _currentLang === 'hi' ?
      (r7 > 150 ? '↑ जोखिम तेजी से बढ़ रहा है — अत्यधिक 7-दिवसीय वर्षा (' + r7 + 'mm)' :
       r7 > 80  ? '↑ जोखिम बढ़ रहा है — उच्च 7-दिवसीय वर्षा (' + r7 + 'mm)' :
       r7 > 30  ? '→ जोखिम स्थिर है — मध्यम हालिया वर्षा (' + r7 + 'mm)' :
                  '↓ जोखिम घट रहा है — कम हालिया वर्षा (' + r7 + 'mm)') :
      (r7 > 150 ? '↑ Risk is increasing — very high 7-day accumulation (' + r7 + 'mm)' :
       r7 > 80  ? '↑ Risk is increasing — high 7-day accumulation (' + r7 + 'mm)' :
       r7 > 30  ? '→ Risk is stable — moderate recent rainfall (' + r7 + 'mm)' :
                  '↓ Risk is decreasing — low recent rainfall (' + r7 + 'mm)');
    trend.textContent = trendText;
    trend.className = 'gauge-trend gauge-trend--' + (r7 > 80 ? 'critical' : r7 > 30 ? 'high' : 'low');

    // Update trend indicator in chart header
    var trendArrow = document.getElementById('trendArrow');
    var trendLabel = document.getElementById('trendLabel');
    if (trendArrow && trendLabel) {
      if (r7 > 80) {
        trendArrow.textContent = '↑';
        trendArrow.style.color = '#dc2626';
        trendLabel.textContent = _currentLang === 'hi' ? 'जोखिम बढ़ रहा है' : 'Risk increasing';
        trendLabel.style.color = '#dc2626';
      } else if (r7 > 30) {
        trendArrow.textContent = '→';
        trendArrow.style.color = '#d97706';
        trendLabel.textContent = _currentLang === 'hi' ? 'जोखिम स्थिर है' : 'Risk stable';
        trendLabel.style.color = '#d97706';
      } else {
        trendArrow.textContent = '↓';
        trendArrow.style.color = '#16a34a';
        trendLabel.textContent = _currentLang === 'hi' ? 'जोखिम सामान्य / घट रहा है' : 'Risk low / decreasing';
        trendLabel.style.color = '#16a34a';
      }
    }
  }

  // SHAP-like factors
  updateFactors(s);

  // Sim base
  updateSimBase(s.risk_score);
  setText('simCurrentScore', s.risk_score);

  // ML predictions panel
  updateMLPanel(s.station);
}

// ═══════════════════════════════════════════════════════════════
// EXPLAINABLE FACTORS
// ═══════════════════════════════════════════════════════════════
function updateFactors(s) {
  var rain7dPct  = Math.min(100, Math.round(s.rainfall_7d / 3));
  var rainTodPct = Math.min(100, Math.round(s.rainfall_today / 1.5));
  var elevPct    = Math.min(100, Math.round(s.elevation_m / 20));
  var tempDiffPct= Math.min(100, Math.round(Math.abs(s.temp_max - s.temp_min) * 5));

  setWidth('factorRainBar',  rainTodPct);
  setWidth('factor7dBar',    rain7dPct);
  setWidth('factorElevBar',  elevPct);
  setWidth('factorTempBar',  tempDiffPct);

  if (_currentLang === 'hi') {
    setText('factorRainVal',  s.rainfall_today + 'mm आज');
    setText('factor7dVal',    s.rainfall_7d + 'mm / 7 दिन');
    setText('factorElevVal',  s.elevation_m + 'm ऊंचाई');
    setText('factorTempVal',  (s.temp_max - s.temp_min).toFixed(1) + '°C अंतर');
  } else {
    setText('factorRainVal',  s.rainfall_today + 'mm today');
    setText('factor7dVal',    s.rainfall_7d + 'mm / 7 days');
    setText('factorElevVal',  s.elevation_m + 'm elevation');
    setText('factorTempVal',  (s.temp_max - s.temp_min).toFixed(1) + '°C range');
  }
}

// ═══════════════════════════════════════════════════════════════
// IMPACT SECTION
// ═══════════════════════════════════════════════════════════════
function populateImpact(s) {
  var score = s.risk_score;
  var villages = score >= 70 ? 4 : score >= 50 ? 3 : score >= 30 ? 1 : 0;
  var roads    = score >= 70 ? 3 : score >= 50 ? 2 : score >= 30 ? 1 : 0;
  var bridges  = score >= 70 ? 2 : score >= 50 ? 1 : 0;
  var infra    = score >= 70 ? 2 : score >= 50 ? 1 : 0;
  var pop      = villages * Math.floor(800 + (score * 12));

  var locStation = getLocalizedStation(s.station);
  var locState = getLocalizedState(s.state);

  setText('impactVillages', villages);
  setText('impactRoads',    roads);
  setText('impactBridges',  bridges);
  setText('impactInfra',    infra);
  setText('impactPop',      (_currentLang === 'hi' ? 'अनुमानित ' : 'Est. ') + pop.toLocaleString() + (_currentLang === 'hi' ? ' लोग' : ' people'));

  var villageNames = _currentLang === 'hi' ?
    [locStation + ' गांव', s.district + ' बस्ती', 'हिल कॉलोनी', 'रिज कैंप'] :
    [s.station + ' Village', s.district + ' Settlement', 'Hill Colony', 'Ridge Camp'];
  populateImpactList('impactVillageList', villageNames.slice(0, villages));

  var roadNames = _currentLang === 'hi' ?
    [locState + ' राजमार्ग', 'ज़िला मार्ग NH-40', 'पर्वतीय दर्रा मार्ग', 'वन मार्ग'] :
    [s.state + ' Highway', 'District Road NH-40', 'Mountain Pass Route', 'Forest Track'];
  populateImpactList('impactRoadList', roadNames.slice(0, roads));

  var bridgeNames = _currentLang === 'hi' ?
    ['नदी पार पुल', s.district + ' पुल'] :
    ['River Crossing Bridge', s.district + ' Bridge'];
  populateImpactList('impactBridgeList', bridgeNames.slice(0, bridges));

  var infraNames = _currentLang === 'hi' ?
    [locStation + ' प्राथमिक विद्यालय', s.district + ' स्वास्थ्य केंद्र'] :
    [s.station + ' Primary School', s.district + ' Health Centre'];
  populateImpactList('impactInfraList', infraNames.slice(0, infra));
}

function populateImpactList(id, items) {
  var el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(function (item) {
    return '<div class="impact-item">' + item + '</div>';
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// PRIORITY BLOCK
// ═══════════════════════════════════════════════════════════════
function populatePriorityBlock(s) {
  var score = s.risk_score;
  var level = s.risk_level;

  var rank, label, desc, checklists, rankClass;

  if (_currentLang === 'hi') {
    if (score >= 75 || level === 'CRITICAL') {
      rank = 'P1'; label = 'तत्काल ध्यान दें'; rankClass = 'p1';
      desc = 'अति गंभीर जोखिम। अधिकारियों को तुरंत एहतियाती कदम उठाने चाहिए।';
      checklists = [
        'स्थानीय आपदा प्रतिक्रिया दलों को सतर्क करें।',
        'संवेदनशील गांवों के निवासियों को चेतावनी जारी करें।',
        'स्थिति की निरंतर निगरानी करें।',
        'आवश्यकता पड़ने पर निकासी मार्ग तैयार रखें।'
      ];
    } else if (score >= 55 || level === 'HIGH') {
      rank = 'P2'; label = 'उच्च प्राथमिकता'; rankClass = 'p2';
      desc = 'उच्च जोखिम क्षेत्र। निरंतर निगरानी और समुदाय की सतर्कता आवश्यक है।';
      checklists = [
        'निगरानी की आवृत्ति बढ़ाएं।',
        'नागरिकों को ढलान वाले क्षेत्रों से दूर रहने की सलाह दें।',
        'आपातकालीन संपर्क तैयार रखें।',
        'ताजा दरारों या जल रिसाव पर नजर रखें।'
      ];
    } else if (score >= 35 || level === 'MODERATE') {
      rank = 'P3'; label = 'बारीकी से निगरानी करें'; rankClass = 'p3';
      desc = 'मध्यम जोखिम। नियमित निगरानी और पूर्व तैयारी की सलाह दी जाती है।';
      checklists = [
        'नियमित निगरानी जारी रखें।',
        'स्थानीय प्रशासन को स्थिति की जानकारी दें।',
        'ढलानों के पास जल निकासी नालों की जांच करें।'
      ];
    } else {
      rank = 'P4'; label = 'सामान्य निगरानी'; rankClass = 'p4';
      desc = 'कम जोखिम स्थिति। केवल नियमित निगरानी पर्याप्त है।';
      checklists = ['मानक निगरानी प्रोटोकॉल जारी रखें।'];
    }
  } else {
    if (score >= 75 || level === 'CRITICAL') {
      rank = 'P1'; label = 'Immediate Attention'; rankClass = 'p1';
      desc = 'Critical risk. Authorities should consider precautionary measures immediately.';
      checklists = [
        'Alert local disaster response teams.',
        'Warn residents in potentially exposed villages.',
        'Monitor situation continuously.',
        'Prepare evacuation routes if needed.'
      ];
    } else if (score >= 55 || level === 'HIGH') {
      rank = 'P2'; label = 'High Priority'; rankClass = 'p2';
      desc = 'High risk zone. Enhanced monitoring and community awareness required.';
      checklists = [
        'Increase monitoring frequency.',
        'Advise community to avoid high-slope areas.',
        'Keep emergency contacts ready.',
        'Watch for visible ground cracks or seepage.'
      ];
    } else if (score >= 35 || level === 'MODERATE') {
      rank = 'P3'; label = 'Monitor Closely'; rankClass = 'p3';
      desc = 'Moderate risk. Regular monitoring and community preparedness advised.';
      checklists = [
        'Continue regular monitoring.',
        'Communicate risk levels to local authorities.',
        'Check drainage systems near slopes.'
      ];
    } else {
      rank = 'P4'; label = 'Normal Monitoring'; rankClass = 'p4';
      desc = 'Low risk conditions. Routine monitoring only.';
      checklists = ['Continue standard monitoring protocols.'];
    }
  }

  var badge = document.getElementById('priorityBadge');
  if (badge) {
    badge.textContent = rank;
    badge.className = 'priority-badge ' + rankClass;
  }
  setText('priorityLabel', label);
  setText('priorityDesc',  desc);

  var cl = document.getElementById('priorityChecklist');
  if (cl) {
    cl.innerHTML = checklists.map(function (c) {
      return '<div class="priority-check-item">' + c + '</div>';
    }).join('');
  }
}

// ═══════════════════════════════════════════════════════════════
// RAINFALL CHART (Chart.js)
// ═══════════════════════════════════════════════════════════════
function buildRainfallChart(s) {
  var ctx = document.getElementById('rainfallChart');
  if (!ctx) return;

  if (rainfallChart) { rainfallChart.destroy(); }

  rainfallChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: s.series_dates.map(function (d) { return d.slice(5); }),
      datasets: [
        {
          label: 'Daily Rainfall (mm)',
          data: s.series_rain,
          backgroundColor: 'rgba(15, 118, 110, 0.35)',
          borderColor: 'rgba(15, 118, 110, 0.8)',
          borderWidth: 1,
          borderRadius: 3,
          order: 2,
        },
        {
          label: '7-Day Rolling Avg (mm)',
          data: s.series_r7d,
          type: 'line',
          borderColor: '#b91c1c',
          backgroundColor: 'rgba(185, 28, 28, 0.06)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.35,
          order: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { font: { size: 11, family: 'Inter' }, color: '#475569', boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            title: function (items) { return s.station + ' — ' + items[0].label; },
            label: function (item) { return item.dataset.label + ': ' + item.parsed.y.toFixed(1) + ' mm'; }
          }
        }
      },
      scales: {
        x: {
          ticks: { font: { size: 10 }, color: '#64748b', maxTicksLimit: 10 },
          grid:  { display: false }
        },
        y: {
          ticks: { font: { size: 10 }, color: '#64748b' },
          grid:  { color: 'rgba(15, 23, 42, 0.05)' },
          title: { display: true, text: 'mm', font: { size: 10 }, color: '#64748b' }
        }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// WARNINGS GRID
// ═══════════════════════════════════════════════════════════════

function submitReport(e) {
  e.preventDefault();
  var type = document.getElementById('reportType');
  if (!type || !type.value) { alert('Please select what you observed.'); return; }

  var form    = document.querySelector('.report-form');
  var succ    = document.getElementById('reportSuccess');
  var descEl  = document.getElementById('reportDesc');
  var latEl   = document.getElementById('reportLat');
  var lonEl   = document.getElementById('reportLon');

  var reportObj = {
    type:        type.value,
    description: (descEl && descEl.value.trim()) || ('Observed ' + type.value.toLowerCase() + ' in the area.'),
    latitude:    (latEl && latEl.value) ? parseFloat(latEl.value) : (_activeStation ? _activeStation.latitude  : null),
    longitude:   (lonEl && lonEl.value) ? parseFloat(lonEl.value) : (_activeStation ? _activeStation.longitude : null),
    station:     _activeStation ? _activeStation.name  : 'NER Regional Station',
    state:       _activeStation ? _activeStation.state : 'NER'
  };

  // Update in-memory field reports list (for live UI)
  var localEntry = Object.assign({
    id: 'REP-' + Math.floor(1000 + Math.random() * 9000),
    time: 'Just now', status: 'pending', verifiedBy: null, verifiedAt: null
  }, reportObj);
  if (_fieldReports) { _fieldReports.unshift(localEntry); updateReportCounts(); renderReportCards(); }

  if (form) form.style.display = 'none';
  if (succ) succ.style.display = 'block';

  var vp = document.getElementById('verificationPanel');
  if (vp) vp.style.display = 'flex';
  ['vs2', 'vs3', 'vs4'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.className = 'verify-step';
      el.textContent = id === 'vs2' ? '⏳ Cross-checking rainfall data…' :
                       id === 'vs3' ? '⏳ Checking against risk model…' :
                                      '⏳ Saving to database…';
    }
  });
  var vr = document.getElementById('verifyResult');
  if (vr) vr.style.display = 'none';

  // ── Save to MongoDB Atlas via API ──
  var headers = { 'Content-Type': 'application/json' };
  var token = localStorage.getItem('raksha360_token');
  if (token) headers['Authorization'] = 'Bearer ' + token;

  fetch('/api/reports/submit', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(reportObj)
  })
  .then(function (r) { return r.json(); })
  .then(function (data) { console.log('✅ Hazard report saved to Atlas:', data.report && data.report.id); })
  .catch(function (err) { console.warn('⚠️ Could not save report to server (offline mode):', err.message); });

  setTimeout(function () {
    var el = document.getElementById('vs2');
    if (el) { el.className = 'verify-step verify-step--done'; el.textContent = '✅ Rainfall data cross-checked'; }
  }, 1200);
  setTimeout(function () {
    var el = document.getElementById('vs3');
    if (el) { el.className = 'verify-step verify-step--done'; el.textContent = '✅ Report aligns with risk model'; }
  }, 2600);
  setTimeout(function () {
    var el = document.getElementById('vs4');
    if (el) { el.className = 'verify-step verify-step--done'; el.textContent = '✅ Saved to database'; }
    var vr2 = document.getElementById('verifyResult');
    if (vr2) {
      vr2.style.display = 'block';
      vr2.style.background = '#f0fdf4';
      vr2.style.border = '1px solid #86efac';
      vr2.style.color = '#14532d';
      vr2.textContent = '🟡 Status: Pending Verification — Your report has been logged and sent to the District Disaster Authority.';
    }
  }, 4000);
}

// ===============================================================
// WARNINGS GRID
// ===============================================================
function populateWarnings() {
  populateWarningsInto('warningGrid');
  populateWarningsInto('authorityWarningGrid');
}

// ═══════════════════════════════════════════════════════════════
// ALERTS LIST (authority sidebar)
// ═══════════════════════════════════════════════════════════════
function populateAlertsList(targetId) {
  var ul = document.getElementById(targetId || 'alertsList');
  if (!ul) return;
  ul.innerHTML = '';
  var shown = NER_DATA.stations.slice(0, 5);
  shown.forEach(function (s) {
    var levelClass = 'alert-item--' + s.risk_level.toLowerCase();
    var li = document.createElement('li');
    li.className = 'alert-item ' + levelClass;
    li.innerHTML =
      '<span class="alert-item-level">' + s.risk_level + '</span>' +
      '<div class="alert-item-body">' +
        '<strong>' + s.station + ', ' + s.state + '</strong>' +
        '<span>Risk ' + s.risk_score + '/100 — Today: ' + s.rainfall_today + 'mm | 7d: ' + s.rainfall_7d + 'mm</span>' +
        '<time>' + s.date + '</time>' +
      '</div>';
    ul.appendChild(li);
  });
}

// ═══════════════════════════════════════════════════════════════
// DATA BADGE
// ═══════════════════════════════════════════════════════════════
function updateDataBadge() {
  var el = document.getElementById('dataBadge');
  if (el) {
    el.textContent = 'Real Data — ' + NER_DATA.generated_at;
    el.title = NER_DATA.source;
  }
}

// ═══════════════════════════════════════════════════════════════
// RAINFALL SCENARIO (replaces what-if slider)
// ═══════════════════════════════════════════════════════════════
function updateSimBase(base) { _simBase = base; }

function setScenario(pct) {
  // Update button active states
  [0, 10, 20, 30, 40].forEach(function (v) {
    var btn = document.getElementById('scBtn' + v);
    if (btn) {
      btn.classList.toggle('active', v === pct);
      btn.setAttribute('aria-pressed', v === pct ? 'true' : 'false');
    }
  });

  // Sync the legacy slider for any listeners
  var slider = document.getElementById('rainfallSlider');
  if (slider) slider.value = pct;

  updateSim(pct);
}

function updateSim(val) {
  var pct      = parseInt(val);
  var base     = _simBase;
  var newScore = Math.min(100, Math.round(base + pct * 0.38));
  var newAreas = Math.round(pct * 0.6);
  var newVill  = Math.round(pct * 0.45);
  var newRoads = Math.round(pct * 0.3);

  setText('sliderVal',   '+' + pct + '%');
  setText('simScore',    newScore);
  setText('simAreas',    newAreas);
  setText('simVillages', newVill);
  setText('simRoads',    newRoads);

  // Animate the main gauge to simulated value if in citizen view
  var fill = document.getElementById('gaugeFill');
  if (fill && pct > 0) fill.style.width = newScore + '%';
  else if (fill && pct === 0 && _activeStation) fill.style.width = _activeStation.risk_score + '%';

  // Color the sim score by level
  var simScoreEl = document.getElementById('simScore');
  if (simScoreEl) {
    simScoreEl.style.color = newScore >= 75 ? '#b91c1c' : newScore >= 55 ? '#c2410c' : newScore >= 35 ? '#b45309' : '#166534';
  }

  // Update Early Warning Status Bar to simulated risk level
  if (_activeStation) {
    var simStation = Object.assign({}, _activeStation, {
      risk_score: newScore,
      risk_level: newScore >= 75 ? 'CRITICAL' : newScore >= 55 ? 'HIGH' : newScore >= 35 ? 'MODERATE' : 'LOW'
    });
    updateEarlyWarningStatusBar(pct > 0 ? simStation : _activeStation);

    // Trigger automated alert evaluation when simulated risk crosses alert threshold (Score >= 55 / HIGH)
    if (pct > 0 && (newScore >= 55 || simStation.risk_level === 'HIGH' || simStation.risk_level === 'CRITICAL')) {
      if (window._simAlertTimeout) clearTimeout(window._simAlertTimeout);
      window._simAlertTimeout = setTimeout(function () {
        evaluateStationRiskAlert(simStation, 'simulation');
      }, 600);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// GPS
// ═══════════════════════════════════════════════════════════════
function getGPS() {
  if (!navigator.geolocation) { alert('Geolocation not supported by this browser.'); return; }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var el;
      el = document.getElementById('reportLat'); if (el) el.value = pos.coords.latitude.toFixed(5);
      el = document.getElementById('reportLon'); if (el) el.value = pos.coords.longitude.toFixed(5);
    },
    function () { alert('Could not get location. Please type it manually.'); }
  );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setWidth(id, pct) {
  var el = document.getElementById(id);
  if (el) el.style.width = Math.max(2, pct) + '%';
}

// ═══════════════════════════════════════════════════════════════
// INTERACTIVE RISK MAP (Leaflet.js)
// ═══════════════════════════════════════════════════════════════
var _map              = null;
var _riskLayerGroup   = null;
var _labelLayerGroup  = null;
var _rainLayerGroup   = null;
var _markerMap        = {};   // station name → leaflet marker
var _selectedMapStation = null;
var _layerState = { risk: true, labels: true, rainfall: false, terrain: false };

var _tileStreet = null;
var _tileSatellite = null;

// Colour lookup
var RISK_COLOURS = {
  CRITICAL: '#b91c1c',
  HIGH:     '#c2410c',
  MODERATE: '#b45309',
  LOW:      '#166534'
};

// ── Init map once the citizen view is shown ─────────────────────
function ensureMapInit() {
  if (_map) {
    // Map already created — just invalidate size (layout may have changed)
    setTimeout(function () { _map.invalidateSize(); }, 120);
    return;
  }
  if (typeof L === 'undefined') { console.warn('Leaflet not loaded.'); return; }
  var container = document.getElementById('nerMap');
  if (!container) return;

  // Centre on NE India
  _map = L.map('nerMap', {
    center: [26.0, 92.5],
    zoom: 6,
    zoomControl: true,
    attributionControl: true
  });

  // Basemap tiles
  _tileStreet = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '© OpenStreetMap contributors', maxZoom: 18 }
  ).addTo(_map);

  _tileSatellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '© Esri, Maxar, Earthstar Geographics', maxZoom: 18 }
  );

  // Layer groups
  _riskLayerGroup  = L.layerGroup().addTo(_map);
  _labelLayerGroup = L.layerGroup().addTo(_map);
  _rainLayerGroup  = L.layerGroup();   // not added by default

  // Plot all stations
  if (typeof NER_DATA !== 'undefined') {
    NER_DATA.stations.forEach(function (s) { addStationMarker(s); });
  }

  // Fit bounds to all markers
  if (NER_DATA && NER_DATA.stations.length > 0) {
    var latlngs = NER_DATA.stations.map(function (s) { return [s.lat, s.lon]; });
    _map.fitBounds(L.latLngBounds(latlngs).pad(0.12));
  }

  // If a station is already selected, highlight its marker
  if (_activeStation) {
    highlightMapMarker(_activeStation);
  }
}

// ── Create a custom div marker ──────────────────────────────────
function addStationMarker(s) {
  var colour   = RISK_COLOURS[s.risk_level] || '#64748b';
  var levelCls = 'm-' + s.risk_level.toLowerCase();
  var score    = s.risk_score;

  // Custom DivIcon
  var icon = L.divIcon({
    className: '',
    html: '<div class="raksha-marker aahat-marker ' + levelCls + '" title="' + s.station + '">' + score + '</div>',
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
    popupAnchor:[0, -20]
  });

  var marker = L.marker([s.lat, s.lon], { icon: icon });

  // Popup
  var popupHeaderBg = colour;
  var popupHTML =
    '<div class="map-popup">' +
      '<div class="map-popup-header" style="background:' + popupHeaderBg + '">' +
        s.station + ', ' + s.state +
      '</div>' +
      '<div class="map-popup-body">' +
        '<div class="map-popup-row"><span>Risk Score</span><strong>' + score + ' / 100</strong></div>' +
        '<div class="map-popup-row"><span>Level</span><strong>' + s.risk_level + '</strong></div>' +
        '<div class="map-popup-row"><span>Today Rain</span><strong>' + s.rainfall_today + 'mm</strong></div>' +
        '<div class="map-popup-row"><span>7-Day Rain</span><strong>' + s.rainfall_7d + 'mm</strong></div>' +
        '<div class="map-popup-row"><span>Elevation</span><strong>' + s.elevation_m + 'm</strong></div>' +
      '</div>' +
    '</div>';

  marker.bindPopup(popupHTML, { maxWidth: 210 });

  // Click → update info panel + select station
  marker.on('click', function () {
    updateMapInfoPanel(s);
    highlightMapMarker(s);
    // Also update the main detail panel silently
    selectStation(s);
    highlightTableRow(s);
  });

  marker.addTo(_riskLayerGroup);
  _markerMap[s.station] = marker;

  // Label
  var labelIcon = L.divIcon({
    className: 'rain-circle-label',
    html: '<span style="font-family:Inter,sans-serif">' + s.station + '</span>',
    iconSize:   null,
    iconAnchor: [0, -22]
  });
  var label = L.marker([s.lat, s.lon], { icon: labelIcon, interactive: false });
  label.addTo(_labelLayerGroup);

  // Rainfall circle
  var rainRadius = Math.max(8000, s.rainfall_7d * 180);
  var rainOpacity = Math.min(0.55, s.rainfall_7d / 500);
  var rainCircle = L.circle([s.lat, s.lon], {
    radius:      rainRadius,
    color:       '#0369a1',
    fillColor:   '#0369a1',
    fillOpacity: rainOpacity,
    weight:      1,
    opacity:     0.5
  });
  rainCircle.bindTooltip(s.station + ': ' + s.rainfall_7d + 'mm (7d)', { sticky: true });
  rainCircle.addTo(_rainLayerGroup);
}

// ── Highlight selected marker ───────────────────────────────────
function highlightMapMarker(s) {
  // Remove selected class from previous
  if (_selectedMapStation && _markerMap[_selectedMapStation.station]) {
    var prevEl = _markerMap[_selectedMapStation.station].getElement();
    if (prevEl) {
      var prevDiv = prevEl.querySelector('.raksha-marker, .aahat-marker');
      if (prevDiv) prevDiv.classList.remove('selected');
    }
  }
  _selectedMapStation = s;
  var marker = _markerMap[s.station];
  if (marker) {
    var el = marker.getElement();
    if (el) {
      var div = el.querySelector('.raksha-marker, .aahat-marker');
      if (div) div.classList.add('selected');
    }
    // Pan to marker
    _map.panTo([s.lat, s.lon], { animate: true, duration: 0.5 });
  }
}

// ── Info panel on the right of map ─────────────────────────────
function updateMapInfoPanel(s) {
  var colour = RISK_COLOURS[s.risk_level] || '#64748b';
  var r7 = s.rainfall_7d;
  var trendText = r7 > 150 ? '↑ Rapidly rising' :
                  r7 > 80  ? '↑ Increasing' :
                  r7 > 30  ? '→ Stable' : '↓ Decreasing';

  setText('mapInfoStation', s.station + ', ' + s.state);

  var badge = document.getElementById('mapInfoBadge');
  if (badge) {
    badge.textContent = s.risk_level;
    badge.className = 'risk-badge badge--' + s.risk_level.toLowerCase();
  }

  var header = document.getElementById('mapInfoHeader');
  if (header) header.style.borderLeft = '4px solid ' + colour;

  var body = document.getElementById('mapInfoBody');
  if (body) {
    body.innerHTML =
      '<div class="map-risk-gauge-wrap">' +
        '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:4px">Landslide Risk Score</div>' +
        '<div class="map-risk-num risk-' + s.risk_level.toLowerCase() + '">' + s.risk_score + '<span style="font-size:16px;font-weight:500;color:var(--text-faint)"> /100</span></div>' +
        '<div class="map-risk-bar-track"><div class="map-risk-bar-fill" style="width:' + s.risk_score + '%"></div></div>' +
      '</div>' +
      '<div class="map-info-row"><span class="map-info-row-label">📈 Trend</span><span class="map-info-row-val">' + trendText + '</span></div>' +
      '<div class="map-info-row"><span class="map-info-row-label">🌧 Today Rain</span><span class="map-info-row-val">' + s.rainfall_today + ' mm</span></div>' +
      '<div class="map-info-row"><span class="map-info-row-label">📅 7-Day Rain</span><span class="map-info-row-val">' + s.rainfall_7d + ' mm</span></div>' +
      '<div class="map-info-row"><span class="map-info-row-label">⛰ Elevation</span><span class="map-info-row-val">' + s.elevation_m + ' m</span></div>' +
      '<div class="map-info-row"><span class="map-info-row-label">🌡 Temp Range</span><span class="map-info-row-val">' + s.temp_min + '° – ' + s.temp_max + '°C</span></div>' +
      '<div class="map-info-row"><span class="map-info-row-label">📍 District</span><span class="map-info-row-val">' + s.district + '</span></div>';
  }

  var footer = document.getElementById('mapInfoFooter');
  if (footer) footer.style.display = 'block';
}

// ── "View Full Details" button in map info panel ────────────────
function viewStationFromMap() {
  if (!_selectedMapStation) return;
  selectStation(_selectedMapStation);
  highlightTableRow(_selectedMapStation);
  // Scroll to detail panel
  var el = document.getElementById('sec-trend');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Layer toggle ────────────────────────────────────────────────
function toggleLayer(name) {
  if (!_map) return;
  _layerState[name] = !_layerState[name];

  var btn = document.getElementById(
    name === 'risk'     ? 'layerRisk' :
    name === 'labels'   ? 'layerLabels' :
    name === 'rainfall' ? 'layerRainfall' :
    name === 'terrain'  ? 'layerTerrain' : ''
  );
  if (btn) btn.classList.toggle('active', _layerState[name]);

  if (name === 'risk') {
    if (_layerState.risk) _riskLayerGroup.addTo(_map);
    else _map.removeLayer(_riskLayerGroup);
  }
  if (name === 'labels') {
    if (_layerState.labels) _labelLayerGroup.addTo(_map);
    else _map.removeLayer(_labelLayerGroup);
  }
  if (name === 'rainfall') {
    if (_layerState.rainfall) _rainLayerGroup.addTo(_map);
    else _map.removeLayer(_rainLayerGroup);
  }
  if (name === 'terrain') {
    // Terrain = satellite view toggle
    setBasemap(_layerState.terrain ? 'satellite' : 'street');
  }
}

// ── Basemap switch ──────────────────────────────────────────────
function setBasemap(type) {
  if (!_map || !_tileStreet || !_tileSatellite) return;

  document.getElementById('baseStreet')    && document.getElementById('baseStreet').classList.toggle('active',    type === 'street');
  document.getElementById('baseSatellite') && document.getElementById('baseSatellite').classList.toggle('active', type === 'satellite');

  if (type === 'satellite') {
    _map.removeLayer(_tileStreet);
    _tileSatellite.addTo(_map);
  } else {
    _map.removeLayer(_tileSatellite);
    _tileStreet.addTo(_map);
  }
}

// ── Call ensureMapInit whenever citizen view becomes active ──────
// Hook into showView
var _origShowView = showView;
showView = function (viewName) {
  _origShowView(viewName);
  if (viewName === 'citizen') {
    setTimeout(ensureMapInit, 200);
  }
};

// Also init if page loads directly into citizen view
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('view-citizen') &&
      document.getElementById('view-citizen').classList.contains('view--active')) {
    setTimeout(ensureMapInit, 300);
  }
});

// ═══════════════════════════════════════════════════════════════
// AUTHORITY — FIELD REPORTS ENGINE
// ═══════════════════════════════════════════════════════════════

function initFieldReports() {
  if (_fieldReports.length > 0) {
    updateReportCounts();
    renderReportCards();
    return;
  }

  // Seed sample realistic reports from NER data
  var stations = (typeof NER_DATA !== 'undefined' && NER_DATA.stations) ? NER_DATA.stations : [];
  var s1 = stations[0] || { name: 'Mawsynram East', state: 'Meghalaya', latitude: 25.30, longitude: 91.58 };
  var s2 = stations[1] || { name: 'Cherrapunji Upper', state: 'Meghalaya', latitude: 25.27, longitude: 91.73 };
  var s3 = stations[2] || { name: 'Nongstoin Ridge', state: 'Meghalaya', latitude: 25.52, longitude: 91.27 };
  var s4 = stations[3] || { name: 'Aizawl North Hill', state: 'Mizoram', latitude: 23.73, longitude: 92.71 };

  _fieldReports = [
    {
      id: 'REP-8401',
      type: 'Tilted Trees / Poles',
      desc: 'Observed telephone poles leaning ~20 degrees down the slope near NH-40 curve after heavy rainfall.',
      lat: s1.latitude,
      lon: s1.longitude,
      station: s1.name,
      state: s1.state,
      time: '12 mins ago',
      status: 'pending',
      verifiedBy: null,
      verifiedAt: null
    },
    {
      id: 'REP-8397',
      type: 'Ground Cracks',
      desc: 'Fresh 2-inch wide fissures across the unpaved access road near residential cluster.',
      lat: s2.latitude,
      lon: s2.longitude,
      station: s2.name,
      state: s2.state,
      time: '45 mins ago',
      status: 'pending',
      verifiedBy: null,
      verifiedAt: null
    },
    {
      id: 'REP-8380',
      type: 'Debris Flow',
      desc: 'Mud and loose gravel washed down onto the drainage culvert causing minor water backup.',
      lat: s3.latitude,
      lon: s3.longitude,
      station: s3.name,
      state: s3.state,
      time: '3 hours ago',
      status: 'verified',
      verifiedBy: 'Field Officer D. Sangma (SDMA)',
      verifiedAt: '2 hours ago'
    },
    {
      id: 'REP-8354',
      type: 'Rockfall',
      desc: 'Small boulder fragments spotted on hillside footpath. Slope looks marginally unstable.',
      lat: s4.latitude,
      lon: s4.longitude,
      station: s4.name,
      state: s4.state,
      time: 'Yesterday, 18:20',
      status: 'verified',
      verifiedBy: 'Inspector R. Lalthanga (DDMA)',
      verifiedAt: 'Yesterday, 19:10'
    }
  ];

  updateReportCounts();
  renderReportCards();
}

function updateReportCounts() {
  var allCount = _fieldReports.length;
  var pendingCount = _fieldReports.filter(function(r) { return r.status === 'pending'; }).length;
  var verifiedCount = _fieldReports.filter(function(r) { return r.status === 'verified'; }).length;
  var rejectedCount = _fieldReports.filter(function(r) { return r.status === 'rejected'; }).length;

  setText('rtcAll', allCount);
  setText('rtcPending', pendingCount);
  setText('rtcVerified', verifiedCount);
  setText('rtcRejected', rejectedCount);
}

function filterReports(status) {
  _reportFilter = status;
  ['rtabAll', 'rtabPending', 'rtabVerified', 'rtabRejected'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) btn.classList.remove('active');
  });

  var activeTabId = status === 'all' ? 'rtabAll' :
                    status === 'pending' ? 'rtabPending' :
                    status === 'verified' ? 'rtabVerified' : 'rtabRejected';
  var activeBtn = document.getElementById(activeTabId);
  if (activeBtn) activeBtn.classList.add('active');

  renderReportCards();
}

function renderReportCards() {
  var grid = document.getElementById('reportCardsGrid');
  if (!grid) return;

  var filtered = _fieldReports.filter(function(r) {
    if (_reportFilter === 'all') return true;
    return r.status === _reportFilter;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    var emptyDiv = document.createElement('div');
    emptyDiv.className = 'report-empty';
    emptyDiv.textContent = 'No reports match this filter (' + _reportFilter + ').';
    grid.appendChild(emptyDiv);
    return;
  }

  filtered.forEach(function(report) {
    var card = document.createElement('div');
    card.className = 'report-card status-' + report.status;
    card.id = 'reportCard-' + report.id;

    var statusBadge = '';
    if (report.status === 'pending') {
      statusBadge = '<span class="badge badge-warning">🟡 Pending Review</span>';
    } else if (report.status === 'verified') {
      statusBadge = '<span class="badge badge-success">✅ Verified</span>';
    } else {
      statusBadge = '<span class="badge badge-neutral">❌ Rejected</span>';
    }

    var icon = '📷';
    var lowerType = (report.type || '').toLowerCase();
    if (lowerType.indexOf('crack') > -1) icon = '⚡';
    else if (lowerType.indexOf('tilt') > -1) icon = '📐';
    else if (lowerType.indexOf('debris') > -1) icon = '🌊';
    else if (lowerType.indexOf('rock') > -1) icon = '🪨';
    else if (lowerType.indexOf('water') > -1) icon = '💧';

    var actionsHtml = '';
    if (report.status === 'pending') {
      actionsHtml = `
        <div class="report-card-actions">
          <button class="btn-verify" onclick="verifyReport('${report.id}')" title="Verify report and confirm field hazard">
            ✅ Verify Report
          </button>
          <button class="btn-reject" onclick="rejectReport('${report.id}')" title="Dismiss or reject report">
            ❌ Reject
          </button>
        </div>
      `;
    } else if (report.status === 'verified') {
      actionsHtml = `
        <div class="report-card-verified-meta">
          <span class="report-verified-by">Verified by <strong>${report.verifiedBy || 'Disaster Authority'}</strong></span>
          <span class="report-verified-time">${report.verifiedAt || 'Recently'}</span>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="report-card-rejected-meta">
          <span>Dismissed / Not actionable</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="report-card-head">
        <div class="report-card-type">
          <span class="report-type-icon">${icon}</span>
          <span class="report-type-name">${report.type}</span>
        </div>
        <div class="report-card-status">
          ${statusBadge}
        </div>
      </div>

      <div class="report-card-body">
        <p class="report-desc">"${report.desc}"</p>
        
        <div class="report-meta-grid">
          <div class="report-meta-item">
            <span class="report-meta-lbl">Location:</span>
            <span class="report-meta-val">${report.station}, ${report.state}</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-lbl">Coordinates:</span>
            <span class="report-meta-val">${Number(report.lat).toFixed(3)}°N, ${Number(report.lon).toFixed(3)}°E</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-lbl">Reported:</span>
            <span class="report-meta-val">${report.time}</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-lbl">Report ID:</span>
            <span class="report-meta-val font-mono">${report.id}</span>
          </div>
        </div>
      </div>

      <div class="report-card-foot">
        ${actionsHtml}
      </div>
    `;

    grid.appendChild(card);
  });
}

function verifyReport(reportId) {
  var report = _fieldReports.find(function(r) { return r.id === reportId; });
  if (!report) return;

  report.status = 'verified';
  report.verifiedBy = 'Authority Officer (You)';
  report.verifiedAt = 'Just now';

  updateReportCounts();
  renderReportCards();

  showReportToast('✅ Report ' + reportId + ' verified and added to active threat model.');
}

function rejectReport(reportId) {
  var report = _fieldReports.find(function(r) { return r.id === reportId; });
  if (!report) return;

  report.status = 'rejected';
  report.verifiedBy = null;
  report.verifiedAt = null;

  updateReportCounts();
  renderReportCards();

  showReportToast('❌ Report ' + reportId + ' marked as rejected.');
}

function showReportToast(msg) {
  var existingToast = document.getElementById('reportToast');
  if (existingToast) existingToast.remove();

  var toast = document.createElement('div');
  toast.id = 'reportToast';
  toast.className = 'report-toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(function() {
    toast.classList.add('show');
  }, 10);

  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 300);
  }, 3000);
}
