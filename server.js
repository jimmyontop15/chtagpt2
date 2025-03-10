const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }));

passport.use(new Strategy({
    clientID: '1314619845886611566',
    clientSecret: '2NevBdonL8BkEvbpwgTIfiujtrQWjwTS',
    callbackURL: "https://nebulabeatz.netlify.app/callback",
    scope: ["identify", "guilds"]
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('discord'));
app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => res.redirect('/dashboard'));

app.get('/user', (req, res) => {
    if (!req.user) return res.json({ error: "Not logged in" });
    res.json({ username: req.user.username, id: req.user.id });
});

app.get('/stats', (req, res) => {
    res.json({ servers: 120, users: 4500 }); // Replace with real bot stats
});

app.get('/music/play', (req, res) => {
    console.log('Playing music...');
    res.sendStatus(200);
});

app.get('/music/pause', (req, res) => {
    console.log('Pausing music...');
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Dashboard running on http://localhost:3000'));
