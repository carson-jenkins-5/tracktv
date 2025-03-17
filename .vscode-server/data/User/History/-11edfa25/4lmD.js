async function fetchWatchlist() {
    try {
        const response = await fetch("/backend/watchlist");
        const watchlist = await response.json();

        const showsContainer = document.getElementById("profile-shows");
        const moviesContainer = document.getElementById("profile-movies");
        const watchlistContainer = document.getElementById("watchlist-items");

        const isProfilePage = showsContainer && moviesContainer;
        const isShowsPage = document.getElementById("shows-container");
        const isMoviesPage = document.getElementById("movies-container");

        const renderedItems = new Set();

        // Clear the watchlist container to prevent duplication
        if (isShowsPage || isMoviesPage) {
            watchlistContainer.innerHTML = '';
        }

        watchlist.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("watchlist-item");
            div.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
            `;

            if (!renderedItems.has(item.title)) {
                renderedItems.add(item.title);

                if (item.type === "show") {
                    if (isProfilePage) {
                        showsContainer.appendChild(div);
                    }
                    if (isShowsPage) {
                        watchlistContainer.appendChild(div);
                    }
                } else if (item.type === "movie") {
                    if (isProfilePage) {
                        moviesContainer.appendChild(div);
                    }
                    if (isMoviesPage) {
                        watchlistContainer.appendChild(div);
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching watchlist:", error);
    }
}

// Run on page load
document.addEventListener("DOMContentLoaded", function () {
    fetchWatchlist();
});