const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const complaintsRouter = require('./routes/complaints');
const authRouter = require('./routes/auth');

require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

/*
const csurf = require('csurf');
app.use(csurf({ cookie: true }));
// Middleware to set CSRF token in response headers
*/

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5174', 'http://localhost:3000'],
  credentials: true, // This allows cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // cuidado com isto quando usar cookies HttpOnly. 
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
/* usar rate limiting mais específico:

const loginLimiter = rateLimit({ windowMs: 60_000, max: 5 });
app.use('/api/auth/login', loginLimiter);

*/

app.use(globalLimiter);
app.use(express.json({ limit: '10mb' }));

// Add auth routes
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);

// Add this debugging middleware to see what routes are being hit
app.use('*', (req, res) => {
  //console.log(`Unmatched route: ${req.method} ${req.originalUrl}`); // log nao anonimizado
  console.log(`Unmatched route: ${req.method} ${req.path}`);
  res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});
/*
Em produção, evita logar tudo no console. Usa algo tipo winston ou pino.
*/

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('POST /api/auth/login');
  console.log('POST /api/auth/register');
  console.log('GET /api/complaints (requires auth)');
  console.log('POST /api/complaints (requires auth)');
  console.log('DELETE /api/complaints/:id (requires admin)');
});
