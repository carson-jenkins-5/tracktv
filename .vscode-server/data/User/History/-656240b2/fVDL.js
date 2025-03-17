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