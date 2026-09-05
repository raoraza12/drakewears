require('dotenv').config();
const { Pool } = require('pg');

async function test() {
  console.log("Testing with URL encoding...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('SUCCESS URL ENCODED:', res.rows[0]);
  } catch (err) {
    console.error('FAILED URL ENCODED:', err.message);
  }
  
  console.log("\nTesting WITHOUT URL encoding...");
  const rawUrl = process.env.DATABASE_URL.replace('pak12345%21%40%23%24%2578', 'pak12345!@#$%78');
  const pool2 = new Pool({ connectionString: rawUrl });
  try {
    const res2 = await pool2.query('SELECT NOW()');
    console.log('SUCCESS RAW:', res2.rows[0]);
  } catch (err) {
    console.error('FAILED RAW:', err.message);
  }
}
test();
