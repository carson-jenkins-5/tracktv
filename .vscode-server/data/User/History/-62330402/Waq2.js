document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q");

    if (!query) {
        document.getElementById("search-results").innerHTML = "<p>No search query provided.</p>";
        return;
    }

    document.getElementById("search-input").value = query; // Keep query in search bar
    document.querySelector("h2").textContent = `Search Results for "${query}"`;

    try {
        const results = await searchMovies(query);
        displaySearchResults(results);
    } catch (error) {
        console.error("Error fetching search results:", error);
        document.getElementById("search-results").innerHTML = "<p>Failed to load search results. Please try again.</p>";
    }
});

// ✅ Function to Fetch Search Results
async function searchMovies(query) {
    const API_URL = `https://api.themoviedb.org/3/search/multi?api_key=68d6cd9baadb236523ec6497d0e352a5&query=${encodeURIComponent(query)}`;

    const response = await fetch(API_URL);
    const data = await response.json();

    return data.results.map(item => ({
        id: item.id,
        title: item.name || item.title,
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : "https://via.placeholder.com/100x150",
        type: item.media_type
    }));
}

// ✅ Function to Display Search Results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = "";

    results.forEach(item => {
        const resultItem = document.createElement("div");
        resultItem.classList.add("search-item");

        resultItem.innerHTML = `
            <img src="${item.poster_path}" alt="${item.title}">
            <div class="search-info">
                <p class="search-title">${item.title}</p>
                <p class="search-subtitle">📽 ${Math.floor(Math.random() * 900) + 100}K added this</p>
            </div>
            <button class="add-button" onclick="addToWatchlist('${item.id}', '${item.title}', '${item.poster_path}', '${item.type}')">+</button>
        `;

        resultsContainer.appendChild(resultItem);
    });
}

// ✅ Function to Add to Watchlist
async function addToWatchlist(id, title, posterPath, type) {
    const media = { id, title, image: posterPath, type };

    try {
        const response = await fetch("/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(media),
        });

        if (response.ok) {
            alert(`${title} added to watchlist!`);
        } else {
            alert("Already in watchlist or an error occurred.");
        }
    } catch (error) {
        console.error("Error adding to watchlist:", error);
    }
}

// ✅ Cancel Button: Go Back
document.getElementById("cancel-btn").addEventListener("click", function () {
    window.history.back();
});