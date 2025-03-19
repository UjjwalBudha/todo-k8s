const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;
let retryCount = 0;
const MAX_RETRIES = 10;

const initializeDatabase = async () => {
  try {
    console.log('Attempting to connect to MySQL...');
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'database',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'test123',
      database: process.env.DB_NAME || 'todo_db',
    });
    
    // Create todos table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Retrying connection in 5 seconds... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(initializeDatabase, 5000);
    }
  }
};

// Check database connection before processing requests
const ensureDbConnection = async (req, res, next) => {
  if (!db) {
    return res.status(503).json({ message: 'Database connection not established yet. Please try again later.' });
  }
  next();
};

// Apply middleware to API routes
app.use('/api', ensureDbConnection);

// Routes
app.get('/api/todos', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ message: 'Task is required' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO todos (task) VALUES (?)',
      [task]
    );
    
    const [newTodo] = await db.execute(
      'SELECT * FROM todos WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newTodo[0]);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    
    await db.execute(
      'UPDATE todos SET completed = ? WHERE id = ?',
      [completed, id]
    );
    
    const [updatedTodo] = await db.execute(
      'SELECT * FROM todos WHERE id = ?',
      [id]
    );
    
    if (updatedTodo.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    res.json(updatedTodo[0]);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.execute('DELETE FROM todos WHERE id = ?', [id]);
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await initializeDatabase();
});