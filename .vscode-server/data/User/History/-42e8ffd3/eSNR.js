const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let watchlist = []; // In-memory storage for watchlist

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

// 📌 POST: Add to Watchlist
app.post("/backend/watchlist", (req, res) => {
    const { id, title, image, type } = req.body;
    if (!id || !title || !image || !type) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const exists = watchlist.some(item => item.id === id);
    if (exists) {
        return res.status(409).json({ error: "Already in watchlist" });
    }

    watchlist.push({ id, title, image, type });
    res.status(201).json({ message: "Added to watchlist" });
});

// 📌 GET: Fetch Watchlist
app.get("/backend/watchlist", (req, res) => {
    res.json(watchlist);
});

// 📌 DELETE: Remove from Watchlist
app.delete("/backend/watchlist/:id", (req, res) => {
    watchlist = watchlist.filter(item => item.id !== req.params.id);
    res.json({ message: "Removed from watchlist" });
});

// PUT - Mark as Watched
app.put("/backend/watchlist/:id", (req, res) => {
    const { id } = req.params;
    const { watched } = req.body;

    const item = watchlist.find(i => String(i.id) === String(id));  // Ensure IDs match as strings

    if (!item) {
        return res.status(404).json({ error: "Not found" });
    }

    item.watched = watched;  //  Toggle watched status (true or false)
    res.json({ message: watched ? "Marked as watched" : "Marked as unwatched", item });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));