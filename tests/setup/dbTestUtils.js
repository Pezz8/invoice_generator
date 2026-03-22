import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import pool from '../../src/db/client.js';

export async function beginTransaction() {
  await pool.query('BEGIN');
}

export async function rollbackTransaction() {
  await pool.query('ROLLBACK');
}

export async function closeDb() {
  await pool.end();
}

export { pool };
