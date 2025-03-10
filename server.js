const express = require("express");
const fetch = require("node-fetch");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = "1314619845886611566"; // Replace with your actual client ID
const CLIENT_SECRET = "2NevBdonL8BkEvbpwgTIfiujtrQWjwTS"; // Replace with your actual client secret
const REDIRECT_URI = "https://nebulabeatz.netlify.app/auth/discord/callback"; // Redirect URL

// Session Configuration
app.use(session({
    secret: "supersecret", // Change this to a strong secret
    resave: false,
    saveUninitialized: false
}));

// Homepage Route
app.get("/", (req, res) => {
    res.send("Welcome to Nebula Beatz OAuth2 Login!");
});

// Discord OAuth2 Authorization Route
app.get("/auth/discord", (req, res) => {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.redirect(discordAuthUrl);
});

// Discord OAuth2 Callback Route
app.get("/auth/discord/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("No code received");

    const data = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
    });

    try {
        const response = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            body: data,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const json = await response.json();
        if (json.error) return res.send("Error: " + json.error_description);

        // Fetch User Info
        const userInfo = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${json.access_token}` },
        });
        const userData = await userInfo.json();

        req.session.user = userData;
        res.send(`Logged in as ${userData.username}#${userData.discriminator}`);
    } catch (error) {
        console.error("OAuth2 Error:", error);
        res.send("Login Failed!");
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.send("Logged out!");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
