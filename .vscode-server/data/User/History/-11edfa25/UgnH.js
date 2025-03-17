document.addEventListener("DOMContentLoaded", async function () {
    const watchlistContainer = document.getElementById("watchlist-items");
    const emptyWatchlist = document.getElementById("empty-watchlist");

    async function loadWatchlist() {
        const res = await fetch("/watchlist");
        const data = await res.json();
        watchlistContainer.innerHTML = "";

        if (data.length === 0) {
            emptyWatchlist.style.display = "block";
            watchlistContainer.style.display = "none";
        } else {
            emptyWatchlist.style.display = "none";
            watchlistContainer.style.display = "block";

            data.forEach(item => {
                const div = document.createElement("div");
                div.classList.add("watchlist-item");
                div.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="watchlist-info">
                        <p class="watchlist-title">${item.name} ${item.season ? `S${item.season} E${item.episode}` : ""}</p>
                        <p class="watchlist-subtitle">${item.type}</p>
                    </div>
                    <div class="watchlist-actions">
                        <button class="watch-button" onclick="markWatched('${item.id}')">✔</button>
                        <button class="remove-button" onclick="removeFromWatchlist('${item.id}')">✖</button>
                    </div>
                `;
                watchlistContainer.appendChild(div);
            });
        }
    }

    async function markWatched(id) {
        await fetch(`/watchlist/${id}`, { method: "PUT" });
        loadWatchlist();
    }

    async function removeFromWatchlist(id) {
        await fetch(`/watchlist/${id}`, { method: "DELETE" });
        loadWatchlist();
    }

    loadWatchlist();
});