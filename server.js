const express = require('express');
const path = require('path');
const { pool, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products ORDER BY id DESC'
    );

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [Number(req.params.id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// CREATE product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        error: 'name and price are required',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO products (name, description, price)
       VALUES (?, ?, ?)`,
      [name, description || '', Number(price)]
    );

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// UPDATE product
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [existingRows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = existingRows[0];

    const { name, description, price } = req.body;

    await pool.execute(
      `UPDATE products
       SET name = ?, description = ?, price = ?
       WHERE id = ?`,
      [
        name ?? existing.name,
        description ?? existing.description,
        price !== undefined ? Number(price) : existing.price,
        id,
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

startServer();