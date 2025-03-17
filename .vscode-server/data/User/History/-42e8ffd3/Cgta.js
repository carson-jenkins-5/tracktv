const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let watchlist = {}; // In-memory storage for watchlist

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

// GET: Retrieve current watchlist
app.get("/api/watchlist", (req, res) => {
    res.json(watchlist);
});

// POST: Add a movie/show to the watchlist
app.post("/api/watchlist", (req, res) => {
    const { id, title, type } = req.body;
    if (!id || !title || !type) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (!watchlist[id]) {
        watchlist[id] = { title, type, watched: false };
        return res.status(201).json({ message: "Added to watchlist", item: watchlist[id] });
    } else {
        return res.status(409).json({ error: "Already in watchlist" });
    }
});

// PUT: Mark a movie/show as watched
app.put("/api/watchlist/:id", (req, res) => {
    const { id } = req.params;
    if (watchlist[id]) {
        watchlist[id].watched = true;
        return res.json({ message: "Marked as watched", item: watchlist[id] });
    } else {
        return res.status(404).json({ error: "Item not found" });
    }
});

// DELETE: Remove from watchlist
app.delete("/api/watchlist/:id", (req, res) => {
    const { id } = req.params;
    if (watchlist[id]) {
        delete watchlist[id];
        return res.json({ message: "Removed from watchlist" });
    } else {
        return res.status(404).json({ error: "Item not found" });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));