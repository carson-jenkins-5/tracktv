document.addEventListener("DOMContentLoaded", async function () {
    const topShowsContainer = document.getElementById("top-shows");
    const trendingShowsContainer = document.getElementById("trending-shows");
    const trendingMoviesContainer = document.getElementById("trending-movies");
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    const cancelBtn = document.getElementById("cancel-btn");
    const navbar = document.getElementById("navbar");

    // Load Trending Shows (if container exists)
    if (trendingShowsContainer) {
        try {
            const trendingShows = await fetchTrendingShows();
            trendingShows.forEach(show => {
                const img = document.createElement("img");
                img.src = show.poster_path
                    ? `https://image.tmdb.org/t/p/w200${show.poster_path}`
                    : "https://via.placeholder.com/100x150";
                img.alt = show.name;
                trendingShowsContainer.appendChild(img);
            });
        } catch (error) {
            console.error("Error fetching trending shows:", error);
        }
    }

    // Load Trending Movies (if container exists)
    if (trendingMoviesContainer) {
        try {
            const trendingMovies = await fetchTrendingMovies();
            trendingMovies.forEach(movie => {
                const img = document.createElement("img");
                img.src = movie.poster_path
                    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                    : "https://via.placeholder.com/100x150";
                img.alt = movie.title;
                trendingMoviesContainer.appendChild(img);
            });
        } catch (error) {
            console.error("Error fetching trending movies:", error);
        }
    }

    // Search Form Submission (Clicking Submit Button)
    if (searchForm) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleSearch();
        });
    }

    // Pressing "Enter" in the Search Bar Triggers Search
    if (searchInput) {
        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
            }
        });
    }

    // Function to Handle Search and Redirect
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    }

    // Cancel Button: Go Back to the Previous Page
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            window.history.back();
        });
    }

    // Navbar Clicks: Redirect Instead of Alerting
    if (navbar) {
        navbar.addEventListener("click", function (e) {
            const targetPage = e.target.getAttribute("data-page");
            if (targetPage) {
                window.location.href = targetPage + ".html"; // Redirect to correct page
            }
        });
    }
});