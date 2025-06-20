const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const path = require('path');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const db = new sqlite3.Database(path.resolve(__dirname, '../db/complaints.db'));
console.log("DB path:", path.resolve(__dirname, '../db/complaints.db'));

// Add this block to create the table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    complaint TEXT,
    date TEXT,
    hour TEXT,
    email TEXT
  )`);
});

// GET all complaints - different data based on role
router.get('/', require('../middleware/auth').authenticateToken, (req, res) => {
  console.log('Getting complaints for user:', req.user.username);
  const isAdmin = req.user.role === 'admin';
  
  if (isAdmin) {
    // Admin sees everything including emails
    db.all("SELECT * FROM complaints", [], (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    });
  } else {
    // Regular users don't see emails
    db.all("SELECT id, user, complaint, date, hour FROM complaints", [], (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    });
  }
});

// POST - anyone can create complaints
router.post('/', authenticateToken, (req, res) => {
  const { user, complaint, email } = req.body;

  // Simple validation
  if (!user || !complaint || !email) {
    return res.status(400).send("All fields are required.");
  }

  const now = new Date();
  const date = now.toLocaleDateString('pt-BR');
  const hour = now.toLocaleTimeString('pt-BR');

  console.log(">>> INSERTING:", { user, complaint, email, date, hour });

  db.run(
    `INSERT INTO complaints (user, complaint, date, hour, email) VALUES (?, ?, ?, ?, ?)`,
    [user, complaint, date, hour, email],
    function(err) {
      if (err) {
        console.error("!!! INSERT ERROR:", err.message);
        return res.status(500).send(err.message);
      }
      
      // After inserting, fetch the new row and return it
      db.get(`SELECT * FROM complaints WHERE id = ?`, this.lastID, (err, row) => {
        if (err) {
          console.error("!!! SELECT ERROR:", err.message);
          return res.status(500).send(err.message);
        }
        console.log(">>> RETURNING NEW ROW:", row);
        
        // Return different data based on user role
        const isAdmin = req.user.role === 'admin';
        if (!isAdmin) {
          // Remove email from response for non-admin users
          const { email, ...rowWithoutEmail } = row;
          res.status(201).json(rowWithoutEmail);
        } else {
          res.status(201).json(row);
        }
      });
    }
  );
});

// DELETE - only admins can delete
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  
  console.log(">>> ADMIN DELETING complaint with ID:", id);
  
  db.run(`DELETE FROM complaints WHERE id = ?`, id, function(err) {
    if (err) {
      console.error("!!! DELETE ERROR:", err.message);
      return res.status(500).send(err.message);
    }
    // Check if any row was changed
    if (this.changes === 0) {
      return res.status(404).send("Complaint not found.");
    }
    console.log(">>> Successfully deleted complaint with ID:", id);
    res.status(200).send("Complaint deleted successfully.");
  });
});

module.exports = router;
