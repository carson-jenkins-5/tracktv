async function fetchWatchlist() {
    try {
        const response = await fetch("/backend/watchlist");
        const watchlist = await response.json();

        const showsContainer = document.getElementById("profile-shows");
        const moviesContainer = document.getElementById("profile-movies");

        showsContainer.innerHTML = "";
        moviesContainer.innerHTML = "";

        const addedItems = new Set();

        watchlist.forEach(item => {
            if (!addedItems.has(item.id)) {
                addedItems.add(item.id);
                const div = document.createElement("div");
                div.classList.add("watchlist-item");

                div.innerHTML = `
                    <img src="${item.image}" alt="${item.title}">
                    <button onclick="addToWatchlist(${item.id})">Add</button>
                    <button onclick="removeFromWatchlist(${item.id})">Remove</button>
                    <button onclick="toggleWatched(${item.id}, ${item.watched})">${item.watched ? 'Unmark Watched' : 'Mark Watched'}</button>
                `;

                if (item.type === "show") {
                    showsContainer.appendChild(div);
                } else if (item.type === "movie") {
                    moviesContainer.appendChild(div);
                }
            }
        });
    } catch (error) {
        console.error("Error fetching watchlist:", error);
    }
}

async function addToWatchlist(itemId) {
    try {
        await fetch(`/backend/watchlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: itemId })
        });
        fetchWatchlist(); // Refresh the watchlist
    } catch (error) {
        console.error("Error adding to watchlist:", error);
    }
}

async function removeFromWatchlist(itemId) {
    try {
        await fetch(`/backend/watchlist/${itemId}`, {
            method: 'DELETE'
        });
        fetchWatchlist(); // Refresh the watchlist
    } catch (error) {
        console.error("Error removing from watchlist:", error);
    }
}

async function toggleWatched(itemId, currentStatus) {
    try {
        await fetch(`/backend/watchlist/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ watched: !currentStatus })
        });
        fetchWatchlist(); // Refresh the watchlist
    } catch (error) {
        console.error("Error toggling watched status:", error);
    }
}

// Run on page load
document.addEventListener("DOMContentLoaded", function () {
    fetchWatchlist();
});