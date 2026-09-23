require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { initDB, DB } = require('./db');
const { sendAutomatedRiskEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'raksha360_super_secret_jwt_key_sih_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// ── DB Init Middleware (must be BEFORE all routes for Vercel cold starts) ──
let dbInitPromise = null;
app.use(async (req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = initDB();
  }
  await dbInitPromise;
  next();
});

// ── Auth Token Helper ──────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No Bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
  }
}

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════

// 1. Health & Config Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    system: 'Raksha360 Early Warning & Alert Engine',
    database: DB.isMongo() ? 'MongoDB' : 'Embedded Local Store',
    timestamp: new Date()
  });
});


// 2. Citizen Sign Up
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, monitoredStation = 'Gangtok' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = await DB.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const user = await DB.createUser({
      name,
      email,
      password,
      role: 'citizen',
      monitoredStation,
      emailAlertsEnabled: true
    });

    const token = generateToken(user);
    return res.status(201).json({
      message: 'Citizen account registered successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// 3. Login (Citizen or Authority)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await DB.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        error: `Access Denied: This portal requires ${role.toUpperCase()} credentials, but this account is registered as ${user.role.toUpperCase()}.`
      });
    }

    const token = generateToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      monitoredStation: user.monitoredStation,
      emailAlertsEnabled: user.emailAlertsEnabled
    };

    return res.json({
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// 4. Get Current User Profile
app.get('/api/auth/me', verifyAuth, async (req, res) => {
  try {
    const user = await DB.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Update Citizen Preferences (Monitored Station & Email Alerts Toggle)
app.post('/api/citizen/preferences', verifyAuth, async (req, res) => {
  try {
    const { monitoredStation, emailAlertsEnabled } = req.body;
    const updated = await DB.updateUserPreferences(req.user.id, {
      monitoredStation,
      emailAlertsEnabled
    });

    if (!updated) return res.status(404).json({ error: 'User not found.' });
    return res.json({
      message: 'Preferences updated successfully.',
      user: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. Get Alert History (Dispatched emails & status)
app.get('/api/alerts/history', async (req, res) => {
  try {
    const history = await DB.getAlertHistory(50);
    return res.json({ history });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Hazard Reports ──────────────────────────────────────────────

// 7a. Submit a Citizen Hazard Report → saved to MongoDB Atlas
app.post('/api/reports/submit', async (req, res) => {
  try {
    const { type, description, latitude, longitude, station, state } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Hazard type is required.' });
    }

    // Get reporter email if logged in (optional)
    let reportedBy = 'anonymous';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        reportedBy = decoded.email || 'anonymous';
      } catch (_) { /* not logged in, stay anonymous */ }
    }

    const report = await DB.recordHazardReport({
      type,
      description: description || '',
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      station: station || 'Unknown',
      state: state || 'NER',
      reportedBy
    });

    return res.status(201).json({
      success: true,
      message: 'Hazard report submitted and saved to database.',
      report
    });
  } catch (err) {
    console.error('Hazard report error:', err);
    return res.status(500).json({ error: 'Failed to save report: ' + err.message });
  }
});

// 7b. Get all Hazard Reports (Authority dashboard)
app.get('/api/reports', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const reports = await DB.getHazardReports(limit);
    return res.json({ reports, total: reports.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 7. Core Automated Risk Evaluation & Email Dispatch Engine
app.post('/api/alerts/evaluate-risk', async (req, res) => {
  try {
    const {
      stationName,
      state = 'NER',
      riskScore = 0,
      riskLevel = 'LOW',
      rainfallToday = 0,
      rainfall7d = 0,
      whyFactors = '',
      triggerSource = 'automated',
      currentUserEmail = null
    } = req.body;

    if (!stationName) {
      return res.status(400).json({ error: 'stationName is required.' });
    }

    const numericScore = parseFloat(riskScore) || 0;
    const isDangerous = numericScore >= 55 || riskLevel === 'HIGH' || riskLevel === 'CRITICAL';

    // If risk condition is not HIGH or CRITICAL, no emergency email is warranted
    if (!isDangerous) {
      return res.json({
        alertTriggered: false,
        reason: `Risk score (${numericScore}) and level (${riskLevel}) are below alert threshold (High/Critical). No email sent.`,
        stationName,
        riskScore: numericScore,
        riskLevel
      });
    }

    // Step 2: Determine recipients
    let recipientEmails = [];

    if (triggerSource === 'user_manual_dispatch' && currentUserEmail && currentUserEmail.includes('@')) {
      // When a logged-in user triggers a test/manual dispatch, send exclusively to their email
      recipientEmails = [currentUserEmail.toLowerCase()];
    } else {
      // Automatic or authority dispatch: notify all station subscribers and active user
      const subscribers = await DB.getSubscribersForStation(stationName);
      recipientEmails = subscribers.map(s => s.email);

      if (currentUserEmail && typeof currentUserEmail === 'string' && currentUserEmail.includes('@')) {
        if (!recipientEmails.includes(currentUserEmail.toLowerCase())) {
          recipientEmails.push(currentUserEmail.toLowerCase());
        }
      }

      const testRecipient = (process.env.ALERT_TEST_RECIPIENT || '').trim().toLowerCase();
      if (testRecipient && !recipientEmails.includes(testRecipient)) {
        recipientEmails.push(testRecipient);
      }
    }

    if (recipientEmails.length === 0) {
      const log = await DB.recordAlert({
        stationId: stationName.toLowerCase().replace(/\s+/g, '_'),
        stationName,
        state,
        riskScore: numericScore,
        riskLevel,
        triggerSource,
        recipients: [],
        status: 'No Active Subscribers',
        details: { rainfallToday, rainfall7d, whyFactors }
      });

      return res.json({
        alertTriggered: true,
        emailSent: false,
        reason: `Risk condition reached ${riskLevel} (${numericScore}/100), but no active subscribers registered for ${stationName}.`,
        log
      });
    }

    // Step 3: Automatically Dispatch Real Email via Nodemailer
    const emailResult = await sendAutomatedRiskEmail({
      recipients: recipientEmails,
      stationName,
      state,
      riskScore: numericScore,
      riskLevel,
      rainfallToday,
      rainfall7d,
      whyFactors,
      triggerSource
    });

    // Step 4: Record Alert in DB with "Email Sent" Status
    const log = await DB.recordAlert({
      stationId: stationName.toLowerCase().replace(/\s+/g, '_'),
      stationName,
      state,
      riskScore: numericScore,
      riskLevel,
      triggerSource,
      recipients: recipientEmails,
      status: emailResult.success ? 'Email Sent' : 'Delivery Error',
      details: {
        rainfallToday,
        rainfall7d,
        whyFactors,
        messageId: emailResult.messageId || null,
        previewUrl: emailResult.previewUrl || null,
        error: emailResult.error || null
      }
    });

    return res.json({
      alertTriggered: true,
      emailSent: emailResult.success,
      status: emailResult.success ? 'Email Sent' : 'Failed',
      recipientCount: recipientEmails.length,
      recipients: recipientEmails,
      previewUrl: emailResult.previewUrl || null,
      messageId: emailResult.messageId || null,
      log
    });
  } catch (err) {
    console.error('Error evaluating risk and dispatching alert:', err);
    return res.status(500).json({ error: 'Alert evaluation error: ' + err.message });
  }
});


// Root fallback to index.html (only for non-API routes)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Boot Server for local development
async function start() {
  await initDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n===========================================================`);
    console.log(`🛡️  Raksha360 Server & Automated Alert Engine running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`🏛️  Authority Demo Account: ${process.env.DEFAULT_AUTHORITY_EMAIL || 'authority@raksha360.gov.in'}`);
    console.log(`🔑 Authority Demo Password: ${process.env.DEFAULT_AUTHORITY_PASS || 'Admin@123'}`);
    console.log(`===========================================================\n`);
  });
}

if (!process.env.VERCEL) {
  start();
}

module.exports = app;
