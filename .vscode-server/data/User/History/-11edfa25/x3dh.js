document.addEventListener("DOMContentLoaded", async function () {
    loadWatchlist(); // Load watchlist on page load
});

async function loadWatchlist() {
    try {
        const response = await fetch("/backend/watchlist");
        const watchlist = await response.json();
        const watchlistContainer = document.getElementById("watchlist-items");
        const watchedContainer = document.getElementById("watched-items");
        const emptyMessage = document.getElementById("empty-watchlist");

        watchlistContainer.innerHTML = "";
        watchedContainer.innerHTML = "";

        if (watchlist.length === 0) {
            emptyMessage.style.display = "block";
            watchlistContainer.style.display = "none";
            watchedContainer.style.display = "none";
            return;
        }

        emptyMessage.style.display = "none";
        watchlistContainer.style.display = "block";
        watchedContainer.style.display = "block";

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
                    <button class="menu-button" onclick="toggleMenu('${item.id}')">⋮</button>
                    <div class="menu-dropdown" id="menu-${item.id}">
                        <button onclick="markAsWatched('${item.id}')">${item.watched ? "Move to Watchlist" : "Move to Watched"}</button>
                        <button onclick="removeFromWatchlist('${item.id}')">Remove</button>
                    </div>
                </div>
            `;

            if (item.watched) {
                watchedContainer.appendChild(div);
            } else {
                watchlistContainer.appendChild(div);
            }
        });
    } catch (error) {
        console.error("Error loading watchlist:", error);
    }
}

// Toggle Menu Visibility
function toggleMenu(id) {
    document.querySelectorAll(".menu-dropdown").forEach(menu => {
        if (menu.id === `menu-${id}`) {
            menu.classList.toggle("show");
        } else {
            menu.classList.remove("show"); // Close other menus
        }
    });
}

async function addToWatchlist(id, title, image, type) {
    try {
        const response = await fetch("/backend/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, title, image, type }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`${title} added to your watchlist!`);
            loadWatchlist();  // Reload the watchlist immediately
        } else {
            alert(data.error || "An error occurred while adding to watchlist.");
        }
    } catch (error) {
        alert("Network error. Try again.");
    }
}

// Function to Remove from Watchlist
async function removeFromWatchlist(id) {
    const response = await fetch(`/backend/watchlist/${id}`, {
        method: "DELETE",
    });

    if (response.ok) {
        loadWatchlist(); // Refresh UI instead of showing an alert
    }
}

async function markAsWatched(id) {
    const response = await fetch(`/backend/watchlist/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watched: true }),
    });

    if (response.ok) {
        loadWatchlist();  // Refresh UI instantly
    }
}



// Tab Switching for "Watchlist" and "Upcoming"
function showTab(tab) {
    if (tab === "watchlist") {
        document.getElementById("watchlist-container").style.display = "block";
        document.getElementById("watched-container").style.display = "none";
    } else {
        document.getElementById("watchlist-container").style.display = "none";
        document.getElementById("watched-container").style.display = "block";
    }

    document.querySelectorAll(".tabs span").forEach(tabElement => tabElement.classList.remove("active"));
    document.querySelector(`.tabs span[onclick="showTab('${tab}')"]`).classList.add("active");
}