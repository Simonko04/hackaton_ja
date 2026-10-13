import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL;
const pool = connectionString ? new Pool({ connectionString }) : null;

async function ensureTables() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      schema JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `);
}

ensureTables().catch((error) => {
  console.error('DB init failed:', error);
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: pool ? 'postgres' : 'memory' });
});

app.get('/api/templates', async (_req, res) => {
  if (!pool) {
    return res.json([]);
  }

  const result = await pool.query('SELECT * FROM templates ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/api/templates', async (req, res) => {
  const { name, schema } = req.body ?? {};
  if (!name || !schema) {
    return res.status(400).json({ error: 'Missing name or schema' });
  }

  if (!pool) {
    return res.json({ id: Date.now(), name, schema, created_at: new Date().toISOString() });
  }

  const result = await pool.query(
    'INSERT INTO templates (name, schema) VALUES ($1, $2) RETURNING *',
    [name, schema]
  );

  res.status(201).json(result.rows[0]);
});

app.post('/api/submissions', async (req, res) => {
  const { templateId, data } = req.body ?? {};
  if (!data) {
    return res.status(400).json({ error: 'Missing data' });
  }

  if (!pool) {
    return res.json({ id: Date.now(), template_id: templateId ?? null, data, created_at: new Date().toISOString() });
  }

  const result = await pool.query(
    'INSERT INTO submissions (template_id, data) VALUES ($1, $2) RETURNING *',
    [templateId ?? null, data]
  );

  res.status(201).json(result.rows[0]);
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
