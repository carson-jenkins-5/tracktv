document.addEventListener("DOMContentLoaded", async function () {
    const topShowsContainer = document.getElementById("top-shows");
    const trendingShowsContainer = document.getElementById("trending-shows");
    const trendingMoviesContainer = document.getElementById("trending-movies");
  
    // Load trending shows
    const trendingShows = await fetchTrendingShows();
    trendingShows.forEach((show) => {
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w200${show.poster_path}`;
      img.alt = show.name;
      topShowsContainer.appendChild(img);
    });
  
    // Load trending movies
    const trendingMovies = await fetchTrendingMovies();
    trendingMovies.forEach((movie) => {
      const img = document.createElement("img");
      img.src = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
      img.alt = movie.title;
      trendingMoviesContainer.appendChild(img);
    });
  
    // Search functionality
    document
      .getElementById("search-input")
      .addEventListener("input", async function (e) {
        const query = e.target.value;
        if (query.length < 3) return;
  
        const results = await searchMovies(query);
        console.log(results); // Debugging purposes
      });
  });