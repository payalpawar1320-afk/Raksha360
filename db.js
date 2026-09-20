const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const LOCAL_DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'local_storage.json')
  : path.join(__dirname, 'data', 'local_storage.json');

// In-memory / File-backed local store fallback
class LocalStore {
  constructor() {
    this.data = {
      users: [],
      alertLogs: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(LOCAL_DB_PATH)) {
        const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        const seedPath = path.join(__dirname, 'data', 'local_storage.json');
        if (fs.existsSync(seedPath)) {
          const raw = fs.readFileSync(seedPath, 'utf-8');
          this.data = JSON.parse(raw);
          this.save();
        } else {
          this.save();
        }
      }
    } catch (err) {
      console.warn('Could not read local_storage.json, using in-memory fallback:', err.message);
    }
  }

  save() {
    try {
      const dir = path.dirname(LOCAL_DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Local file write skipped (using in-memory):', err.message);
    }
  }

  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userObj) {
    this.data.users.push(userObj);
    this.save();
    return userObj;
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  getSubscribersForStation(stationName) {
    return this.data.users.filter(u => {
      if (!u.emailAlertsEnabled) return false;
      if (u.role === 'authority') return true; // Authority gets all critical alerts
      return u.monitoredStation && u.monitoredStation.toLowerCase() === stationName.toLowerCase();
    });
  }

  addAlertLog(logObj) {
    this.data.alertLogs.unshift(logObj);
    if (this.data.alertLogs.length > 200) {
      this.data.alertLogs = this.data.alertLogs.slice(0, 200);
    }
    this.save();
    return logObj;
  }

  getAlertLogs(limit = 50) {
    return this.data.alertLogs.slice(0, limit);
  }
}

const localStore = new LocalStore();
let isMongoConnected = false;

// Mongoose Schemas (used when MongoDB URI is supplied)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'authority'], default: 'citizen' },
  monitoredStation: { type: String, default: 'Gangtok' },
  emailAlertsEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const alertLogSchema = new mongoose.Schema({
  stationId: String,
  stationName: { type: String, required: true },
  state: String,
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, required: true },
  triggerSource: { type: String, default: 'automated' },
  recipients: [String],
  status: { type: String, default: 'Email Sent' },
  details: mongoose.Schema.Types.Mixed,
  sentAt: { type: Date, default: Date.now }
});

let UserModel;
let AlertLogModel;

async function initDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      isMongoConnected = true;
      UserModel = mongoose.model('User', userSchema);
      AlertLogModel = mongoose.model('AlertLog', alertLogSchema);
      console.log('✅ Connected to MongoDB via Mongoose.');
    } catch (err) {
      console.warn('⚠️ MongoDB connection failed:', err.message);
      console.log('ℹ️ Falling back gracefully to Local Storage.');
      isMongoConnected = false;
    }
  } else {
    console.log('ℹ️ No MONGODB_URI provided in .env — using Local Embedded Storage.');
  }

  // Ensure default seed accounts exist in store
  await seedDefaultAccounts();
}

async function seedDefaultAccounts() {
  const defaultAuthEmail = (process.env.DEFAULT_AUTHORITY_EMAIL || 'authority@raksha360.gov.in').toLowerCase();
  const defaultAuthPass = process.env.DEFAULT_AUTHORITY_PASS || 'Admin@123';
  const defaultCitizenEmail = (process.env.ALERT_TEST_RECIPIENT || 'payalpawar1320@gmail.com').toLowerCase();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(defaultAuthPass, salt);

  if (isMongoConnected && UserModel) {
    const existingAuth = await UserModel.findOne({ email: defaultAuthEmail });
    if (!existingAuth) {
      await UserModel.create({
        name: 'State Disaster Management Authority (NER)',
        email: defaultAuthEmail,
        passwordHash: hash,
        role: 'authority',
        monitoredStation: 'ALL',
        emailAlertsEnabled: true
      });
      console.log('🌱 Seeded default Authority account in MongoDB:', defaultAuthEmail);
    }

    const existingCitizen = await UserModel.findOne({ email: defaultCitizenEmail });
    if (!existingCitizen) {
      await UserModel.create({
        name: 'Payal Pawar (Citizen)',
        email: defaultCitizenEmail,
        passwordHash: hash,
        role: 'citizen',
        monitoredStation: 'Kohima',
        emailAlertsEnabled: true
      });
      console.log('🌱 Seeded default Citizen account in MongoDB:', defaultCitizenEmail);
    }
  } else {
    const existingAuth = localStore.findUserByEmail(defaultAuthEmail);
    if (!existingAuth) {
      localStore.createUser({
        id: 'auth_seed_' + Date.now(),
        name: 'State Disaster Management Authority (NER)',
        email: defaultAuthEmail,
        passwordHash: hash,
        role: 'authority',
        monitoredStation: 'ALL',
        emailAlertsEnabled: true,
        createdAt: new Date().toISOString()
      });
      console.log('🌱 Seeded default Authority account in Local Storage:', defaultAuthEmail);
    }

    const existingCitizen = localStore.findUserByEmail(defaultCitizenEmail);
    if (!existingCitizen) {
      localStore.createUser({
        id: 'usr_seed_' + Date.now(),
        name: 'Payal Pawar (Citizen)',
        email: defaultCitizenEmail,
        passwordHash: hash,
        role: 'citizen',
        monitoredStation: 'Kohima',
        emailAlertsEnabled: true,
        createdAt: new Date().toISOString()
      });
      console.log('🌱 Seeded default Citizen account in Local Storage:', defaultCitizenEmail);
    }
  }
}

