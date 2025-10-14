const rateLimit = require('express-rate-limit');

// Strict limiter for authentication endpoints (login/register, OAuth)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  keyGenerator: (req) => {
    // Prefer IP for anonymous requests; if user identifier exists, include it.
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || 'unknown';
    const userPart = req.body?.email || req.body?.username || 'anon';
    return `${userPart}:${ip}`;
  },
  handler: (req, res, /*next*/) => {
    res.status(429).json({ error: 'Too many authentication attempts, please try again later' });
  },
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
});

// Generic limiter for other APIs
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific limiter for OAuth callback endpoints (stricter to prevent automated abuse)
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for OAuth flows
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
  handler: (req, res) => res.status(429).json({ error: 'Too many OAuth requests, please try again later' }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Example login limiter (per the example you provided): 30 minutes, 5 attempts
const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
  handler: (req, res) => res.status(429).json({ error: 'Too many login attempts, try again later' }),
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, oauthLimiter, loginLimiter };
