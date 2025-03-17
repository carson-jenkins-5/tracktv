const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;
const SECRET_KEY = "supersecretkey";  // Change this in production

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(__dirname, "tracktv.db"), (err) => {
    if (err) console.error("Database Connection Error:", err.message);
    else console.log("Connected to SQLite database.");
});

// Create Tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT CHECK(role IN ('user', 'admin')) DEFAULT 'user'
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        media_id TEXT,
        title TEXT,
        image TEXT,
        type TEXT,
        watched INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

// Middleware for verifying tokens
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Middleware for admin role
function authorizeAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
}

// User Signup
app.post("/backend/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Username already exists" });
        
        const token = jwt.sign({ id: this.lastID, username, role: "user" }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    });
});

// User Login
app.post("/backend/login", (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: "Invalid credentials" });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });
        
        const token = jwt.sign({ id: user.id, username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    });
});

// Add to Watchlist
app.post("/backend/watchlist", authenticateToken, (req, res) => {
    const { media_id, title, image, type } = req.body;
    db.run("INSERT INTO watchlist (user_id, media_id, title, image, type) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, media_id, title, image, type],
        function(err) {
            if (err) return res.status(400).json({ error: "Error adding to watchlist" });
            res.status(201).json({ message: "Added to watchlist" });
        }
    );
});

// Get User Watchlist
app.get("/backend/watchlist", authenticateToken, (req, res) => {
    db.all("SELECT * FROM watchlist WHERE user_id = ?", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(rows);
    });
});

// Remove from Watchlist
app.delete("/backend/watchlist/:id", authenticateToken, (req, res) => {
    db.run("DELETE FROM watchlist WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], function(err) {
        if (err || this.changes === 0) return res.status(400).json({ error: "Error removing from watchlist" });
        res.json({ message: "Removed from watchlist" });
    });
});

// Mark as Watched/Unwatched
app.put("/backend/watchlist/:id", authenticateToken, (req, res) => {
    const { watched } = req.body;
    db.run("UPDATE watchlist SET watched = ? WHERE id = ? AND user_id = ?", [watched ? 1 : 0, req.params.id, req.user.id], function(err) {
        if (err || this.changes === 0) return res.status(400).json({ error: "Error updating watchlist" });
        res.json({ message: watched ? "Marked as watched" : "Marked as unwatched" });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));