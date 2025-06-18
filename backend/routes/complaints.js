const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const path = require('path');
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

router.get('/', (req, res) => {
  db.all("SELECT * FROM complaints", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

router.get('/debug', (req, res) => {
  db.all("SELECT * FROM complaints", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});


router.post('/', (req, res) => {
  const { user, complaint, email } = req.body;
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
      console.log(">>> INSERT SUCCESS: id =", this.lastID);
      res.status(201).json({ id: this.lastID });
    }
  );
});


db.on('trace', console.log);


module.exports = router;
