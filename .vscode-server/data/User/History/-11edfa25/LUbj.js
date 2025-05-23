async function fetchWatchlist() {
    try {
        const response = await fetch("/backend/watchlist", {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        });
        const watchlist = await response.json();
        const watchlistContainer = document.getElementById("watchlist-items");
        const watchedContainer = document.getElementById("watched-items");

        watchlistContainer.innerHTML = "";
        watchedContainer.innerHTML = "";

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
                        <button onclick="toggleWatchedStatus('${item.id}', ${!item.watched})">
                            ${item.watched ? "Mark as Unwatched" : "Mark as Watched"}
                        </button>
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
    if (!checkAuth()) return; // Verify authentication
    document.querySelectorAll(".menu-dropdown").forEach(menu => {
        if (menu.id === `menu-${id}`) {
            menu.classList.toggle("show");
        } else {
            menu.classList.remove("show"); // Close other menus
        }
    });
}

async function addToWatchlist(id, title, image, type) {
    if (!checkAuth()) return; // Require authentication

    try {
        const response = await fetch("/backend/watchlist", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ id, title, image, type }),
        });

        const data = await response.json();

        if (response.ok) {
            loadWatchlist();  // Reload the watchlist immediately
        }
    } catch (error) {
        console.error("Network error. Try again.");
    }
}

// Function to Remove from Watchlist
async function removeFromWatchlist(id) {
    if (!checkAuth()) return; // Verify authentication

    const response = await fetch(`/backend/watchlist/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.ok) {
        loadWatchlist(); // Refresh UI instead of showing an alert
    }
}

async function toggleWatchedStatus(id, watched) {
    if (!checkAuth()) return; // Verify authentication

    try {
        const response = await fetch(`/backend/watchlist/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ watched }),
        });

        if (response.ok) {
            loadWatchlist();  // Refresh UI instantly
        }
    } catch (error) {
        console.error("Error updating watchlist:", error);
    }
}

function checkAuth() {
    return !!localStorage.getItem('token'); // Check if the token exists
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

// Run on page load
document.addEventListener("DOMContentLoaded", async function () {
    loadWatchlist(); // Load watchlist on page load
});

// Logout function to remove token
function logout() {
    localStorage.removeItem('token'); // Remove the authentication token
    // Additional logout logic can go here
}