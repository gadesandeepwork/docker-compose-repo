const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'exampleuser',
  password: process.env.DB_PASSWORD || 'examplepassword',
  database: process.env.DB_NAME || 'exampledb',
  waitForConnections: true,
  connectionLimit: 10,
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL DEFAULT 0
    )
  `);
}

module.exports = {
  pool,
  initializeDatabase,
};