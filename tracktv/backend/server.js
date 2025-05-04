const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const basicAuth = require("basic-auth");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;
const db = new sqlite3.Database(__dirname + "/tracktv.db");

// Configure CORS with specific options
app.use(cors({
    origin: ['https://carsonjenkins.chickenkiller.com', 'http://localhost:8000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
        season INTEGER,
        episode INTEGER,
        episode_title TEXT,
        tmdb_id INTEGER,
        total_seasons INTEGER,
        total_episodes_per_season TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Keep only last hour of notifications
    db.run(`DELETE FROM notifications WHERE timestamp < datetime('now', '-1 hour')`);
});

// Serve static frontend files
app.use(express.static("../frontend"));

// Define routes for both /api and /backend paths
function defineRoutes(prefix) {
    // GET: Fetch notifications
    app.get(`${prefix}/notifications`, authenticateUser, (req, res) => {
        const sql = `SELECT * FROM notifications 
                    WHERE timestamp > datetime('now', '-1 hour')
                    ORDER BY timestamp DESC 
                    LIMIT 50`;
        db.all(sql, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // Sample API endpoints
    app.get(`${prefix}/trending/shows`, (req, res) => {
        res.json([
            { id: 1, name: "Breaking Bad", image: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
            { id: 2, name: "Stranger Things", image: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg" }
        ]);
    });

    app.get(`${prefix}/trending/movies`, (req, res) => {
        res.json([
            { id: 1, name: "Inception", image: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg" },
            { id: 2, name: "Interstellar", image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" }
        ]);
    });

    // POST: Add to Watchlist using SQLite (secured)
    app.post(`${prefix}/watchlist`, authenticateUser, async (req, res) => {
        const { title, image, type, tmdb_id } = req.body;
        if (!title || !image || !type) {
            return res.status(400).json({ error: "Missing fields" });
        }

        try {
            // For shows, fetch episode information from TMDB
            let totalSeasons = null;
            let totalEpisodesPerSeason = null;
            let episodeTitle = null;

            if (type === 'show' && tmdb_id) {
                // Fetch show details to get total seasons
                const showResponse = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=68d6cd9baadb236523ec6497d0e352a5`);
                const showData = await showResponse.json();
                totalSeasons = showData.number_of_seasons;

                console.log('Show details:', {
                    title,
                    totalSeasons,
                    tmdb_id
                });

                // Fetch all seasons' data
                const episodesPerSeason = {};
                for (let seasonNum = 1; seasonNum <= totalSeasons; seasonNum++) {
                    const seasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}/season/${seasonNum}?api_key=68d6cd9baadb236523ec6497d0e352a5`);
                    const seasonData = await seasonResponse.json();
                    episodesPerSeason[seasonNum] = seasonData.episodes.length;
                    console.log(`Season ${seasonNum}: ${seasonData.episodes.length} episodes`);
                }
                totalEpisodesPerSeason = JSON.stringify(episodesPerSeason);

                // Get first episode title
                const firstSeasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}/season/1?api_key=68d6cd9baadb236523ec6497d0e352a5`);
                const firstSeasonData = await firstSeasonResponse.json();
                if (firstSeasonData.episodes.length > 0) {
                    episodeTitle = firstSeasonData.episodes[0].name;
                }
        }

        // For shows, set default season/episode if not provided
            const defaultSeason = type === 'show' ? 1 : null;
            const defaultEpisode = type === 'show' ? 1 : null;

            const sql = `INSERT INTO watchlist (user_id, title, image, type, season, episode, episode_title, tmdb_id, total_seasons, total_episodes_per_season) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(sql, [
                req.user.id, 
                title, 
                image, 
                type, 
                defaultSeason, 
                defaultEpisode, 
                episodeTitle,
                tmdb_id,
                totalSeasons,
                totalEpisodesPerSeason
            ], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // Add notification
            const message = `${req.user.username} added ${title} to their watchlist`;
            const notifySql = `INSERT INTO notifications (username, message) VALUES (?, ?)`;
            db.run(notifySql, [req.user.username, message]);

            res.status(201).json({ message: "Added to watchlist", id: this.lastID });
        });
        } catch (error) {
            console.error("Error fetching TMDB data:", error);
            res.status(500).json({ error: "Failed to fetch show information" });
        }
    });

    // GET: Fetch Watchlist using SQLite (secured)
    app.get(`${prefix}/watchlist`, authenticateUser, (req, res) => {
        const sql = `SELECT * FROM watchlist WHERE user_id = ?`;
        db.all(sql, [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // DELETE: Remove from Watchlist using SQLite (secured)
    app.delete(`${prefix}/watchlist/:id`, authenticateUser, (req, res) => {
        const sql = `DELETE FROM watchlist WHERE id = ? AND user_id = ?`;
        db.run(sql, [req.params.id, req.user.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(403).json({ error: "Forbidden" });
            res.json({ message: "Removed from watchlist" });
        });
    });

    // PUT: Update watched status or episode info using SQLite (secured)
    app.put(`${prefix}/watchlist/:id`, authenticateUser, async (req, res) => {
        const { watched } = req.body;
        
        const checkSql = `SELECT type, episode, season, tmdb_id, total_seasons, total_episodes_per_season 
                         FROM watchlist WHERE id = ? AND user_id = ?`;
        
        db.get(checkSql, [req.params.id, req.user.id], async (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!row) return res.status(404).json({ error: "Item not found" });

            if (row.type === 'show') {
                try {
                    let newSeason = row.season;
                    let newEpisode = row.episode;
                    let newEpisodeTitle = null;
                    let episodesPerSeason = row.total_episodes_per_season ? JSON.parse(row.total_episodes_per_season) : {};

                    console.log('Current state:', {
                        season: newSeason,
                        episode: newEpisode,
                        episodesPerSeason,
                        totalSeasons: row.total_seasons
                    });

                    if (watched) {
                        // Increment episode number
                        newEpisode = row.episode + 1;
                        
                        // Check if we've reached the end of the season
                        const currentSeasonEpisodes = episodesPerSeason[newSeason];
                        console.log('Current season episodes:', currentSeasonEpisodes);
                        
                        if (newEpisode > currentSeasonEpisodes) {
                            // Move to next season
                            newSeason++;
                            newEpisode = 1;
                            
                            // Check if we've reached the end of the series
                            if (newSeason > row.total_seasons) {
                                // Series is complete, mark as completed instead of deleting
                                const completeSql = `UPDATE watchlist SET completed = 1 WHERE id = ? AND user_id = ?`;
                                db.run(completeSql, [req.params.id, req.user.id], function(err) {
                                    if (err) return res.status(500).json({ error: err.message });
                                    res.json({ message: "Series completed and marked as watched" });
                                });
                                return;
                            }
                        }

                        // Fetch new episode title
                        if (row.tmdb_id) {
                            const seasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${row.tmdb_id}/season/${newSeason}?api_key=68d6cd9baadb236523ec6497d0e352a5`);
                            const seasonData = await seasonResponse.json();
                            if (seasonData.episodes && seasonData.episodes[newEpisode - 1]) {
                                newEpisodeTitle = seasonData.episodes[newEpisode - 1].name;
                            }
                        }
                    } else {
                        // Decrement episode number
                        if (row.episode > 1) {
                            newEpisode = row.episode - 1;
                            
                            // Fetch previous episode title
                            if (row.tmdb_id) {
                                const seasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${row.tmdb_id}/season/${newSeason}?api_key=68d6cd9baadb236523ec6497d0e352a5`);
                                const seasonData = await seasonResponse.json();
                                if (seasonData.episodes && seasonData.episodes[newEpisode - 1]) {
                                    newEpisodeTitle = seasonData.episodes[newEpisode - 1].name;
                                }
                            }
                        }
                    }

                    console.log('New state:', {
                        season: newSeason,
                        episode: newEpisode,
                        episodeTitle: newEpisodeTitle
                    });

                    // Update the watchlist item
                    const updateSql = `UPDATE watchlist SET 
                        season = ?, 
                        episode = ?, 
                        episode_title = ?,
                        watched = 0 
                                 WHERE id = ? AND user_id = ?`;
                    
                    db.run(updateSql, [
                        newSeason,
                        newEpisode,
                        newEpisodeTitle,
                        req.params.id,
                        req.user.id
                    ], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    if (this.changes === 0) return res.status(403).json({ error: "Forbidden" });
                    res.json({ message: "Episode info updated" });
                });
                } catch (error) {
                    console.error("Error fetching TMDB data:", error);
                    res.status(500).json({ error: "Failed to fetch episode information" });
                }
            } else {
                // For movies, just update watched status
                if (watched) {
                    // Mark movie as completed instead of deleting
                    const completeSql = `UPDATE watchlist SET completed = 1 WHERE id = ? AND user_id = ?`;
                    db.run(completeSql, [req.params.id, req.user.id], function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ message: "Movie marked as watched and completed" });
                    });
                } else {
                    const updateSql = `UPDATE watchlist SET watched = 0 WHERE id = ? AND user_id = ?`;
                    db.run(updateSql, [req.params.id, req.user.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(403).json({ error: "Forbidden" });
                        res.json({ message: "Watched status updated" });
            });
                }
        }
        });
    });

    // POST: User Signup
    app.post(`${prefix}/signup`, async (req, res) => {
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
    app.get(`${prefix}/users`, authenticateUser, authorizeRole("admin"), (req, res) => {
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
    app.delete(`${prefix}/users/:id`, authenticateUser, authorizeRole("admin"), (req, res) => {
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
}

// Define routes for both /api and /backend paths
defineRoutes('/api');
defineRoutes('/backend');

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));