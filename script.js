document.addEventListener('DOMContentLoaded', function() {
    // API Configuration
    const API_KEY = 'e47c5a8f'; 
    const BASE_URL = 'https://www.omdbapi.com/';
    
    // DOM Elements
    const popularMoviesContainer = document.getElementById('popular-movies');
    const trendingMoviesContainer = document.getElementById('trending-movies');
    const actionMoviesContainer = document.getElementById('action-movies');
    const comedyMoviesContainer = document.getElementById('comedy-movies');
    const searchInput = document.getElementById('search-input');
    const navbar = document.querySelector('.navbar');
    const modal = document.createElement('div');
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Event Listeners
    window.addEventListener('scroll', handleScroll);
    searchInput.addEventListener('keypress', handleSearch);
    modal.addEventListener('click', closeModal);
    
    // UPDATE: Added search button event listener if button exists
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        });
    }
    
    // UPDATE: Added reset button event listener if button exists
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetToInitialView);
    }
    
    // Initialize the page
    initializePage();
    
    // Functions
    function handleScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 100);
    }
    
    function handleSearch(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                // UPDATE: Clear input after search
                searchInput.value = '';
                searchMovies(query);
            }
        }
    }
    
    function closeModal(e) {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            modal.style.display = 'none';
            modal.innerHTML = '';
        }
    }
    
    function initializePage() {
        // Fetch movies for different categories
        fetchAndDisplayMovies('avengers', popularMoviesContainer, 'Popular Movies');
        fetchAndDisplayMovies('batman', trendingMoviesContainer, 'Trending Now');
        fetchAndDisplayMovies('action', actionMoviesContainer, 'Action Movies');
        fetchAndDisplayMovies('comedy', comedyMoviesContainer, 'Comedy Movies');
    }
    
    // UPDATE: Added reset function
    function resetToInitialView() {
        searchInput.value = '';
        initializePage();
        
        // UPDATE: Reset section titles
        document.querySelectorAll('.section-title').forEach((title, index) => {
            const defaultTitles = ['Popular Movies', 'Trending Now', 'Action Movies', 'Comedy Movies'];
            if (index < defaultTitles.length) {
                title.textContent = defaultTitles[index];
            }
        });
    }
    
    async function fetchAndDisplayMovies(query, container, title) {
        try {
            container.innerHTML = '<div class="loading">Loading...</div>';
            const data = await fetchMovies(query);
            
            if (data.Response === 'True') {
                // Filter out movies without posters
                const moviesWithPosters = data.Search.filter(movie => movie.Poster !== 'N/A');
                displayMovies(moviesWithPosters, container);
                
                // Update section title if provided
                if (title && container.previousElementSibling.classList.contains('section-title')) {
                    container.previousElementSibling.textContent = title;
                }
            } else {
                container.innerHTML = '<p class="error">No movies found</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = '<p class="error">Failed to load movies</p>';
        }
    }
    
    async function fetchMovies(query) {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${query}&type=movie`);
        return await response.json();
    }
    
    function displayMovies(movies, container) {
        container.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = createMovieCard(movie);
            container.appendChild(movieCard);
        });
    }
    
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        
        movieCard.innerHTML = `
            <img src="${movie.Poster}" 
                 alt="${movie.Title}"
                 onerror="this.src='https://via.placeholder.com/200x300?text=Poster+Not+Available'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
            </div>
        `;
        
        movieCard.addEventListener('click', () => showMovieDetails(movie.imdbID));
        
        return movieCard;
    }
    
    async function searchMovies(query) {
        if (!query) {
            // UPDATE: If empty query, reset to initial state
            resetToInitialView();
            return;
        }

        const allContainers = [
            popularMoviesContainer, 
            trendingMoviesContainer, 
            actionMoviesContainer, 
            comedyMoviesContainer
        ];
        
        // Clear all containers
        allContainers.forEach(container => {
            container.innerHTML = '<div class="loading">Searching...</div>';
        });
        
        try {
            const data = await fetchMovies(query);
            
            if (data.Response === 'True') {
                // UPDATE: Filter out movies without posters in search results
                const moviesWithPosters = data.Search.filter(movie => movie.Poster !== 'N/A');
                
                if (moviesWithPosters.length === 0) {
                    popularMoviesContainer.innerHTML = `<p class="error">No results with posters found for "${query}"</p>`;
                } else {
                    // Display in first container only
                    displayMovies(moviesWithPosters, popularMoviesContainer);
                    
                    // UPDATE: Update section title more reliably
                    const sectionTitle = popularMoviesContainer.previousElementSibling;
                    if (sectionTitle && sectionTitle.classList.contains('section-title')) {
                        sectionTitle.textContent = `Search Results for "${query}"`;
                    }
                }
                
                // Clear other containers
                allContainers.slice(1).forEach(container => {
                    container.innerHTML = '';
                });
            } else {
                popularMoviesContainer.innerHTML = `<p class="error">No results found for "${query}"</p>`;
                // Clear other containers
                allContainers.slice(1).forEach(container => {
                    container.innerHTML = '';
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            popularMoviesContainer.innerHTML = '<p class="error">Search failed. Please try again.</p>';
        }
    }
    
    async function showMovieDetails(imdbID) {
        try {
            modal.innerHTML = '<div class="loading">Loading details...</div>';
            modal.style.display = 'flex';
            
            const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbID}`);
            const movieDetails = await response.json();
            
            if (movieDetails.Response === 'True') {
                displayMovieModal(movieDetails);
            } else {
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <p>Failed to load movie details</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Details error:', error);
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <p>Error loading details</p>
                </div>
            `;
        }
    }
    
    function displayMovieModal(movie) {
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-poster">
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" 
                         alt="${movie.Title}">
                </div>
                <div class="modal-info">
                    <h2>${movie.Title} (${movie.Year})</h2>
                    <p><strong>Rated:</strong> ${movie.Rated}</p>
                    <p><strong>Runtime:</strong> ${movie.Runtime}</p>
                    <p><strong>Genre:</strong> ${movie.Genre}</p>
                    <p><strong>Director:</strong> ${movie.Director}</p>
                    <p><strong>Actors:</strong> ${movie.Actors}</p>
                    <p><strong>Plot:</strong> ${movie.Plot}</p>
                    <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
                </div>
            </div>
        `;
    }
});