import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { Client } from 'pg'
import { Connector } from '@google-cloud/cloud-sql-connector'

// Basic configuration via env vars
const INSTANCE_CONNECTION_NAME = process.env.INSTANCE_CONNECTION_NAME // project:region:instance
const DB_USER = process.env.DB_USER // e.g., 'postgres'
const DB_NAME = process.env.DB_NAME // database name
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const IP_TYPE = (process.env.IP_TYPE || 'PUBLIC')

if (!INSTANCE_CONNECTION_NAME || !DB_USER || !DB_NAME) {
  // eslint-disable-next-line no-console
  console.warn('[WARN] Missing required env: INSTANCE_CONNECTION_NAME, DB_USER, DB_NAME')
}

const app = express()
app.use(express.json())
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : [CORS_ORIGIN] }))

// health
app.get('/health', (_req, res) => res.status(200).send('ok'))

// helper: create pg client using Cloud SQL connector and a password provided per request
async function createClient(dbPassword) {
  const connector = new Connector()
  const clientOpts = await connector.getOptions({
    instanceConnectionName: INSTANCE_CONNECTION_NAME,
    ipType: IP_TYPE,
  })
  const client = new Client({
    ...clientOpts,
    user: DB_USER,
    password: dbPassword,
    database: DB_NAME,
  })
  await client.connect()
  return { client, connector }
}

// POST /submissions
// body: { admin: { userId, repeatCount, dbPassword }, answers: [{ id, value }] }
app.post('/submissions', async (req, res) => {
  try {
    const { admin, answers } = req.body || {}
    if (!admin || typeof admin.userId !== 'string' || !admin.userId.trim()) {
      return res.status(400).json({ error: 'Invalid admin.userId' })
    }
    const repeatCount = Number(admin.repeatCount)
    if (!Number.isInteger(repeatCount) || repeatCount < 1) {
      return res.status(400).json({ error: 'Invalid admin.repeatCount' })
    }
    const dbPassword = admin.dbPassword
    if (typeof dbPassword !== 'string' || dbPassword.length === 0) {
      return res.status(400).json({ error: 'admin.dbPassword is required' })
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'answers must be a non-empty array' })
    }
    for (const a of answers) {
      if (typeof a?.id !== 'string' || a.id.length === 0) {
        return res.status(400).json({ error: 'answers[].id must be string' })
      }
      if (typeof a?.value !== 'number' || !Number.isFinite(a.value)) {
        return res.status(400).json({ error: 'answers[].value must be a finite number' })
      }
    }

    const submissionId = randomUUID()
    const { client, connector } = await createClient(dbPassword)
    try {
      await client.query('BEGIN')
      await client.query(
        'INSERT INTO submissions (id, user_id, repeat_count) VALUES ($1, $2, $3)',
        [submissionId, admin.userId.trim(), repeatCount]
      )
      const values = []
      const placeholders = []
      answers.forEach((a, idx) => {
        const base = idx * 3
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`)
        values.push(submissionId, a.id, a.value)
      })
      await client.query(
        `INSERT INTO submission_answers (submission_id, question_id, value) VALUES ${placeholders.join(',')}`,
        values
      )
      await client.query('COMMIT')
      res.status(201).json({ id: submissionId })
    } catch (err) {
      await client.query('ROLLBACK')
      // eslint-disable-next-line no-console
      console.error(err)
      res.status(500).json({ error: 'Failed to save submission' })
    } finally {
      await client.end()
      connector.close()
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    res.status(500).json({ error: 'Unexpected error' })
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on ${port}`)
})
