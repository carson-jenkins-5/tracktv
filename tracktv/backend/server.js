const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const basicAuth = require("basic-auth");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;
const db = new sqlite3.Database(__dirname + "/tracktv.db");

app.use(cors());
app.use(express.json());

// Basic Authentication Middleware
async function authenticateUser(req, res, next) {
    const credentials = basicAuth(req);
    if (!credentials || !credentials.name || !credentials.pass) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [credentials.name], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: "Unauthorized" });

        const isMatch = await bcrypt.compare(credentials.pass, user.password);
        if (!isMatch) return res.status(401).json({ error: "Unauthorized" });

        req.user = user;
        next();
    });
}

// Role-Based Authorization Middleware
function authorizeRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}

// Create tables on server start
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'author')) NOT NULL
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        image TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('show', 'movie')),
        watched BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
});

// Serve static frontend files
app.use(express.static("../frontend"));

// Sample API endpoints
app.get("/api/trending/shows", (req, res) => {
    res.json([
        { id: 1, name: "Breaking Bad", image: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
        { id: 2, name: "Stranger Things", image: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg" }
    ]);
});

app.get("/api/trending/movies", (req, res) => {
    res.json([
        { id: 1, name: "Inception", image: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg" },
        { id: 2, name: "Interstellar", image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" }
    ]);
});

// POST: Add to Watchlist using SQLite (secured)
app.post("/backend/watchlist", authenticateUser, (req, res) => {
    const { title, image, type } = req.body;
    if (!title || !image || !type) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const sql = `INSERT INTO watchlist (user_id, title, image, type) VALUES (?, ?, ?, ?)`;
    db.run(sql, [req.user.id, title, image, type], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Added to watchlist", id: this.lastID });
    });
});

// GET: Fetch Watchlist using SQLite (secured - returns only user's watchlist)
app.get("/backend/watchlist", authenticateUser, (req, res) => {
    const sql = `SELECT * FROM watchlist WHERE user_id = ?`;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// DELETE: Remove from Watchlist using SQLite (secured)
app.delete("/backend/watchlist/:id", authenticateUser, (req, res) => {
    const sql = `DELETE FROM watchlist WHERE id = ? AND user_id = ?`;
    db.run(sql, [req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(403).json({ error: "Forbidden" });
        res.json({ message: "Removed from watchlist" });
    });
});

// PUT: Update watched status using SQLite (secured)
app.put("/backend/watchlist/:id", authenticateUser, (req, res) => {
    const { watched } = req.body;
    const sql = `UPDATE watchlist SET watched = ? WHERE id = ? AND user_id = ?`;
    db.run(sql, [watched, req.params.id, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(403).json({ error: "Forbidden" });
        res.json({ message: watched ? "Marked as watched" : "Marked as unwatched" });
    });
});

// POST: User Signup
app.post("/backend/signup", async (req, res) => {
    const { username, password } = req.body;
    const role = "author"; // All new users are assigned the "author" role

    if (!username || !password) {
        return res.status(400).json({ error: "Invalid input" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;

    db.run(sql, [username, hashedPassword, role], function (err) {
        if (err) return res.status(500).json({ error: "User creation failed" });
        res.status(201).json({ message: "User created", id: this.lastID });
    });
});

// GET: Fetch all users (Admin Only)
app.get("/backend/users", authenticateUser, authorizeRole("admin"), (req, res) => {
    const sql = `SELECT id, username FROM users WHERE username != 'admin'`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log("Users fetched:", rows); // Debugging
        res.json(rows);
    });
});

// DELETE: Delete User (Admin Only)
app.delete("/backend/users/:id", authenticateUser, authorizeRole("admin"), (req, res) => {
    const deleteWatchlistSql = `DELETE FROM watchlist WHERE user_id = ?`;
    const deleteUserSql = `DELETE FROM users WHERE id = ?`;

    db.run(deleteWatchlistSql, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(deleteUserSql, [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "User and watchlist deleted" });
        });
    });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));