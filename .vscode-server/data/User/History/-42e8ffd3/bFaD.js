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

// 📌 POST Endpoint: Add to Watchlist
app.post("/watchlist", (req, res) => {
    const { id, title, image, type } = req.body;

    if (!id || !title || !image || !type) {
        return res.status(400).json({ error: "Missing fields in request" });
    }

    const exists = watchlist.find(item => String(item.id) === String(id));
    if (exists) {
        return res.status(409).json({ error: "Already in watchlist" });
    }

    watchlist.push({ id, title, image, type });
    res.status(201).json({ message: "Added successfully" });
});

// 📌 GET Endpoint: Retrieve Watchlist
app.get("/watchlist", (req, res) => {
    res.json(watchlist);
});

// 📌 DELETE Endpoint: Remove from Watchlist
app.delete("/watchlist/:id", (req, res) => {
    const { id } = req.params;
    watchlist = watchlist.filter(item => String(item.id) !== String(id));
    res.json({ message: "Removed successfully" });
});


// ✅ PUT - Mark as Watched
app.put("/watchlist/:id", (req, res) => {
    const item = watchlist.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });

    item.watched = true;
    res.json({ message: "Marked as watched" });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));