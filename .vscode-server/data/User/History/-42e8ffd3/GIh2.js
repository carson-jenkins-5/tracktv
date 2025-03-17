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

// POST: Add to watchlist
app.post("/watchlist", (req, res) => {
    const { id, name, type, season, episode, image } = req.body;
    if (!id || !name) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    watchlist.push({ id, name, type, season, episode, image, watched: false });
    res.status(201).json({ message: "Added to watchlist", watchlist });
});

// PUT: Mark as watched
app.put("/watchlist/:id", (req, res) => {
    const item = watchlist.find((entry) => entry.id === req.params.id);
    if (!item) {
        return res.status(404).json({ error: "Item not found" });
    }

    item.watched = true;
    res.json({ message: "Marked as watched", watchlist });
});

// DELETE: Remove from watchlist
app.delete("/watchlist/:id", (req, res) => {
    watchlist = watchlist.filter((entry) => entry.id !== req.params.id);
    res.json({ message: "Removed from watchlist", watchlist });
});

// GET: Retrieve watchlist
app.get("/watchlist", (req, res) => {
    res.json(watchlist);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));