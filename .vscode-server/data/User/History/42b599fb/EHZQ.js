document.addEventListener("DOMContentLoaded", async function () {
    const topShowsContainer = document.getElementById("top-shows");
    const trendingShowsContainer = document.getElementById("trending-shows");
    const trendingMoviesContainer = document.getElementById("trending-movies");
    const searchInput = document.getElementById("search-input");
    const searchForm = document.getElementById("search-form");
    const cancelBtn = document.getElementById("cancel-btn");

    // Load trending shows
    const trendingShows = await fetchTrendingShows();
    trendingShows.forEach(show => {
        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/w200${show.poster_path}`;
        img.alt = show.name;
        topShowsContainer.appendChild(img);
    });

    // Load trending movies
    const trendingMovies = await fetchTrendingMovies();
    trendingMovies.forEach(movie => {
        const img = document.createElement("img");
        img.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
        img.alt = movie.title;
        trendingMoviesContainer.appendChild(img);
    });

    // ✅ Search Form Submission (Clicking Submit Button)
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        handleSearch();
    });

    // ✅ Pressing "Enter" in the Search Bar Triggers Search
    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSearch();
        }
    });

    // 🔹 Function to Handle Search and Redirect
    function handleSearch() {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    }

    // ✅ Cancel Button: Go Back to the Previous Page
    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            window.history.back();
        });
    }

    // ✅ Navigation Bar Clicks
    document.getElementById("navbar").addEventListener("click", function (e) {
        if (e.target.tagName === "BUTTON") {
            alert(`Switching to ${e.target.getAttribute("data-page")} page!`);
        }
    });
});