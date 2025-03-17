async function fetchWatchlist() {
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
            `;

            if (item.type === "show") {
                showsContainer.appendChild(div);
            } else if (item.type === "movie") {
                moviesContainer.appendChild(div);
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