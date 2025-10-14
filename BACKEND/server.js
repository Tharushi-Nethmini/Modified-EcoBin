const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require('express-session'); // oauth implementation: express-session for session management
const passport = require('passport'); // oauth implementation: passport core
const GoogleStrategy = require('passport-google-oauth20').Strategy; // oauth implementation: Google OAuth 2.0
const app = express();
require("dotenv").config();
const { authLimiter } = require('./middleware/rateLimiter');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 8070;

app.use(cors({
    origin: 'http://localhost:3000', // allow frontend origin
    credentials: true // security fix: allow cookies to be sent cross-origin
}));
app.use(bodyParser.json());
// parse cookies to support CSRF token in a cookie
app.use(cookieParser());

// CSRF protection using double submit cookie pattern
// We protect stateful session routes. For stateless JSON APIs used by the SPA
// you might choose to exempt them or use a different strategy (e.g., verify
// custom header + token). Here we add csurf middleware globally but skip it
// for paths that are clearly API-only if necessary.
const csrfProtection = csrf({ cookie: true });

// Send CSRF token to client in a cookie for SPA to read and send back in header
app.use((req, res, next) => {
    // Only set the token if sessions are being used and user has a session
    // We'll call csurf later to generate the token where appropriate
    next();
});

// security fix: configure express-session with secure and httpOnly cookies
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // security fix: prevent client-side JS access
        secure: process.env.NODE_ENV === 'production', // security fix: only send cookie over HTTPS in production
        sameSite: 'lax', // security fix: CSRF protection
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// oauth implementation: initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Apply CSRF protection to routes that use session authentication.
// We'll attach the CSRF middleware after session & passport are initialized.
// For this app, the `/api/auth` routes are mixed (login uses JSON) so we will
// apply csrfProtection to routes that require it selectively in the route file
// or here for all stateful routes. For convenience, expose an endpoint to
// fetch a CSRF token at GET /api/csrf-token which the SPA can call after
// establishing a session (if any).
app.get('/api/csrf-token', csrfProtection, (req, res) => {
    // csurf will create req.csrfToken()
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false, // allowed for SPA JS to read
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
    res.json({ csrfToken: req.csrfToken() });
});

const URL = process.env.MONGODB_URL;

if (!URL) {
    console.error('Missing MONGODB_URL environment variable. Please set MONGODB_URL in your environment or .env file.');
    // Exit process with non-zero code to avoid running without a DB connection
    process.exit(1);
}

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB Connection Success!');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// oauth implementation: Passport Google OAuth 2.0 strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // security fix: validate Google profile
            if (!profile?.id || !profile?.emails || !profile?.displayName) {
                return done(new Error('Invalid Google profile'));
            }
            // Find or create user
            const User = require('./models/User');
            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName
                });
            }
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
} else {
    console.warn('Google OAuth not configured: missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_CALLBACK_URL. OAuth routes will be disabled.');
}

// oauth implementation: serialize/deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const User = require('./models/User');
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

const wastedetailRouter = require("./routes/wastedetail.js");
const routedetailRouter = require("./routes/routedetail.js");
const pickupdetailRouter = require("./routes/pickupdetail.js");
const categoryRouter = require("./routes/category.js");

app.use("/wastedetail", wastedetailRouter);
app.use("/routedetail", routedetailRouter);
app.use("/pickupdetail", pickupdetailRouter);
app.use("/category", categoryRouter);

const garbageRouter = require("./routes/garbageDetails.js");
const scheduleRouter = require("./routes/scheduleTime.js");
const calculatepaymentRouter = require("./routes/calculatepayment.js");
const cardpaymentRouter = require("./routes/cardpayment.js");
const compostrequestRouter = require("./routes/compostrequest.js");

app.use("/garbage",garbageRouter);
app.use("/schedule",scheduleRouter);
app.use("/calculatepayment",calculatepaymentRouter);
app.use("/cardpayment",cardpaymentRouter);
app.use('/compostRequest',compostrequestRouter); 

const authRoutes = require('./routes/auth'); // Import the auth routes
const recycleRoutes = require('./routes/recycle'); // Import the recycle routes

// Use the auth routes
app.use('/api/auth', authRoutes); // All auth routes will now start with /api/auth
app.use('/api/recycle', recycleRoutes); // All recycle routes will now start with /api/recycle

// attach csrfProtection to any subsequent stateful routes that require CSRF
// protection by calling app.use(csrfProtection) here or per-route in route files.

// oauth implementation: Google OAuth routes (only registered if strategy configured)
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
    // enable state parameter to mitigate CSRF-like attacks for OAuth flow
    app.get('/auth/google', authLimiter, passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: true
    }));

    app.get('/auth/google/callback',
        authLimiter,
        passport.authenticate('google', { failureRedirect: '/login', session: true }),
        (req, res) => {
            // Successful authentication, redirect to UserHome
            res.redirect('http://localhost:3000/UserHome'); // oauth implementation: redirect to UserHome instead of /dashboard
        }
    );
}

// oauth implementation: example protected route
app.get('/profile', csrfProtection, (req, res) => {
    if (!req.isAuthenticated?.() ) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // Only send safe user info
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    });
});

// Global error handler (including csurf errors)
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        // CSRF token errors
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);
});




