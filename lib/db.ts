import { Pool } from "pg"

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase/serverless optimized settings
  max: 5, // Reduced for Supabase pooler
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
})

// Test the connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database")
})

// Don't crash the server on idle connection errors - just log them
pool.on("error", (err) => {
  console.error("Pool error (non-fatal):", err.message)
  // Don't exit - let the pool recover
})

export default pool

/**
 * Execute a SQL query
 * @param text SQL query string
 * @param params Query parameters
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log("Executed query", { text, duration, rows: res.rowCount })
  return res
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
  const client = await pool.connect()
  const originalRelease = client.release.bind(client)

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!")
  }, 5000)

  // Override the release method to clear the timeout
  client.release = () => {
    clearTimeout(timeout)
    client.release = originalRelease
    return originalRelease()
  }

  return client
}
