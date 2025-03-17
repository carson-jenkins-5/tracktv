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

app.listen(PORT, () => console.log(`Server running on http://45.33.7.103:${PORT}`));