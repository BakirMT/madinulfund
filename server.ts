import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'fund_db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DBStructure {
  students: any[];
  transactions: any[];
  settings: any;
  adminPassword?: string;
}

const defaultData: DBStructure = {
  settings: {
    dars_name: 'Madinul Qutaba',
    dars_address: "Central DARS Complex, Jami'a Nagar, Malappuram, Kerala - 676505",
    phone: '+91 98471 23456',
    email: 'office@madinulqutaba.edu.in',
    other_details: "Affiliated with Markazu Tharbiyathil Islamiyya — Dedicated to Islamic & Shari'ah Studies",
    theme: 'light',
    currency: '₹',
    date_format: 'DD/MM/YYYY',
  },
  adminPassword: 'madinul2026',
  students: [],
  transactions: [],
};

function readDb(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, using defaults:', err);
    return defaultData;
  }
}

function writeDb(data: DBStructure): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- API Endpoints ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/api/data', (req, res) => {
    const db = readDb();
    res.json({
      students: db.students,
      transactions: db.transactions,
      settings: db.settings,
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDb();
    const expectedPass = db.adminPassword || 'madinul2026';
    if (username?.trim().toLowerCase() === 'admin' && password === expectedPass) {
      res.json({ success: true, user: { username: 'admin', name: 'DARS Administrator' } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  });

  app.post('/api/students', (req, res) => {
    const db = readDb();
    const newStudent = {
      ...req.body,
      id: req.body.id || 'stud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.students.unshift(newStudent);
    writeDb(db);
    res.json({ success: true, student: newStudent });
  });

  app.put('/api/students/:id', (req, res) => {
    const db = readDb();
    const idx = db.students.findIndex((s) => s.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    db.students[idx] = {
      ...db.students[idx],
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    writeDb(db);
    res.json({ success: true, student: db.students[idx] });
  });

  app.delete('/api/students/:id', (req, res) => {
    const db = readDb();
    db.students = db.students.filter((s) => s.id !== req.params.id);
    db.transactions = db.transactions.filter((tx) => tx.student_id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  });

  app.post('/api/transactions', (req, res) => {
    const db = readDb();
    const newTx = {
      ...req.body,
      id: req.body.id || 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      amount: Number(req.body.amount),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.transactions.unshift(newTx);
    writeDb(db);
    res.json({ success: true, transaction: newTx });
  });

  app.post('/api/transactions/bulk', (req, res) => {
    const { total_amount, student_ids, description, date } = req.body;
    if (!student_ids || student_ids.length === 0 || !total_amount || total_amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid bulk parameters' });
    }
    const db = readDb();
    const count = student_ids.length;
    const perStudent = Math.floor((total_amount / count) * 100) / 100;
    const remainder = Number((total_amount - perStudent * count).toFixed(2));
    const now = new Date().toISOString();

    const newTransactions = student_ids.map((sid: string, idx: number) => ({
      id: 'tx_bulk_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
      student_id: sid,
      type: 'income',
      amount: idx === 0 ? Number((perStudent + remainder).toFixed(2)) : perStudent,
      description: description || 'Bulk Fund Distribution',
      date: date || new Date().toISOString().split('T')[0],
      created_at: now,
      updated_at: now,
    }));

    db.transactions.unshift(...newTransactions);
    writeDb(db);
    res.json({ success: true, count, perStudent, remainder });
  });

  app.put('/api/transactions/:id', (req, res) => {
    const db = readDb();
    const idx = db.transactions.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    db.transactions[idx] = {
      ...db.transactions[idx],
      ...req.body,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : db.transactions[idx].amount,
      updated_at: new Date().toISOString(),
    };
    writeDb(db);
    res.json({ success: true, transaction: db.transactions[idx] });
  });

  app.delete('/api/transactions/:id', (req, res) => {
    const db = readDb();
    db.transactions = db.transactions.filter((t) => t.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  });

  app.put('/api/settings', (req, res) => {
    const db = readDb();
    db.settings = { ...db.settings, ...req.body };
    writeDb(db);
    res.json({ success: true, settings: db.settings });
  });

  app.post('/api/reset', (req, res) => {
    writeDb(defaultData);
    res.json({ success: true, message: 'Database reset to default data' });
  });

  // --- Serve Frontend ---
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Madinul Qutaba DARS System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
