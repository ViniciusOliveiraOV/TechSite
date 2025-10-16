const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

require('dotenv').config();

const db = new sqlite3.Database(path.resolve(__dirname, '../db/complaints.db'));

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 registration attempts per windowMs
  message: {
    error: 'Too many registration attempts, please try again later.'
  }
});

// Input validation rules
const loginValidation = [
  body('username')
    .matches(/^[a-zA-Z0-9_]{3,20}$/)
    .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 4, max: 128 }) // Reduced min length for development
    .withMessage('Password must be between 4 and 128 characters')
];

const registerValidation = [
  body('username')
    .matches(/^[a-zA-Z0-9_]{3,20}$/)
    .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 4, max: 128 }) // Reduced min length for development
    .withMessage('Password must be between 4 and 128 characters')
    // COMMENTED OUT FOR DEVELOPMENT - Complex password requirements
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    // .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Create users table - SIMPLIFIED FOR DEVELOPMENT
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
    -- COMMENTED OUT FOR DEVELOPMENT - Advanced columns
    -- created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- last_login DATETIME,
    -- failed_login_attempts INTEGER DEFAULT 0,
    -- locked_until DATETIME
  )`);
  
  // Create default admin user (password: admin123)
  const adminPassword = bcrypt.hashSync('admin123', 10); // Reduced salt rounds for development
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`, 
    ['admin', adminPassword, 'admin']
  );
});

// Helper function to return generic error messages
const getGenericError = (type) => {
  const errors = {
    'auth': 'Authentication failed',
    'validation': 'Invalid input provided',
    'forbidden': 'Access denied',
    'server': 'Internal server error',
    'rate_limit': 'Too many requests',
    'not_found': 'Resource not found'
  };
  return errors[type] || 'An error occurred';
};

// Login route with rate limiting and validation
router.post('/login', loginLimiter, loginValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: getGenericError('validation'),
      details: process.env.NODE_ENV === 'development' ? errors.array() : undefined
    });
  }

  const { username, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ error: getGenericError('server') });
    }
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: getGenericError('auth') });
    }

    // COMMENTED OUT FOR DEVELOPMENT - Account locking
    // // Check if account is locked
    // if (user.locked_until && new Date(user.locked_until) > new Date()) {
    //   return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
    // }
    
    // Verify password
    if (!bcrypt.compareSync(password, user.password)) {
      // COMMENTED OUT FOR DEVELOPMENT - Failed attempt tracking
      // // Increment failed login attempts
      // const failedAttempts = (user.failed_login_attempts || 0) + 1;
      // let lockUntil = null;
      // 
      // // Lock account after 5 failed attempts for 30 minutes
      // if (failedAttempts >= 5) {
      //   lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      // }
      // 
      // db.run(`UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?`,
      //   [failedAttempts, lockUntil, user.id]);
      
      return res.status(401).json({ error: getGenericError('auth') });
    }
    
    // COMMENTED OUT FOR DEVELOPMENT - Reset failed attempts and update last login
    // // Reset failed login attempts on successful login
    // db.run(`UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?`,
    //   [user.id]);
    
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  });
});

// Register route with validation
router.post('/register', registerLimiter, registerValidation, (req, res) => {
  console.log('Registration attempt:', req.body); // Add this for debugging
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Add this for debugging
    return res.status(400).json({ 
      error: getGenericError('validation'),
      details: process.env.NODE_ENV === 'development' ? errors.array() : undefined
    });
  }

  const { username, password } = req.body;
  
  const hashedPassword = bcrypt.hashSync(password, 10); // Reduced salt rounds for development
  
  db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
    [username, hashedPassword, 'user'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Username already exists' });
        }
        console.error('Database error during registration:', err);
        return res.status(500).json({ error: getGenericError('server') });
      }
      
      res.status(201).json({ message: 'User created successfully' });
    }
  );
});

// Get all users (admin only)
router.get('/users', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, (req, res) => {
  // SIMPLIFIED QUERY FOR DEVELOPMENT - removed advanced columns
  db.all(`SELECT id, username, role FROM users ORDER BY id`, [], (err, users) => {
    if (err) {
      console.error('Database error fetching users:', err);
      return res.status(500).json({ error: getGenericError('server') });
    }
    res.json(users);
  });
});

// Delete user (admin only)
router.delete('/users/:id', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, (req, res) => {
  const { id } = req.params;
  
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: "You can't delete yourself" });
  }
  
  db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
    if (err) {
      console.error('Database error deleting user:', err);
      return res.status(500).json({ error: getGenericError('server') });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: getGenericError('not_found') });
    }
    
    res.json({ message: 'User deleted successfully' });
  });
});

// Update user role (admin only)
router.put('/users/:id/role', require('../middleware/auth').authenticateToken, require('../middleware/auth').requireAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: getGenericError('validation') });
  }
  
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: "You can't change your own role" });
  }
  
  db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, id], function(err) {
    if (err) {
      console.error('Database error updating user role:', err);
      return res.status(500).json({ error: getGenericError('server') });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: getGenericError('not_found') });
    }
    
    res.json({ message: 'User role updated successfully' });
  });
});

// Add this TEMPORARY route after your other routes (remove after testing)
router.post('/reset-admin', (req, res) => {
  const adminPassword = bcrypt.hashSync('admin123', 10);
  
  db.run(`DELETE FROM users WHERE username = 'admin'`, function(err) {
    if (err) console.error('Error deleting admin:', err);
    
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      ['admin', adminPassword, 'admin'],
      function(err) {
        if (err) {
          console.error('Error creating admin:', err);
          return res.status(500).json({ error: 'Failed to reset admin' });
        }
        console.log('Admin user reset successfully');
        res.json({ message: 'Admin user reset successfully' });
      }
    );
  });
});

// Note: removed an automatic fetch call that ran during module load. Keep routes passive.

module.exports = router;
