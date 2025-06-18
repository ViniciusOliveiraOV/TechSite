// filepath: /home/ovni/code/tech-site-ui/backend/server.js
const express = require('express');
const cors = require('cors'); // 1. Import cors
const complaintsRouter = require('./routes/complaints');

const app = express();

// 2. Use cors middleware
// This allows requests from any origin.
app.use(cors());

// 3. Make sure you have this to parse the request body
app.use(express.json());

app.use('/api/complaints', complaintsRouter);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});