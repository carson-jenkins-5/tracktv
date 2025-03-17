document.addEventListener("DOMContentLoaded", async function () {
  const searchInput = document.getElementById("search-input");
  const searchResultsContainer = document.createElement("div");
  searchResultsContainer.id = "search-results";
  searchInput.parentNode.appendChild(searchResultsContainer);

  async function handleSearch(query) {
      if (query.length < 3) {
          searchResultsContainer.innerHTML = ""; // Clear results if query is too short
          return;
      }

      const results = await searchMovies(query);

      searchResultsContainer.innerHTML = ""; // Clear previous results

      if (results.length === 0) {
          searchResultsContainer.innerHTML = "<p>No results found.</p>";
          return;
      }

      results.slice(0, 5).forEach(item => { // Limit to 5 results
          const resultItem = document.createElement("div");
          resultItem.classList.add("search-item");

          const img = document.createElement("img");
          img.src = item.poster_path
              ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
              : "https://via.placeholder.com/100x150";
          img.alt = item.name || item.title;

          const info = document.createElement("div");
          info.classList.add("search-info");

          const title = document.createElement("p");
          title.classList.add("search-title");
          title.innerText = item.name || item.title;

          info.appendChild(title);
          resultItem.appendChild(img);
          resultItem.appendChild(info);
          searchResultsContainer.appendChild(resultItem);
      });
  }

  searchInput.addEventListener("input", (e) => {
      handleSearch(e.target.value);
  });
});