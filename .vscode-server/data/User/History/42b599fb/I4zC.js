document.addEventListener("DOMContentLoaded", async function () {
    const topShowsContainer = document.getElementById("top-shows");
    const trendingShowsContainer = document.getElementById("trending-shows");
    const trendingMoviesContainer = document.getElementById("trending-movies");

    // Load trending shows
    const trendingShows = await fetch("/api/shows").then(res => res.json());
    trendingShows.forEach(show => {
        const img = document.createElement("img");
        img.src = `https://via.placeholder.com/120x180`; // Replace with real API
        img.alt = show.name;
        topShowsContainer.appendChild(img);
    });

    // Navigation
    document.getElementById("navbar").addEventListener("click", function (e) {
        if (e.target.tagName === "BUTTON") {
            alert(`Switching to ${e.target.getAttribute("data-page")} page!`);
        }
    });
});