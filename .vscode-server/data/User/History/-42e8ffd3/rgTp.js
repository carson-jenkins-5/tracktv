const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let users = []; // Temporary user database

let watchlist = []; // Temporary in-memory watchlist

// Serve static frontend files
app.use(express.static("../frontend"));

// Middleware: Authenticate and Extract User Info from Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied" });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
}

// Middleware: Role-Based Authorization
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
}

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

// **POST: Add to Watchlist (Authenticated)**
app.post("/backend/watchlist", authenticateToken, (req, res) => {
    const { id, title, image, type } = req.body;
    if (!id || !title || !image || !type) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const exists = watchlist.some(item => item.id === id && item.username === req.user.username);
    if (exists) return res.status(409).json({ error: "Already in watchlist" });

    watchlist.push({ id, title, image, type, username: req.user.username });
    res.status(201).json({ message: "Added to watchlist" });
});

// **GET: Fetch User’s Watchlist (Authenticated)**
app.get("/backend/watchlist", authenticateToken, (req, res) => {
    const userWatchlist = watchlist.filter(item => item.username === req.user.username);
    res.json(userWatchlist);
});

// **DELETE: Remove from Watchlist (Authenticated)**
app.delete("/backend/watchlist/:id", authenticateToken, (req, res) => {
    watchlist = watchlist.filter(item => item.id !== req.params.id || item.username !== req.user.username);
    res.json({ message: "Removed from watchlist" });
});

// **PUT: Mark as Watched (Authenticated)**
app.put("/backend/watchlist/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { watched } = req.body;

    const item = watchlist.find(i => String(i.id) === String(id) && i.username === req.user.username);
    if (!item) return res.status(404).json({ error: "Not found" });

    item.watched = watched;
    res.json({ message: watched ? "Marked as watched" : "Marked as unwatched", item });
});
// **Signup: Create a New User (Only authors allowed)**
app.post("/backend/signup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    const exists = users.find(user => user.username === username);
    if (exists) return res.status(409).json({ error: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role: "author" });

    res.status(201).json({ message: "User created. Please log in." });
});
// **Login: Authenticate User**
app.post("/backend/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
});
// **Admin: Create a New User**
app.post("/backend/users", authenticateToken, authorizeRole("admin"), async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: "Missing fields" });

    const exists = users.find(user => user.username === username);
    if (exists) return res.status(409).json({ error: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role });

    res.status(201).json({ message: "User created successfully" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
// **Admin: Delete a User**
app.delete("/backend/users/:username", authenticateToken, authorizeRole("admin"), (req, res) => {
    const username = req.params.username;
    users = users.filter(user => user.username !== username);
    res.json({ message: "User deleted" });
});