import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Auth helpers
const hashPassword = (password: string) => bcrypt.hash(password, 10);
const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
const generateToken = (userId: number, email: string, role: string) => 
  jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });

const verifyToken = (token: string) => jwt.verify(token, JWT_SECRET);

const getAuthUser = (req: VercelRequest) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
};

const requireAuth = (req: VercelRequest, res: VercelResponse) => {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
};

// Initialize DB (run once)
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Viewer',
        avatar TEXT,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        avatar TEXT,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        status VARCHAR(100) DEFAULT 'Planning',
        start_date DATE,
        end_date DATE,
        budget INTEGER,
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        client_name VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        issue_date DATE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS hosting_packages (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        app_name VARCHAR(255) NOT NULL,
        monthly_cost INTEGER NOT NULL,
        last_payment_date DATE,
        next_payment_date DATE,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sops (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        last_updated DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS contracts (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        client_name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS onboarding_workflows (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
        client_name VARCHAR(255) NOT NULL,
        template_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        start_date DATE,
        tasks JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } finally {
    client.release();
  }
};

// Run init
initDB().catch(console.error);

// CORS headers
const setCORS = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORS(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url?.replace('/api', '') || '/';
  const method = req.method;

  try {
    // Health check
    if (path === '/health' && method === 'GET') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Auth routes
    if (path === '/auth/login' && method === 'POST') {
      const { email, password } = req.body;
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
      
      const user = result.rows[0];
      const valid = await comparePassword(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      
      await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
      const token = generateToken(user.id, user.email, user.role);
      return res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar }, token });
    }

    if (path === '/auth/register' && method === 'POST') {
      const { email, password, name, role = 'Viewer' } = req.body;
      const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) return res.status(400).json({ error: 'User exists' });
      
      const hash = await hashPassword(password);
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
        [email, hash, name, role]
      );
      const user = result.rows[0];
      const token = generateToken(user.id, user.email, user.role);
      return res.status(201).json({ user, token });
    }

    if (path === '/auth/me' && method === 'GET') {
      const user = requireAuth(req, res);
      if (!user) return;
      const result = await pool.query('SELECT id, email, name, role, avatar, last_login FROM users WHERE id = $1', [user.id]);
      return res.json({ user: result.rows[0] });
    }

    // Protected routes
    const user = requireAuth(req, res);
    if (!user) return;

    // Dashboard
    if (path === '/dashboard' && method === 'GET') {
      const clients = await pool.query('SELECT COUNT(*) FROM clients');
      const projects = await pool.query('SELECT COUNT(*) FROM projects');
      const invoices = await pool.query('SELECT SUM(amount) FROM invoices WHERE status = $1', ['Paid']);
      const activeProjects = await pool.query('SELECT COUNT(*) FROM projects WHERE status != $1', ['Completed']);
      return res.json({
        totalClients: parseInt(clients.rows[0].count),
        totalProjects: parseInt(projects.rows[0].count),
        totalRevenue: parseInt(invoices.rows[0].sum) || 0,
        activeProjects: parseInt(activeProjects.rows[0].count)
      });
    }

    // Clients
    if (path === '/clients') {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
        return res.json(result.rows);
      }
      if (method === 'POST') {
        const { name, company, email, status, avatar, customFields } = req.body;
        const result = await pool.query(
          'INSERT INTO clients (name, company, email, status, avatar, custom_fields) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [name, company, email, status, avatar, JSON.stringify(customFields || {})]
        );
        return res.status(201).json(result.rows[0]);
      }
    }

    if (path.startsWith('/clients/')) {
      const id = path.split('/')[2];
      if (method === 'PUT') {
        const { name, company, email, status, avatar, customFields } = req.body;
        const result = await pool.query(
          'UPDATE clients SET name = $1, company = $2, email = $3, status = $4, avatar = $5, custom_fields = $6 WHERE id = $7 RETURNING *',
          [name, company, email, status, avatar, JSON.stringify(customFields || {}), id]
        );
        return res.json(result.rows[0]);
      }
      if (method === 'DELETE') {
        await pool.query('DELETE FROM clients WHERE id = $1', [id]);
        return res.json({ message: 'Deleted' });
      }
    }

    // Projects
    if (path === '/projects') {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
        return res.json(result.rows);
      }
      if (method === 'POST') {
        const { client_id, name, type, status, start_date, end_date, budget, progress } = req.body;
        const result = await pool.query(
          'INSERT INTO projects (client_id, name, type, status, start_date, end_date, budget, progress) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
          [client_id, name, type, status, start_date, end_date, budget, progress]
        );
        return res.status(201).json(result.rows[0]);
      }
    }

    if (path.startsWith('/projects/')) {
      const id = path.split('/')[2];
      if (method === 'PUT') {
        const { client_id, name, type, status, start_date, end_date, budget, progress } = req.body;
        const result = await pool.query(
          'UPDATE projects SET client_id = $1, name = $2, type = $3, status = $4, start_date = $5, end_date = $6, budget = $7, progress = $8 WHERE id = $9 RETURNING *',
          [client_id, name, type, status, start_date, end_date, budget, progress, id]
        );
        return res.json(result.rows[0]);
      }
      if (method === 'DELETE') {
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
        return res.json({ message: 'Deleted' });
      }
    }

    // Invoices
    if (path === '/invoices') {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
        return res.json(result.rows);
      }
      if (method === 'POST') {
        const { invoice_number, client_id, client_name, amount, status, issue_date, due_date } = req.body;
        const result = await pool.query(
          'INSERT INTO invoices (invoice_number, client_id, client_name, amount, status, issue_date, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [invoice_number, client_id, client_name, amount, status, issue_date, due_date]
        );
        return res.status(201).json(result.rows[0]);
      }
    }

    if (path.startsWith('/invoices/')) {
      const id = path.split('/')[2];
      if (method === 'PUT') {
        const { invoice_number, client_id, client_name, amount, status, issue_date, due_date } = req.body;
        const result = await pool.query(
          'UPDATE invoices SET invoice_number = $1, client_id = $2, client_name = $3, amount = $4, status = $5, issue_date = $6, due_date = $7 WHERE id = $8 RETURNING *',
          [invoice_number, client_id, client_name, amount, status, issue_date, due_date, id]
        );
        return res.json(result.rows[0]);
      }
      if (method === 'DELETE') {
        await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
        return res.json({ message: 'Deleted' });
      }
    }

    // Hosting
    if (path === '/hosting' && method === 'GET') {
      const result = await pool.query('SELECT * FROM hosting_packages ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    // SOPs
    if (path === '/sops') {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM sops ORDER BY created_at DESC');
        return res.json(result.rows);
      }
      if (method === 'POST') {
        const { title, category, content } = req.body;
        const result = await pool.query(
          'INSERT INTO sops (title, category, content) VALUES ($1, $2, $3) RETURNING *',
          [title, category, content]
        );
        return res.status(201).json(result.rows[0]);
      }
    }

    if (path.startsWith('/sops/')) {
      const id = path.split('/')[2];
      if (method === 'PUT') {
        const { title, category, content } = req.body;
        const result = await pool.query(
          'UPDATE sops SET title = $1, category = $2, content = $3, last_updated = CURRENT_DATE WHERE id = $4 RETURNING *',
          [title, category, content, id]
        );
        return res.json(result.rows[0]);
      }
      if (method === 'DELETE') {
        await pool.query('DELETE FROM sops WHERE id = $1', [id]);
        return res.json({ message: 'Deleted' });
      }
    }

    // Contracts
    if (path === '/contracts') {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC');
        return res.json(result.rows);
      }
      if (method === 'POST') {
        const { client_id, client_name, type, content, status } = req.body;
        const result = await pool.query(
          'INSERT INTO contracts (client_id, client_name, type, content, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [client_id, client_name, type, content, status]
        );
        return res.status(201).json(result.rows[0]);
      }
    }

    if (path.startsWith('/contracts/')) {
      const id = path.split('/')[2];
      if (method === 'PUT') {
        const { client_id, client_name, type, content, status } = req.body;
        const result = await pool.query(
          'UPDATE contracts SET client_id = $1, client_name = $2, type = $3, content = $4, status = $5 WHERE id = $6 RETURNING *',
          [client_id, client_name, type, content, status, id]
        );
        return res.json(result.rows[0]);
      }
    }

    // Onboarding
    if (path === '/onboarding') {
      if (method === 'GET') {
        const result = await pool.query('SELECT * FROM onboarding_workflows ORDER BY created_at DESC');
        return res.json(result.rows);
      }
      if (method === 'POST') {
        const { client_id, client_name, template_name, status, start_date, tasks } = req.body;
        const result = await pool.query(
          'INSERT INTO onboarding_workflows (client_id, client_name, template_name, status, start_date, tasks) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [client_id, client_name, template_name, status, start_date, JSON.stringify(tasks || [])]
        );
        return res.status(201).json(result.rows[0]);
      }
    }

    if (path.startsWith('/onboarding/')) {
      const id = path.split('/')[2];
      if (method === 'PUT') {
        const { client_id, client_name, template_name, status, start_date, tasks } = req.body;
        const result = await pool.query(
          'UPDATE onboarding_workflows SET client_id = $1, client_name = $2, template_name = $3, status = $4, start_date = $5, tasks = $6 WHERE id = $7 RETURNING *',
          [client_id, client_name, template_name, status, start_date, JSON.stringify(tasks || []), id]
        );
        return res.json(result.rows[0]);
      }
    }

    // Users
    if (path === '/users') {
      if (method === 'GET') {
        const result = await pool.query('SELECT id, email, name, role, avatar, last_login FROM users ORDER BY created_at DESC');
        return res.json(result.rows);
      }
    }

    if (path.startsWith('/users/') && method === 'DELETE') {
      const id = path.split('/')[2];
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return res.json({ message: 'Deleted' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
