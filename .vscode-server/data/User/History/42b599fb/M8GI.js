document.addEventListener("DOMContentLoaded", async function () {
  const topShowsContainer = document.getElementById("top-shows");
  const trendingShowsContainer = document.getElementById("trending-shows");
  const trendingMoviesContainer = document.getElementById("trending-movies");

  // Load trending shows
  const trendingShows = await fetchTrendingShows();
  trendingShows.forEach(show => {
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w200${show.poster_path}`;
      img.alt = show.name;
      topShowsContainer.appendChild(img);
  });

  // Load trending movies
  const trendingMovies = await fetchTrendingMovies();
  trendingMovies.forEach(movie => {
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
      img.alt = movie.title;
      trendingMoviesContainer.appendChild(img);
  });

  document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const query = document.getElementById("search-input").value.trim();
        if (query.length > 0) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    });

  // Navigation
  document.getElementById("navbar").addEventListener("click", function (e) {
      if (e.target.tagName === "BUTTON") {
          alert(`Switching to ${e.target.getAttribute("data-page")} page!`);
      }
  });
});