// MovieSearch.jsx
import { useState, useEffect } from 'react';
import { FaFilm, FaTimes } from 'react-icons/fa';
import { api } from '../api';
import './MovieSearch.css';


const MovieSearch = () => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [relatedMovies, setRelatedMovies] = useState([]);
    const [relatedMoviesCache, setRelatedMoviesCache] = useState({});
    const [toastMessage, setToastMessage] = useState('');
    const [sortOrder, setSortOrder] = useState('relevance'); // Updated sortOrder state
    const [genre, setGenre] = useState(''); // New genre state
    const [searched, setSearched] = useState(false);
    const [toastType, setToastType] = useState('success');

    // Load saved search parameters from localStorage on component mount
    useEffect(() => {
        const savedQuery = localStorage.getItem('movieQuery');
        const savedPage = parseInt(localStorage.getItem('moviePage'), 10) || 1;
        const savedSortOrder = localStorage.getItem('movieSortOrder') || 'relevance';
        const savedGenre = localStorage.getItem('movieGenre') || '';

        if (savedQuery) {
            setQuery(savedQuery);
            setSortOrder(savedSortOrder);
            setGenre(savedGenre);
            handleSearch(savedQuery, savedPage, savedSortOrder, savedGenre);
        }
    }, []);

    // Save search parameters to localStorage before unloading
    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.setItem('movieQuery', query);
            localStorage.setItem('moviePage', page);
            localStorage.setItem('movieSortOrder', sortOrder);
            localStorage.setItem('movieGenre', genre);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [query, page, sortOrder, genre]);

    // Function to escape special characters for regex
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
    };

    // Function to highlight the search query in movie titles
    const highlightQuery = (text, query) => {
        if (!text || !query) return text; // Ensure text and query are defined

        const escapedQuery = escapeRegExp(query.trim());
        if (escapedQuery === '') return text; // If query is empty after trimming, return text

        const regex = new RegExp(`(${escapedQuery})`, 'gi'); // Corrected syntax with backticks
        const parts = text.split(regex);

        return parts.map((part, index) => (
            <span
                key={index}
                style={part.toLowerCase() === query.toLowerCase().trim() ? { fontWeight: 'bold', backgroundColor: 'yellow' } : {}}
            >
                {part}
            </span>
        ));
    };

    // Function to handle movie search
    const handleSearch = async (searchQuery = query, searchPage = 1, searchSortOrder = sortOrder, searchGenre = genre) => {
        if (searchQuery.trim() === '') {
            setError('Please enter a search query.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Construct the API URL with query, page, sortOrder, and genre
            let apiUrl = `/api/Movie/search/${encodeURIComponent(searchQuery)}?page=${searchPage}`;

            if (searchSortOrder) {
                apiUrl += `&sortOrder=${encodeURIComponent(searchSortOrder)}`;
            }

            if (searchGenre) {
                apiUrl += `&genre=${encodeURIComponent(searchGenre)}`;
            }

            console.log("Sending request to:", apiUrl);

            const response = await api(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error("Error response:", errorMessage);
                throw new Error(`Error: ${errorMessage}`);
            }

            const data = await response.json();
            console.log('Fetched Movies:', data);
            setMovies(data.movies || []);
            setTotalPages(data.totalPages || 1);
            setPage(data.currentPage || 1);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch movies. Please try again.');
            setMovies([]);
            setTotalPages(1);
            setPage(1);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    // Function to handle moving to the next page
    const handleNextPage = () => {
        if (page < totalPages) {
            handleSearch(query, page + 1, sortOrder, genre);
        }
    };

    // Function to handle moving to the previous page
    const handlePreviousPage = () => {
        if (page > 1) {
            handleSearch(query, page - 1, sortOrder, genre);
        }
    };

    // Function to add a movie to the user's collection
    // Fetch userId function (as with books)
    const fetchUserId = async () => {
        try {
            const response = await api('/api/account/userinfo', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Fetched userId:', userData.id); // Check the userId value
                return userData.id;
            } else {
                console.error('Failed to load user info');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    };

    // Add movie to collection function
    const handleAddToCollection = async (movie) => {
        try {
            const userId = await fetchUserId();

            if (!userId) {
                showToast('Unable to fetch user information', 'error');
                return;
            }

            console.log('Movie data received:', movie);


            const directors = typeof movie.directors === 'string' && movie.directors.trim() !== ''
                ? movie.directors.split(',').map(director => director.trim()).join(', ')
                : 'Unknown';

            console.log('Directors:', directors);

            const genres = typeof movie.genres === 'string' && movie.genres.trim() !== ''
                ? movie.genres.split(',').map(genre => genre.trim()).join(', ')
                : 'Unknown';

            console.log('Genres:', genres);

            const releaseDate = typeof movie.releaseDate === 'string' && movie.releaseDate.trim() !== ''
                ? movie.releaseDate
                : 'Unknown';

            console.log('Release Date:', releaseDate);

            const posterPath = movie.posterPath
                ? `https://image.tmdb.org/t/p/w780${movie.posterPath}`
                : '';
            console.log('Poster Path:', posterPath);

            const overview = movie.overview || 'No description available';

            // Ensure rating is processed as a float
            const rating = typeof movie.rating === 'number'
                ? parseFloat(movie.rating.toFixed(1))
                : 0;

            const movieDto = {
                id: movie.id,
                title: movie.title,
                directors,
                genres,
                releaseDate,
                posterPath,
                overview,
                rating,
            };

            console.log('Final movieDto to send:', movieDto);

            const response = await api(`/api/Nexus/add/movie/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(movieDto),
            });

            if (response.ok) {
                console.log('Movie added to collection!');
                showToast('Movie added to collection!');
            } else {
                console.error('Failed to add movie:', response.status);
                showToast('Failed to add movie to collection', 'error');
            }
        } catch (error) {
            console.error('Error adding movie to collection:', error);
            showToast('An error occurred while adding the movie.', 'error');
        }
    };





    // Function to fetch related movies based on genre
    const handleRelatedMovies = async (movie) => {
        try {
            // Check if the related movies for this movie are already cached
            if (relatedMoviesCache[movie.id]) {
                setRelatedMovies(relatedMoviesCache[movie.id]);
                return;
            }

            const genres = movie.genres.split(', ').map(g => g.trim());

            // If no genres are found, clear the related movies
            if (genres.length === 0) {
                setRelatedMovies([]);
                return;
            }

            // Fetch most popular movies based on the first genre
            const genreQuery = encodeURIComponent(genres[0]);
            const apiUrl = `/api/Movie/search/${genreQuery}?page=1&sortOrder=popularity.desc&genre=${encodeURIComponent(genres[0])}`;

            // Send the API request
            const response = await api(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            // Handle the response if it's successful
            if (response.ok) {
                const data = await response.json();
                const popularMovies = data.movies
                    .filter(m => m.id !== movie.id) // Exclude the current movie
                    .slice(0, 5); // Limit to the top 5 popular movies

                setRelatedMovies(popularMovies);
                setRelatedMoviesCache(prev => ({
                    ...prev,
                    [movie.id]: popularMovies,
                }));
            } else {
                setRelatedMovies([]);
                console.error('Failed to fetch popular movies');
            }
        } catch (error) {
            console.error("Error fetching popular movies:", error);
            setRelatedMovies([]);
        }
    };


    // Function to view detailed information about a movie
    const handleViewDetails = (movie) => {
        console.log("Movie Details:", movie);
        setSelectedMovie(movie);
        handleRelatedMovies(movie);
    };

    // Function to bookmark a movie
    const handleBookmark = (movie) => {
        setBookmarks((prev) => [...prev, movie]);
        showToast('Movie bookmarked successfully!');
    };

    // Function to share a movie link
    const handleShare = (movie) => {
        const shareUrl = `https://www.themoviedb.org/movie/${movie.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Movie link copied to clipboard!');
        }).catch((error) => {
            console.error('Failed to copy: ', error);
            showToast('Failed to copy link.', 'error');
        });
    };

    // Function to handle clicking on a related movie
    const handleRelatedMovieClick = (movie) => {
        setSelectedMovie(movie);
        handleRelatedMovies(movie);
    };

    // Function to display toast notifications
    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

    return (
        <div className="movie-search-container">
            <h2>Search Movies</h2>

            <div className="search-controls">
                {/* Movie Name Input */}
                <input
                    type="text"
                    placeholder="Enter movie name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(query, 1, sortOrder, genre);
                        }
                    }}
                    className="search-input"
                />

                {/* Sort Order Dropdown */}
                <select
                    value={sortOrder}
                    onChange={(e) => {
                        setSortOrder(e.target.value);
                        handleSearch(query, 1, e.target.value, genre);
                    }}
                    className="sort-select"
                >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                </select>

                {/* Genre Input (Optional) */}
                <input
                    type="text"
                    placeholder="Genre (optional)"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(query, 1, sortOrder, e.target.value);
                        }
                    }}
                    className="genre-input"
                />

                {/* Search Button */}
                <button onClick={() => handleSearch(query, 1, sortOrder, genre)} className="search-button">
                    Search
                </button>
            </div>

            {/* Genre Filter Tag */}
            {genre && (
                <div className="active-filters">
                    <span className="filter-tag">{genre} <button onClick={() => setGenre('')}><FaTimes /></button></span>
                </div>
            )}

            {/* Loading Indicator */}
            {loading && <div className="loading-spinner" />}

            {/* Error Message */}
            {error && <p className="error">{error}</p>}

            {/* Empty State */}
            {!loading && !error && searched && movies.length === 0 && (
                <div className="empty-state">
                    <FaFilm className="empty-state-icon" />
                    <h3>No movies found</h3>
                    <p>Try a different search term or genre</p>
                </div>
            )}

            {/* Search Results */}
            <div className="results-container">
                {movies.map((movie) => (
                    <article key={`${movie.id}-${movie.title}`} className="movie-card">
                        <img
                            src={movie.posterPath}
                            alt={movie.title}
                            className="movie-image"
                        />
                        <div className="movie-details">
                            <h3>{highlightQuery(movie.title, query)}</h3>
                            {movie.releaseDate && <p><strong>Release Date:</strong> {movie.releaseDate}</p>}
                            {movie.genres && (
                                <div className="genre-badges">
                                    {movie.genres.split(', ').slice(0, 3).map((g, i) => (
                                        <span key={i} className="genre-badge">{g}</span>
                                    ))}
                                </div>
                            )}
                            {movie.directors && <p><strong>Directors:</strong> {movie.directors}</p>}
                            {movie.overview && <p className="overview">{movie.overview.slice(0, 150)}...</p>}

                            {movie.rating && (
                                <p className="rating-row"><span className="stars">{Array.from({ length: 5 }, (_, i) => i < Math.round(movie.rating / 2) ? <span key={i} className="star-filled">★</span> : <span key={i} className="star-empty">☆</span>)}</span> <span className="rating-value">{movie.rating.toFixed(1)} / 10</span></p>
                            )}

                            <div className="actions">
                                <button
                                    onClick={() => handleAddToCollection(movie)}
                                    className="add-button"
                                >
                                    Add to Collection
                                </button>
                                <button onClick={() => handleBookmark(movie)} className="bookmark-button">
                                    Bookmark
                                </button>
                                <button onClick={() => handleShare(movie)} className="share-button">
                                    Share
                                </button>
                                <button onClick={() => handleViewDetails(movie)} className="details-button">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
                <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="pagination-button"
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="pagination-button"
                >
                    Next
                </button>
            </div>

            {/* Movie Details Modal */}
            {selectedMovie && (
                <div className="modal" onClick={() => setSelectedMovie(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedMovie(null)} className="close-modal">X</button>
                        <h3>{selectedMovie.title}</h3>
                        {selectedMovie.releaseDate && (
                            <p><strong>Release Date:</strong> {selectedMovie.releaseDate}</p>
                        )}
                        {selectedMovie.genres && (
                            <p><strong>Genres:</strong> {selectedMovie.genres}</p>
                        )}
                        {selectedMovie.directors && (
                            <p><strong>Directors:</strong> {selectedMovie.directors}</p>
                        )}
                        {selectedMovie.overview && (
                            <p className="overview">{selectedMovie.overview}</p>
                        )}
                        <a href={`https://www.themoviedb.org/movie/${selectedMovie.id}`} target="_blank" rel="noopener noreferrer">
                            View on TMDb
                        </a>

                        {/* Related Movies */}
                        <div className="related-movies-container">
                            <h3>Related Movies</h3>
                            {relatedMovies.length > 0 ? (
                                <div className="related-movies-list">
                                    {relatedMovies.map((movie) => (
                                        <div key={movie.id} className="related-movie-card" onClick={() => handleRelatedMovieClick(movie)}>
                                            <img
                                                src={movie.posterPath || 'https://via.placeholder.com/100x150?text=No+Image'}
                                                alt={movie.title}
                                                className="related-movie-image"
                                            />
                                            <div className="related-movie-info">
                                                <h4>{movie.title}</h4>
                                                {movie.releaseDate && <p>{movie.releaseDate}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No related movies could be found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bookmarks Section */}
            {bookmarks.length > 0 && (
                <div className="bookmarks">
                    <h4>Bookmarked Movies:</h4>
                    <div className="bookmarks-list">
                        {bookmarks.map((bookmark) => (
                            <div key={bookmark.id} className="bookmark-card">
                                <h5>{bookmark.title}</h5>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            {toastMessage && (
                <div className={`toast toast--${toastType}`}>
                    <p>{toastMessage}</p>
                    <div className="toast-progress" />
                </div>
            )}
        </div>
    );

};

export default MovieSearch;
