const API_KEY = "68d6cd9baadb236523ec6497d0e352a5";
const BASE_URL = "https://api.themoviedb.org/3";

// Fetch trending TV shows
async function fetchTrendingShows() {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
}

// Fetch trending movies
async function fetchTrendingMovies() {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
}

// Search movies/shows
async function searchMovies(query) {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
    const data = await response.json();
    return data.results;
}

async function loadProfileWatchlist() {
    try {
        const response = await fetch("/backend/watchlist");
        const watchlist = await response.json();
        
        const showsContainer = document.getElementById("profile-shows");
        const moviesContainer = document.getElementById("profile-movies");

        showsContainer.innerHTML = "";
        moviesContainer.innerHTML = "";

        watchlist.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("watchlist-item");

            div.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="watchlist-info">
                    <p class="watchlist-title">${item.title}</p>
                </div>
            `;

            if (item.type === "show") {
                showsContainer.appendChild(div);
            } else if (item.type === "movie") {
                moviesContainer.appendChild(div);
            }
        });
    } catch (error) {
        console.error("Error loading profile watchlist:", error);
    }
}

// Ensure the function runs on profile page load
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("profile-shows") && document.getElementById("profile-movies")) {
        loadProfileWatchlist();
    }
});

// Authentication logic
document.addEventListener("DOMContentLoaded", function () {
    checkAuth();

    document.getElementById("auth-form").addEventListener("submit", function (e) {
        e.preventDefault();
        handleAuth();
    });
});

function checkAuth() {
    const user = localStorage.getItem("user");
    if (user) {
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("profile-container").style.display = "block";
        document.querySelector(".username").textContent = user;
    } else {
        document.getElementById("auth-container").style.display = "block";
        document.getElementById("profile-container").style.display = "none";
    }
}

function handleAuth() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
        localStorage.setItem("user", username);
        checkAuth();
    } else {
        alert("Please enter a username and password.");
    }
}

function toggleAuthMode() {
    const title = document.getElementById("auth-title");
    const toggleText = document.getElementById("auth-toggle");

    if (title.textContent === "Login") {
        title.textContent = "Sign Up";
        toggleText.innerHTML = `Already have an account? <span onclick="toggleAuthMode()">Login</span>`;
    } else {
        title.textContent = "Login";
        toggleText.innerHTML = `Don't have an account? <span onclick="toggleAuthMode()">Sign up</span>`;
    }
}

function logout() {
    localStorage.removeItem("user");
    checkAuth();
}