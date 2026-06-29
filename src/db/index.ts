import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString:config.connection_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20) NOT NULL,
      email  VARCHAR(20) NOT NULL,
      password VARCHAR(20) NOT NULL,
      role VARCHAR(10) DEFAULT 'contributor',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()


      )
      `);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
