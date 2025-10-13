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

const PORT = process.env.PORT || 8070;

app.use(cors({
    origin: 'http://localhost:3000', // allow frontend origin
    credentials: true // security fix: allow cookies to be sent cross-origin
}));
app.use(bodyParser.json());

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

const URL = process.env.MONGODB_URL;

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB Connection Success!');
});

// oauth implementation: Passport Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // security fix: validate Google profile
        if (!profile || !profile.id || !profile.emails || !profile.displayName) {
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

// oauth implementation: Google OAuth routes
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: true }),
    (req, res) => {
        // Successful authentication, redirect to UserHome
        res.redirect('http://localhost:3000/UserHome'); // oauth implementation: redirect to UserHome instead of /dashboard
    }
);

// oauth implementation: example protected route
app.get('/profile', (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // Only send safe user info
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    });
});

app.listen(PORT, () => {
    console.log(`Server is up and running on port number: ${PORT}`);
});




