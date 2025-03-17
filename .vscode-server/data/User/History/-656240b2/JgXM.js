const API_KEY = "68d6cd9baadb236523ec6497d0e352a5";
const BASE_URL = "https://api.themoviedb.org/3";

// Fetch trending TV shows
async function fetchTrendingShows() {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
}

// Fetch trending movies
async function fetchTrendingMovies() {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
}

// Search movies/shows
async function searchMovies(query) {
    const response = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
    const data = await response.json();
    return data.results;
}