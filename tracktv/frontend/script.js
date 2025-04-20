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

    // Hide cancel button initially
    if (cancelBtn) {
        cancelBtn.style.display = "none";
    }
    
    // Show cancel button only when search input has text
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            if (searchInput.value.trim().length > 0) {
                cancelBtn.style.display = "block";
            } else {
                cancelBtn.style.display = "none";
            }
        });
    }
    
    // Cancel button functionality: clear search input and hide button
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            searchInput.value = "";
            cancelBtn.style.display = "none";
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
            const showsContainer = document.getElementById("profile-shows");
            const moviesContainer = document.getElementById("profile-movies");
            const episodesWatchedElement = document.querySelector(".stat-box:nth-child(1) p");
            const moviesWatchedElement = document.querySelector(".stat-box:nth-child(2) p");

            // Clear previous content immediately before fetching new data
            showsContainer.innerHTML = "";
            moviesContainer.innerHTML = "";

            // Fetch latest watchlist
            const response = await fetch("/backend/watchlist", {
                method: "GET",
                headers: { "Authorization": "Basic " + btoa(sessionStorage.getItem("username") + ":" + sessionStorage.getItem("password")) }
            });
            const watchlist = await response.json();

            // Ensure the watchlist is valid before processing
            if (!Array.isArray(watchlist)) {
                console.error("Error: Watchlist is not an array", watchlist);
                return;
            }

            let watchedShowsCount = 0;
            let watchedMoviesCount = 0;
            // Populate the watchlist with only unwatched items and count watched ones
            watchlist.forEach(item => {
                if (item.watched) {
                    if (item.type === "show") {
                        watchedShowsCount++;
                    } else if (item.type === "movie") {
                        watchedMoviesCount++;
                    }
                    return;
                }

                const div = document.createElement("div");
                div.classList.add("watchlist-item");
                const imageUrl = item.image.startsWith("http") ? item.image : `https://image.tmdb.org/t/p/w200${item.image}`;
                div.innerHTML = `<img src="${imageUrl}" alt="${item.title}">`;

                if (item.type === "show") {
                    showsContainer.appendChild(div);
                } else if (item.type === "movie") {
                    moviesContainer.appendChild(div);
                }
            });
            // Update watched stats
            episodesWatchedElement.textContent = watchedShowsCount;
            moviesWatchedElement.textContent = watchedMoviesCount;
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
    if (!sessionStorage.getItem("username") || !sessionStorage.getItem("password")) {
        window.location.href = "profile.html";
        return;
    }
    const fullImageUrl = posterPath.startsWith("http") ? posterPath : `https://image.tmdb.org/t/p/w200${posterPath}`;
    const media = { id, title, image: fullImageUrl, type };

    try {
        const response = await fetch("/backend/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Basic " + btoa(sessionStorage.getItem("username") + ":" + sessionStorage.getItem("password")) },
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
    const response = await fetch("https://api.themoviedb.org/3/discover/tv?api_key=68d6cd9baadb236523ec6497d0e352a5&language=en-US&sort_by=popularity.desc&with_origin_country=US&without_genres=10763,10767,10764&vote_count.gte=100&vote_average.gte=7.0");
    const data = await response.json();
    return data.results.map(show => ({
        id: show.id,
        name: show.name,
        poster_path: show.poster_path,
        type: 'show'
    }));
}

//  Fetch Trending Movies
async function fetchTrendingMovies() {
    const response = await fetch("https://api.themoviedb.org/3/discover/movie?api_key=68d6cd9baadb236523ec6497d0e352a5&language=en-US&sort_by=popularity.desc&with_origin_country=US&without_genres=99&vote_count.gte=100&vote_average.gte=7.0");
    const data = await response.json();
    return data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        type: 'movie'
    }));
}
