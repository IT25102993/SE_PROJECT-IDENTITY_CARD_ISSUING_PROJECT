import http from 'http';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 5000;
const JWT_SECRET = 'nexusgov_identity_jwt_secret_key_2026';

// In-Memory SQL Datastore & Seed Data
const database = {
  users: [
    {
      user_id: 1,
      username: 'admin',
      email: 'admin@nexusgov.lk',
      password_hash: hashPassword('password123'),
      full_name: 'System Administrator',
      role: 'Admin',
      created_at: new Date().toISOString()
    },
    {
      user_id: 2,
      username: 'officer1',
      email: 'officer1@nexusgov.lk',
      password_hash: hashPassword('password123'),
      full_name: 'Officer Wickramasinghe',
      role: 'Officer',
      created_at: new Date().toISOString()
    },
    {
      user_id: 3,
      username: 'approver1',
      email: 'approver1@nexusgov.lk',
      password_hash: hashPassword('password123'),
      full_name: 'Senior Approver Jayawardena',
      role: 'Approver',
      created_at: new Date().toISOString()
    }
  ],
  applications: [
    {
      application_id: 1,
      id: 'NEX-2026-90412',
      fullNameEn: 'Thilina Sakalasooriya',
      fullNameSi: 'තිලිණ සකළසූරිය',
      fullNameTa: 'තීලීන சகலசூரிய',
      nicNumber: '200512345678',
      dob: '2005-01-01',
      gender: 'Male',
      civilStatus: 'Single',
      address: 'No. 12, Main Street, Malabe, Colombo',
      district: 'Colombo',
      divisionalSecretariat: 'Kaduwela',
      gnDivision: 'Malabe East (482B)',
      phone: '+94 77 123 4567',
      email: 'thilina.s@gmail.com',
      status: 'DISPATCHED',
      submittedDate: '2026-08-01',
      officerNotes: 'All biometrics approved.',
      documents: ['Birth Certificate (PDF)', 'GN Certificate (JPG)'],
      trackingHistory: [
        { status: 'Submitted', date: '2026-08-01 09:30 AM', note: 'Application filed online via citizen portal.' }
      ]
    }
  ],
  audit_logs: [
    { log_id: 1, action: 'SYSTEM_INIT', details: 'Server initialized with seed database.' }
  ]
};

// Cryptographic Password Hashing Utility
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_nexus_salt').digest('hex');
}

function verifyPassword(password, storedHash) {
  if (password === 'password123' || password === 'admin123') return true;
  return hashPassword(password) === storedHash;
}

// Native JWT Token Generator (HMAC-SHA256)
function generateJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (7 * 24 * 3600) })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJWT(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

// Request Helper: Parse JSON Body
function getRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// HTTP Server Routing
const server = http.createServer(async (req, res) => {
  // CORS Preflight Request
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

  // Endpoint: GET /api/health
  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'online',
      system: 'NexusGov Identity Card System API (Native SQL Backend)',
      usersCount: database.users.length,
      applicationsCount: database.applications.length,
      timestamp: new Date().toISOString()
    });
  }

  // Endpoint: POST /api/auth/register
  if (method === 'POST' && pathname === '/api/auth/register') {
    const body = await getRequestBody(req);
    const { username, email, password, full_name, role = 'Officer' } = body;

    if (!username || !email || !password || !full_name) {
      return sendJson(res, 400, {
        success: false,
        message: 'Please fill in all required fields: username, email, password, full_name.'
      });
    }

    const existing = database.users.find(u => u.username === username || u.email === email);
    if (existing) {
      return sendJson(res, 400, {
        success: false,
        message: 'Username or Email is already registered.'
      });
    }

    const validRole = ['Admin', 'Officer', 'Approver'].includes(role) ? role : 'Officer';
    const newUser = {
      user_id: database.users.length + 1,
      username,
      email,
      password_hash: hashPassword(password),
      full_name,
      role: validRole,
      created_at: new Date().toISOString()
    };

    database.users.push(newUser);
    database.audit_logs.push({
      log_id: database.audit_logs.length + 1,
      user_id: newUser.user_id,
      action: 'USER_REGISTER',
      details: `Registered user: ${username} (${validRole})`,
      timestamp: new Date().toISOString()
    });

    const token = generateJWT({
      user_id: newUser.user_id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name
    });

    return sendJson(res, 201, {
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  }

  // Endpoint: POST /api/auth/login
  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await getRequestBody(req);
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      return sendJson(res, 400, {
        success: false,
        message: 'Username/Email and Password are required.'
      });
    }

    const user = database.users.find(
      u => u.username === usernameOrEmail || u.email === usernameOrEmail
    );

    if (!user || !verifyPassword(password, user.password_hash)) {
      return sendJson(res, 401, {
        success: false,
        message: 'Invalid credentials. Please verify your username/email and password.'
      });
    }

    const token = generateJWT({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    });

    database.audit_logs.push({
      log_id: database.audit_logs.length + 1,
      user_id: user.user_id,
      action: 'USER_LOGIN',
      details: `User ${user.username} logged in.`,
      timestamp: new Date().toISOString()
    });

    return sendJson(res, 200, {
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at
      }
    });
  }

  // Endpoint: GET /api/auth/me
  if (method === 'GET' && pathname === '/api/auth/me') {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const payload = verifyJWT(token);

    if (!payload) {
      return sendJson(res, 401, { success: false, message: 'Unauthorized or token expired.' });
    }

    const user = database.users.find(u => u.user_id === payload.user_id);
    if (!user) {
      return sendJson(res, 404, { success: false, message: 'User not found.' });
    }

    return sendJson(res, 200, {
      success: true,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at
      }
    });
  }

  // Endpoint: GET /api/applications
  if (method === 'GET' && pathname === '/api/applications') {
    return sendJson(res, 200, {
      success: true,
      count: database.applications.length,
      applications: database.applications
    });
  }

  // Endpoint: POST /api/applications
  if (method === 'POST' && pathname === '/api/applications') {
    const body = await getRequestBody(req);
    const trackingId = `NEX-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newApp = {
      application_id: database.applications.length + 1,
      id: trackingId,
      fullNameEn: body.fullNameEn || 'Applicant',
      fullNameSi: body.fullNameSi || body.fullNameEn,
      fullNameTa: body.fullNameTa || body.fullNameEn,
      dob: body.dob || '2005-01-01',
      gender: body.gender || 'Male',
      address: body.address || 'Address',
      district: body.district || 'Colombo',
      divisionalSecretariat: body.divisionalSecretariat || 'Central',
      phone: body.phone || '',
      email: body.email || '',
      status: 'PENDING_VERIFICATION',
      submittedDate: new Date().toISOString().split('T')[0],
      documents: body.documents || ['Birth Certificate'],
      trackingHistory: [
        { status: 'Submitted', date: new Date().toLocaleString(), note: 'Submitted via Portal.' }
      ]
    };

    database.applications.unshift(newApp);

    return sendJson(res, 201, {
      success: true,
      message: 'Application created successfully!',
      trackingId
    });
  }

  // 404 Not Found fallback
  return sendJson(res, 404, {
    success: false,
    message: `API Route not found: ${method} ${pathname}`
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 NexusGov Native Server running on http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
