const express = require('express');
const cors = require('cors');
const complaintsRouter = require('./routes/complaints');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Add auth routes
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);

// Add this debugging middleware to see what routes are being hit
app.use('*', (req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('POST /api/auth/login');
  console.log('POST /api/auth/register');
  console.log('GET /api/complaints (requires auth)');
  console.log('POST /api/complaints (requires auth)');
  console.log('DELETE /api/complaints/:id (requires admin)');
});