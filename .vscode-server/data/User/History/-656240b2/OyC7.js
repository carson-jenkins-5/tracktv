const API_KEY = "68d6cd9baadb236523ec6497d0e352a5";
const API_READ_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OGQ2Y2Q5YmFhZGIyMzY1MjNlYzY0OTdkMGUzNTJhNSIsIm5iZiI6MTc0MDc4OTgxOC4xODIwMDAyLCJzdWIiOiI2N2MyNTgzYTc2YTM2OGY3MDZkYmQ5YzUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.Namlr-mbvRZwaF2lOEoj3YZIRrdsElBpsSH6XF-0sOU";
const BASE_URL = "https://api.themoviedb.org/3";

// Fetch trending TV shows
async function fetchTrendingShows() {
  const response = await fetch(`${BASE_URL}/tv/popular`, {
    headers: {
      Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.results;
}

// Fetch trending movies
async function fetchTrendingMovies() {
  const response = await fetch(`${BASE_URL}/movie/popular`, {
    headers: {
      Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.results;
}

// Search for movies and TV shows
async function searchMovies(query) {
  const response = await fetch(
    `${BASE_URL}/search/multi?query=${query}&api_key=${API_KEY}`
  );
  const data = await response.json();
  return data.results;
}