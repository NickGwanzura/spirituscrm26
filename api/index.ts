// Vercel Serverless API entry point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, initDB } from '../server/db.js';
import { authMiddleware, register, login, getCurrentUser, AuthRequest } from '../server/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.post('/auth/register', register);
app.post('/auth/login', login);
app.get('/auth/me', authMiddleware, getCurrentUser);

// Protected middleware
const protectedRoute = authMiddleware;

// --- CLIENTS API ---
app.get('/clients', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

app.post('/clients', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { name, company, email, status, avatar, customFields } = req.body;
    const result = await pool.query(
      'INSERT INTO clients (name, company, email, status, avatar, custom_fields) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, company, email, status, avatar, JSON.stringify(customFields || {})]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

app.put('/clients/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, company, email, status, avatar, customFields } = req.body;
    const result = await pool.query(
      'UPDATE clients SET name = $1, company = $2, email = $3, status = $4, avatar = $5, custom_fields = $6 WHERE id = $7 RETURNING *',
      [name, company, email, status, avatar, JSON.stringify(customFields || {}), id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

app.delete('/clients/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// --- PROJECTS API ---
app.get('/projects', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/projects', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { client_id, name, type, status, start_date, end_date, budget, progress } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (client_id, name, type, status, start_date, end_date, budget, progress) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [client_id, name, type, status, start_date, end_date, budget, progress]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/projects/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { client_id, name, type, status, start_date, end_date, budget, progress } = req.body;
    const result = await pool.query(
      'UPDATE projects SET client_id = $1, name = $2, type = $3, status = $4, start_date = $5, end_date = $6, budget = $7, progress = $8 WHERE id = $9 RETURNING *',
      [client_id, name, type, status, start_date, end_date, budget, progress, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/projects/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// --- INVOICES API ---
app.get('/invoices', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.post('/invoices', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { invoice_number, client_id, client_name, amount, status, issue_date, due_date } = req.body;
    const result = await pool.query(
      'INSERT INTO invoices (invoice_number, client_id, client_name, amount, status, issue_date, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [invoice_number, client_id, client_name, amount, status, issue_date, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.put('/invoices/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { invoice_number, client_id, client_name, amount, status, issue_date, due_date } = req.body;
    const result = await pool.query(
      'UPDATE invoices SET invoice_number = $1, client_id = $2, client_name = $3, amount = $4, status = $5, issue_date = $6, due_date = $7 WHERE id = $8 RETURNING *',
      [invoice_number, client_id, client_name, amount, status, issue_date, due_date, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

app.delete('/invoices/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM invoices WHERE id = $1', [id]);
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// --- HOSTING PACKAGES API ---
app.get('/hosting', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM hosting_packages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hosting packages' });
  }
});

// --- SOPS API ---
app.get('/sops', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM sops ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SOPs' });
  }
});

app.post('/sops', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { title, category, content } = req.body;
    const result = await pool.query(
      'INSERT INTO sops (title, category, content) VALUES ($1, $2, $3) RETURNING *',
      [title, category, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create SOP' });
  }
});

app.put('/sops/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, category, content } = req.body;
    const result = await pool.query(
      'UPDATE sops SET title = $1, category = $2, content = $3, last_updated = CURRENT_DATE WHERE id = $4 RETURNING *',
      [title, category, content, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update SOP' });
  }
});

app.delete('/sops/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sops WHERE id = $1', [id]);
    res.json({ message: 'SOP deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete SOP' });
  }
});

// --- CONTRACTS API ---
app.get('/contracts', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM contracts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

app.post('/contracts', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { client_id, client_name, type, content, status } = req.body;
    const result = await pool.query(
      'INSERT INTO contracts (client_id, client_name, type, content, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [client_id, client_name, type, content, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

app.put('/contracts/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { client_id, client_name, type, content, status } = req.body;
    const result = await pool.query(
      'UPDATE contracts SET client_id = $1, client_name = $2, type = $3, content = $4, status = $5 WHERE id = $6 RETURNING *',
      [client_id, client_name, type, content, status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// --- ONBOARDING API ---
app.get('/onboarding', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM onboarding_workflows ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch onboarding workflows' });
  }
});

app.post('/onboarding', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { client_id, client_name, template_name, status, start_date, tasks } = req.body;
    const result = await pool.query(
      'INSERT INTO onboarding_workflows (client_id, client_name, template_name, status, start_date, tasks) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [client_id, client_name, template_name, status, start_date, JSON.stringify(tasks || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create onboarding workflow' });
  }
});

app.put('/onboarding/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { client_id, client_name, template_name, status, start_date, tasks } = req.body;
    const result = await pool.query(
      'UPDATE onboarding_workflows SET client_id = $1, client_name = $2, template_name = $3, status = $4, start_date = $5, tasks = $6 WHERE id = $7 RETURNING *',
      [client_id, client_name, template_name, status, start_date, JSON.stringify(tasks || []), id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update onboarding workflow' });
  }
});

// --- USERS API ---
app.get('/users', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, role, avatar, last_login FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.delete('/users/:id', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Dashboard stats
app.get('/dashboard', protectedRoute, async (req: AuthRequest, res) => {
  try {
    const clients = await pool.query('SELECT COUNT(*) FROM clients');
    const projects = await pool.query('SELECT COUNT(*) FROM projects');
    const invoices = await pool.query('SELECT SUM(amount) FROM invoices WHERE status = $1', ['Paid']);
    const activeProjects = await pool.query('SELECT COUNT(*) FROM projects WHERE status != $1', ['Completed']);

    res.json({
      totalClients: parseInt(clients.rows[0].count),
      totalProjects: parseInt(projects.rows[0].count),
      totalRevenue: parseInt(invoices.rows[0].sum) || 0,
      activeProjects: parseInt(activeProjects.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database
initDB().catch(console.error);

// Export for Vercel
export default app;
