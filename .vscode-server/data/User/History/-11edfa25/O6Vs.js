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

        //  Clear existing items before appending new ones
        watchlistContainer.innerHTML = "";
        watchedContainer.innerHTML = "";

        //  Filter watched & unwatched items
        const watchedItems = watchlist.filter(item => item.watched);
        const unwatchedItems = watchlist.filter(item => !item.watched);

        //  Show empty message ONLY if both lists are empty
        emptyMessage.style.display = (watchedItems.length === 0 && unwatchedItems.length === 0) ? "block" : "none";

        //  Function to Create an Item Element
        function createItemElement(item, isWatched) {
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
                        <button onclick="toggleWatchedStatus('${item.id}', ${!isWatched})">
                            ${isWatched ? "Mark as Unwatched" : "Mark as Watched"}
                        </button>
                        <button onclick="removeFromWatchlist('${item.id}')">Remove</button>
                    </div>
                </div>
            `;
            return div;
        }

        //  Append only unique items to each list
        unwatchedItems.forEach(item => watchlistContainer.appendChild(createItemElement(item, false)));
        watchedItems.forEach(item => watchedContainer.appendChild(createItemElement(item, true)));

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

async function toggleWatchedStatus(id, watched) {
    try {
        const response = await fetch(`/backend/watchlist/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ watched }),
        });

        const data = await response.json();
        console.log("Response:", data); //  Debugging log

        if (response.ok) {
            loadWatchlist();  //  Refresh UI instantly
        }
    } catch (error) {
        console.error("Error updating watchlist:", error);
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