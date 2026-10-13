import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import cors from 'cors'
import { Pool } from 'pg'

const app = express()
app.use(cors())
app.use(express.json())

const DB_FILE = path.join(__dirname, '..', 'db.json')

const DATABASE_URL = process.env.DATABASE_URL || ''
let pool: Pool | null = null
if(DATABASE_URL){
  pool = new Pool({ connectionString: DATABASE_URL })
}

async function ensureTables(){
  if(!pool) return
  await pool.query(`CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    schema JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  )`)

  await pool.query(`CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  )`)
}

async function readDBFile(){
  try{
    const txt = await fs.readFile(DB_FILE, 'utf-8')
    return JSON.parse(txt)
  }catch(e){
    return { templates: [], submissions: [] }
  }
}
async function writeDBFile(obj:any){
  await fs.writeFile(DB_FILE, JSON.stringify(obj, null, 2), 'utf-8')
}

// Initialize DB tables if Postgres available
if(pool){
  ensureTables().catch(err=>{
    console.error('Failed to ensure tables', err)
  })
}

// Helper: convert array of JSON objects to CSV (union of keys)
function jsonArrayToCSV(items: any[]){
  if(!items || items.length === 0) return ''
  const keys = Array.from(items.reduce((s, it) => { Object.keys(it).forEach(k=>s.add(k)); return s }, new Set<string>()))
  const header = keys.join(',')
  const rows = items.map(it => keys.map(k => {
    const v = it[k]
    if(v === null || v === undefined) return ''
    if(typeof v === 'object') return '"'+JSON.stringify(v).replace(/"/g,'""')+'"'
    return '"'+String(v).replace(/"/g,'""')+'"'
  }).join(','))
  return [header, ...rows].join('\n')
}

// Templates
app.get('/api/templates', async (req, res)=>{
  try{
    if(pool){
      const r = await pool.query('SELECT id, name, schema, created_at FROM templates ORDER BY id DESC')
      return res.json(r.rows)
    }
    const db = await readDBFile()
    res.json(db.templates || [])
  }catch(e){ console.error(e); res.status(500).json({error:'internal'}) }
})

app.get('/api/templates/:id', async (req, res)=>{
  try{
    const id = Number(req.params.id)
    if(pool){
      const r = await pool.query('SELECT id, name, schema, created_at FROM templates WHERE id=$1', [id])
      if(r.rowCount === 0) return res.status(404).json({error:'not found'})
      return res.json(r.rows[0])
    }
    const db = await readDBFile()
    const t = (db.templates || []).find((x:any)=>Number(x.id) === id)
    if(!t) return res.status(404).json({error:'not found'})
    res.json(t)
  }catch(e){ console.error(e); res.status(500).json({error:'internal'}) }
})

app.post('/api/templates', async (req, res)=>{
  try{
    const { name, schema } = req.body
    if(!name || !schema) return res.status(400).json({ error:'name and schema required' })
    if(pool){
      const r = await pool.query('INSERT INTO templates(name, schema) VALUES($1, $2) RETURNING id, name, schema, created_at', [name, schema])
      return res.json(r.rows[0])
    }
    const db = await readDBFile()
    const id = Date.now()
    const item = { id, name, schema, created_at: new Date().toISOString() }
    db.templates = db.templates || []
    db.templates.push(item)
    await writeDBFile(db)
    res.json(item)
  }catch(e){ console.error(e); res.status(500).json({error:'internal'}) }
})

// Delete template
app.delete('/api/templates/:id', async (req, res) => {
  try{
    const id = Number(req.params.id)
    if(pool){
      await pool.query('DELETE FROM templates WHERE id=$1', [id])
      return res.json({ ok: true })
    }
    const db = await readDBFile()
    db.templates = (db.templates || []).filter((t:any)=>Number(t.id)!==id)
    await writeDBFile(db)
    res.json({ ok: true })
  }catch(e){ console.error(e); res.status(500).json({error:'internal'}) }
})

// Submissions endpoint
app.post('/api/submissions', async (req, res)=>{
  try{
    const { templateId, data } = req.body
    if(!data) return res.status(400).json({ error:'data required' })
    if(pool){
      const r = await pool.query('INSERT INTO submissions(template_id, data) VALUES($1, $2) RETURNING id, template_id, data, created_at', [templateId || null, data])
      return res.json(r.rows[0])
    }
    const db = await readDBFile()
    const id = Date.now()
    const item = { id, template_id: templateId || null, data, created_at: new Date().toISOString() }
    db.submissions = db.submissions || []
    db.submissions.push(item)
    await writeDBFile(db)
    res.json(item)
  }catch(e){ console.error(e); res.status(500).json({error:'internal'}) }
})

// List submissions (optionally filter by templateId)
app.get('/api/submissions', async (req, res) => {
  try{
    const templateId = req.query.templateId ? Number(req.query.templateId) : null
    if(pool){
      if(templateId){
        const r = await pool.query('SELECT id, template_id, data, created_at FROM submissions WHERE template_id=$1 ORDER BY id DESC', [templateId])
        return res.json(r.rows)
      }
      const r = await pool.query('SELECT id, template_id, data, created_at FROM submissions ORDER BY id DESC')
      return res.json(r.rows)
    }
    const db = await readDBFile()
    let subs = db.submissions || []
    if(templateId) subs = subs.filter((s:any)=>Number(s.template_id) === templateId)
    res.json(subs)
  }catch(e){ console.error(e); res.status(500).json({error:'internal'}) }
})

app.get('/api/submissions/:id', async (req, res) => {
  try{
    const id = Number(req.params.id)
    if(pool){
      const r = await pool.query('SELECT id, template_id, data, created_at FROM submissions WHERE id=$1', [id])
      if(r.rowCount === 0) return res.status(404).json({error:'not found'})
      return res.json(r.rows[0])
    }
    const db = await readDBFile()
    const s = (db.submissions || []).find((x:any)=>Number(x.id) === id)
    if(!s) return res.status(404).json({error:'not found'})
    res.json(s)
  }catch(e){ console.error(e); res.status(500).json({error:'internal'}) }
})

// Export submissions for a template as CSV
app.get('/api/templates/:id/export.csv', async (req, res) => {
  try{
    const id = Number(req.params.id)
    if(pool){
      const r = await pool.query('SELECT data FROM submissions WHERE template_id=$1 ORDER BY id ASC', [id])
      const items = r.rows.map((row:any) => row.data)
      const csv = jsonArrayToCSV(items)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="template-${id}-submissions.csv"`)
      return res.send(csv)
    }
    const db = await readDBFile()
    const items = (db.submissions || []).filter((s:any)=>Number(s.template_id)===id).map((s:any)=>s.data)
    const csv = jsonArrayToCSV(items)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="template-${id}-submissions.csv"`)
    res.send(csv)
  }catch(e){ console.error(e); res.status(500).json({error:'internal'}) }
})

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log('Backend listening on '+port))
