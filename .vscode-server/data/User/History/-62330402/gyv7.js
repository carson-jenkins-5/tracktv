document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("q");

    if (!query) {
        document.getElementById("search-results").innerHTML = "<p>No search query provided.</p>";
        return;
    }

    document.querySelector("h2").textContent = `Search Results for "${query}"`;

    const results = await searchMovies(query);

    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = ""; // Clear previous results

    results.forEach(item => {
        const resultItem = document.createElement("div");
        resultItem.classList.add("search-item");

        resultItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${item.poster_path}" alt="${item.name || item.title}">
            <div class="search-info">
                <p class="search-title">${item.name || item.title}</p>
                <p class="search-subtitle">📽 ${Math.floor(Math.random() * 900) + 100}K added this</p>
            </div>
            <button class="add-button">+</button>
        `;

        resultsContainer.appendChild(resultItem);
    });
});