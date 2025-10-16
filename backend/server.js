const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const complaintsRouter = require('./routes/complaints');
const authRouter = require('./routes/auth');

require('dotenv').config();

const app = express();

// Security middleware
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // In production use helmet defaults (more strict)
  app.use(helmet());
} else {
  // During development allow Vite dev server (HMR) scripts and inline scripts/styles
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'http://localhost:5173', 'http://127.0.0.1:5173'],
        connectSrc: ["'self'", 'ws://localhost:5173', 'http://localhost:5173', 'http://127.0.0.1:5173'],
        imgSrc: ["'self'", 'data:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    }
  }));
}

/*
const csurf = require('csurf');
app.use(csurf({ cookie: true }));
// Middleware to set CSRF token in response headers
*/

// CORS configuration
// Since frontend uses Vite proxy during development, CORS is only needed for:
// 1. Direct backend testing (curl, Postman, etc.)
// 2. Production frontend (set FRONTEND_ORIGIN env var to your production domain)
const allowedOrigins = process.env.FRONTEND_ORIGIN 
  ? [process.env.FRONTEND_ORIGIN]
  : []; // In dev with proxy, no origins needed (proxy makes requests same-origin)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, Postman, same-origin via proxy)
    if (!origin) return callback(null, true);
    
    // In production, check against whitelist
    if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development with no FRONTEND_ORIGIN set, allow any origin as fallback
    if (!process.env.FRONTEND_ORIGIN && !isProd) {
      return callback(null, true);
    }
    
    // Reject if not whitelisted
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

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
