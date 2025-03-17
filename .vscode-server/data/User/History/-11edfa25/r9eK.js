document.addEventListener("DOMContentLoaded", async function () {
    loadWatchlist(); // Load watchlist on page load
});

// ✅ Function to Load Watchlist from Backend
async function loadWatchlist() {
    const response = await fetch("/watchlist");
    const watchlist = await response.json();
    const watchlistContainer = document.getElementById("watchlist-items");
    const emptyMessage = document.getElementById("empty-watchlist");

    watchlistContainer.innerHTML = ""; // Clear previous items

    if (watchlist.length === 0) {
        emptyMessage.style.display = "block"; // Show empty message
        watchlistContainer.style.display = "none";
        return;
    }

    emptyMessage.style.display = "none"; // Hide empty message
    watchlistContainer.style.display = "block";

    watchlist.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("watchlist-item");

        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="watchlist-info">
                <p class="watchlist-title">${item.title}</p>
                <p class="watchlist-subtitle">${item.type.toUpperCase()}</p>
            </div>
            <div class="watchlist-actions">
                <button class="watch-button" onclick="markAsWatched('${item.id}')">✔</button>
                <button class="remove-button" onclick="removeFromWatchlist('${item.id}')">✖</button>
            </div>
        `;

        watchlistContainer.appendChild(div);
    });
}

async function addToWatchlist(id, title, image, type) {
    try {
        const response = await fetch("/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, title, image, type }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`${title} added to your watchlist!`);
            loadWatchlist();  // ✅ Reload the watchlist immediately
        } else {
            alert(data.error || "An error occurred while adding to watchlist.");
        }
    } catch (error) {
        alert("Network error. Try again.");
    }
}

// ✅ Function to Mark as Watched (PUT Request)
async function markAsWatched(id) {
    const response = await fetch(`/watchlist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watched: true }),
    });

    if (response.ok) {
        alert("Marked as watched!");
        loadWatchlist(); // Refresh watchlist
    } else {
        alert("Failed to update.");
    }
}

// ✅ Function to Remove from Watchlist (DELETE Request)
async function removeFromWatchlist(id) {
    const response = await fetch(`/watchlist/${id}`, {
        method: "DELETE",
    });

    if (response.ok) {
        alert("Removed from watchlist!");
        loadWatchlist(); // Refresh watchlist
    } else {
        alert("Failed to remove.");
    }
}

// ✅ Tab Switching for "Watchlist" and "Upcoming"
function showTab(tab) {
    if (tab === "watchlist") {
        document.getElementById("watchlist-container").style.display = "block";
        document.getElementById("empty-watchlist").style.display = "block";
    } else {
        document.getElementById("watchlist-container").style.display = "none";
        document.getElementById("empty-watchlist").style.display = "none";
    }

    document.querySelectorAll(".tabs span").forEach(tab => tab.classList.remove("active"));
    document.querySelector(`.tabs span[onclick="showTab('${tab}')"]`).classList.add("active");
}