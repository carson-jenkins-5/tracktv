const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("../frontend")); // Serves frontend files

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/../frontend/index.html");
});

// API Route Example
app.get("/api/shows", (req, res) => {
    res.json([{ id: 1, name: "Breaking Bad" }, { id: 2, name: "Stranger Things" }]);
});

app.listen(PORT, () => console.log(`Server running on http://45.33.7.103:${PORT}`));