// Unified Database Access Layer
const DB = {
  isMongo: () => isMongoConnected,

  async findUserByEmail(email) {
    if (isMongoConnected && UserModel) {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        monitoredStation: user.monitoredStation,
        emailAlertsEnabled: user.emailAlertsEnabled,
        createdAt: user.createdAt
      };
    }
    return localStore.findUserByEmail(email);
  },

  async findUserById(id) {
    if (isMongoConnected && UserModel) {
      const user = await UserModel.findById(id);
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        monitoredStation: user.monitoredStation,
        emailAlertsEnabled: user.emailAlertsEnabled,
        createdAt: user.createdAt
      };
    }
    const user = localStore.findUserById(id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      monitoredStation: user.monitoredStation,
      emailAlertsEnabled: user.emailAlertsEnabled,
      createdAt: user.createdAt
    };
  },

  async createUser({ name, email, password, role = 'citizen', monitoredStation = 'Gangtok', emailAlertsEnabled = true }) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    if (isMongoConnected && UserModel) {
      const doc = await UserModel.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        monitoredStation,
        emailAlertsEnabled
      });
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        monitoredStation: doc.monitoredStation,
        emailAlertsEnabled: doc.emailAlertsEnabled
      };
    }

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      monitoredStation,
      emailAlertsEnabled,
      createdAt: new Date().toISOString()
    };
    localStore.createUser(newUser);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      monitoredStation: newUser.monitoredStation,
      emailAlertsEnabled: newUser.emailAlertsEnabled
    };
  },

  async updateUserPreferences(id, { monitoredStation, emailAlertsEnabled }) {
    if (isMongoConnected && UserModel) {
      const updates = {};
      if (monitoredStation !== undefined) updates.monitoredStation = monitoredStation;
      if (emailAlertsEnabled !== undefined) updates.emailAlertsEnabled = emailAlertsEnabled;
      const doc = await UserModel.findByIdAndUpdate(id, updates, { new: true });
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        role: doc.role,
        monitoredStation: doc.monitoredStation,
        emailAlertsEnabled: doc.emailAlertsEnabled
      };
    }

    return localStore.updateUser(id, {
      ...(monitoredStation !== undefined ? { monitoredStation } : {}),
      ...(emailAlertsEnabled !== undefined ? { emailAlertsEnabled } : {})
    });
  },

  async getSubscribersForStation(stationName) {
    if (isMongoConnected && UserModel) {
      const list = await UserModel.find({
        emailAlertsEnabled: true,
        $or: [
          { role: 'authority' },
          { monitoredStation: new RegExp('^' + stationName.trim() + '$', 'i') }
        ]
      });
      return list.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        monitoredStation: u.monitoredStation
      }));
    }
    return localStore.getSubscribersForStation(stationName);
  },

  async recordAlert({ stationId, stationName, state, riskScore, riskLevel, triggerSource, recipients, status = 'Email Sent', details = {} }) {
    if (isMongoConnected && AlertLogModel) {
      const doc = await AlertLogModel.create({
        stationId,
        stationName,
        state,
        riskScore,
        riskLevel,
        triggerSource,
        recipients,
        status,
        details,
        sentAt: new Date()
      });
      return {
        id: doc._id.toString(),
        stationName: doc.stationName,
        state: doc.state,
        riskScore: doc.riskScore,
        riskLevel: doc.riskLevel,
        triggerSource: doc.triggerSource,
        recipients: doc.recipients,
        status: doc.status,
        sentAt: doc.sentAt
      };
    }

    const log = {
      id: 'alert_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      stationId,
      stationName,
      state,
      riskScore,
      riskLevel,
      triggerSource,
      recipients,
      status,
      details,
      sentAt: new Date().toISOString()
    };
    return localStore.addAlertLog(log);
  },

  async getAlertHistory(limit = 50) {
    if (isMongoConnected && AlertLogModel) {
      const list = await AlertLogModel.find().sort({ sentAt: -1 }).limit(limit);
      return list.map(l => ({
        id: l._id.toString(),
        stationName: l.stationName,
        state: l.state,
        riskScore: l.riskScore,
        riskLevel: l.riskLevel,
        triggerSource: l.triggerSource,
        recipients: l.recipients,
        status: l.status,
        sentAt: l.sentAt
      }));
    }
    return localStore.getAlertLogs(limit);
  }
};

module.exports = {
  initDB,
  DB
};
