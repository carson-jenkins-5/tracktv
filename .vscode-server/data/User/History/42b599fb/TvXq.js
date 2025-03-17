document.addEventListener("DOMContentLoaded", async function () {
    const trendingShowsContainer = document.getElementById("trending-shows");
    const trendingMoviesContainer = document.getElementById("trending-movies");
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    const cancelBtn = document.getElementById("cancel-btn");
    const navbar = document.getElementById("navbar");

    //  Load Trending Shows
    if (trendingShowsContainer) {
        try {
            const trendingShows = await fetchTrendingShows();
            trendingShows.forEach(show => {
                const div = document.createElement("div");
                div.classList.add("media-container");

                div.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name}">
                    <button class="add-button" onclick="addToWatchlist('${show.id}', '${show.name}', '${show.poster_path}', 'show')">+</button>
                `;

                trendingShowsContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Error fetching trending shows:", error);
        }
    }

    //  Load Trending Movies
    if (trendingMoviesContainer) {
        try {
            const trendingMovies = await fetchTrendingMovies();
            trendingMovies.forEach(movie => {
                const div = document.createElement("div");
                div.classList.add("media-container");

                div.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                    <button class="add-button" onclick="addToWatchlist('${movie.id}', '${movie.title}', '${movie.poster_path}', 'movie')">+</button>
                `;

                trendingMoviesContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Error fetching trending movies:", error);
        }
    }

    //  Handle Search (Submit Button & Enter Key)
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    }

    if (searchForm) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
            }
        });
    }

    //  Cancel Button: Go Back
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            window.history.back();
        });
    }

    //  Navbar Navigation
    if (navbar) {
        navbar.addEventListener("click", function (e) {
            const targetPage = e.target.getAttribute("data-page");
            if (targetPage) {
                window.location.href = `${targetPage}.html`;
            }
        });
    }

    // Load Profile Watchlist
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
    if (document.getElementById("profile-shows") && document.getElementById("profile-movies")) {
        loadProfileWatchlist();
    }
});

//  Function to Add to Watchlist
async function addToWatchlist(id, title, posterPath, type) {
    const media = { id, title, image: `https://image.tmdb.org/t/p/w200${posterPath}`, type };

    try {
        const response = await fetch("/backend/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(media),
        });

        if (response.ok) {
            alert(`${title} added to watchlist!`);
        } else {
            alert("Already in watchlist or error occurred.");
        }
    } catch (error) {
        console.error("Error adding to watchlist:", error);
    }
}

//  Fetch Trending Shows
async function fetchTrendingShows() {
    const response = await fetch("https://api.themoviedb.org/3/tv/popular?api_key=68d6cd9baadb236523ec6497d0e352a5");
    const data = await response.json();
    return data.results.map(show => ({
        id: show.id,
        name: show.name,
        poster_path: show.poster_path
    }));
}

//  Fetch Trending Movies
async function fetchTrendingMovies() {
    const response = await fetch("https://api.themoviedb.org/3/movie/popular?api_key=68d6cd9baadb236523ec6497d0e352a5");
    const data = await response.json();
    return data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path
    }));
}