document.addEventListener('DOMContentLoaded', function() {
    // API Key
    const API_KEY = 'e47c5a8f';
    
    // DOM Elements
    const popularMoviesContainer = document.getElementById('popular-movies');
    const trendingMoviesContainer = document.getElementById('trending-movies');
    const actionMoviesContainer = document.getElementById('action-movies');
    const comedyMoviesContainer = document.getElementById('comedy-movies');
    const searchInput = document.getElementById('search-input');
    const navbar = document.querySelector('.navbar');
    
    // Scroll event for navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Search functionality
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        }
    });
    
    // Fetch and display movies
    fetchMovies('avengers', popularMoviesContainer);
    fetchMovies('batman', trendingMoviesContainer);
    fetchMovies('action', actionMoviesContainer);
    fetchMovies('comedy', comedyMoviesContainer);
    
    // Function to fetch movies from OMDB API
    function fetchMovies(query, container) {
        fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&type=movie`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    displayMovies(data.Search, container);
                } else {
                    container.innerHTML = '<p>No movies found</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching movies:', error);
                container.innerHTML = '<p>Error loading movies</p>';
            });
    }
    
    // Function to display movies
    function displayMovies(movies, container) {
        container.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            
            movieCard.innerHTML = `
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster'}" alt="${movie.Title}">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.Title}</h3>
                    <p class="movie-year">${movie.Year}</p>
                </div>
            `;
            
            container.appendChild(movieCard);
        });
    }
    
    // Function to search movies
    function searchMovies(query) {
        const allContainers = [
            popularMoviesContainer, 
            trendingMoviesContainer, 
            actionMoviesContainer, 
            comedyMoviesContainer
        ];
        
        // Clear all containers
        allContainers.forEach(container => {
            container.innerHTML = '<p>Searching...</p>';
        });
        
        // Search and display in the first container
        fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&type=movie`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === 'True') {
                    // Clear all containers
                    allContainers.forEach(container => {
                        container.innerHTML = '';
                    });
                    
                    // Display results in the popular movies container
                    displayMovies(data.Search, popularMoviesContainer);
                    
                    // Update section title
                    document.querySelector('.section-title').textContent = `Search Results for "${query}"`;
                } else {
                    popularMoviesContainer.innerHTML = `<p>No results found for "${query}"</p>`;
                }
            })
            .catch(error => {
                console.error('Error searching movies:', error);
                popularMoviesContainer.innerHTML = '<p>Error searching movies</p>';
            });
    }
});