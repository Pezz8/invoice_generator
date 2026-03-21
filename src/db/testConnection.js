import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import pool from './client.js';

async function testConnection() {
  try {
    const result = await pool.query(`
      SELECT NOW() AS now, current_database() AS db, current_user AS user
    `);

    console.log('Connected successfully:');
    console.log(result.rows[0]);

    const tables = await pool.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `);

    console.log('\nTables found:');
    console.table(tables.rows);
  } catch (error) {
    console.error('Connection failed:');
    console.error(error);
  } finally {
    await pool.end();
  }
}

testConnection();
