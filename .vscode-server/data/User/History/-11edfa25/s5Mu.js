<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <!-- Login/Signup Container -->
    <div id="auth-container">
        <h2 id="auth-title">Login</h2>
        <form id="auth-form">
            <input type="text" id="username" placeholder="Username" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Submit</button>
        </form>
        <p id="auth-toggle">Don't have an account? <span onclick="toggleAuthMode()">Sign up</span></p>
    </div>

    <!-- Profile Section (Hidden by Default) -->
    <div id="profile-container" style="display: none;">
        <!-- Profile Header -->
        <div class="profile-header">
            <div class="profile-info">
                <img src="assets/profile-placeholder.png" alt="Profile Picture" class="profile-picture">
                <h2 class="username">Carson Jenkins</h2>
                <button class="edit-profile">EDIT</button>
                <button class="logout-button" onclick="logout()">LOGOUT</button>
            </div>
        </div>

        <!-- Stats Section -->
        <div class="stats-container">
            <div class="stat-box"><h3>TV Time</h3><p>0 months 0 days 17 hours</p></div>
            <div class="stat-box"><h3>Episodes Watched</h3><p>2</p></div>
            <div class="stat-box"><h3>Movie Time</h3><p>0 months 0 days 0 hours</p></div>
            <div class="stat-box"><h3>Movies Watched</h3><p>0</p></div>
        </div>

        <!-- Lists Section -->
        <div class="lists-container">
            <h2>Lists</h2>
            <button class="create-list">+ CREATE A NEW LIST</button>
        </div>

        <!-- Shows Section -->
        <div class="favorites-container">
            <h2>Shows</h2>
            <div class="favorites-carousel" id="profile-shows"></div>
        </div>

        <!-- Favorite Shows Section -->
        <div class="favorites-container">
            <h2>❤️ Favorite Shows</h2>
            <div class="favorites-carousel" id="favorite-shows"></div>
        </div>

        <!-- Movies Section -->
        <div class="favorites-container">
            <h2>Movies</h2>
            <div class="favorites-carousel" id="profile-movies"></div>
        </div>

        <!-- Favorite Movies Section -->
        <div class="favorites-container">
            <h2>❤️ Favorite Movies</h2>
            <div class="favorites-carousel" id="favorite-movies"></div>
        </div>
    </div>

    <!-- Navbar -->
    <nav class="navbar">
        <button onclick="window.location.href='index.html'">Explore</button>
        <button onclick="window.location.href='shows.html'">Shows</button>
        <button onclick="window.location.href='movies.html'">Movies</button>
        <button class="active">Profile</button>
    </nav>

    <script src="script.js"></script>
</body>
</html>