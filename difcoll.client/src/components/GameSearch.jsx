// GameSearch.jsx
import { useState, useEffect } from 'react';
import { FaGamepad, FaTimes } from 'react-icons/fa';
import './GameSearch.css';

const GameSearch = () => {
    const [query, setQuery] = useState('');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedGame, setSelectedGame] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [relatedGames, setRelatedGames] = useState([]);
    const [relatedGamesCache, setRelatedGamesCache] = useState({});
    const [toastMessage, setToastMessage] = useState('');
    const [sortOrder, setSortOrder] = useState('relevance'); // New sortOrder state
    const [genre, setGenre] = useState(''); // New genre state
    const [searched, setSearched] = useState(false);
    const [toastType, setToastType] = useState('success');

    // Load saved search parameters from localStorage on component mount
    useEffect(() => {
        const savedQuery = localStorage.getItem('gameQuery');
        const savedPage = parseInt(localStorage.getItem('gamePage'), 10) || 1;
        const savedSortOrder = localStorage.getItem('gameSortOrder') || 'relevance';
        const savedGenre = localStorage.getItem('gameGenre') || '';

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
            localStorage.setItem('gameQuery', query);
            localStorage.setItem('gamePage', page);
            localStorage.setItem('gameSortOrder', sortOrder);
            localStorage.setItem('gameGenre', genre);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [query, page, sortOrder, genre]);

    // Function to handle game search
    const handleSearch = async (searchQuery = query, searchPage = 1, searchSortOrder = sortOrder, searchGenre = genre) => {
        if (searchQuery.trim() === '') {
            setError('Please enter a search query.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Construct the API URL with query, page, sortOrder, and genre
            let apiUrl = `/api/Game/search/${encodeURIComponent(searchQuery)}?page=${searchPage}`;

            if (searchSortOrder) {
                apiUrl += `&sortOrder=${encodeURIComponent(searchSortOrder)}`;
            }

            if (searchGenre) {
                apiUrl += `&genre=${encodeURIComponent(searchGenre)}`;
            }

            console.log("Sending request to:", apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorMessage = await response.json();
                console.error("Error response:", errorMessage);
                throw new Error(errorMessage.message || 'Failed to fetch games.');
            }

            const data = await response.json();
            console.log('Fetched Games:', data);
            setGames(data.games || []);
            setTotalPages(data.totalPages || 1);
            setPage(data.currentPage || 1);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to fetch games. Please try again.');
            setGames([]);
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

    const fetchUserId = async () => {
        try {
            const response = await fetch('/api/account/userinfo', {
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
    const handleAddToCollection = async (game) => {
        try {
            const userId = await fetchUserId();

            if (!userId) {
                showToast('Unable to fetch user information', 'error');
                return;
            }

            console.log('Game data received:', game);

            // Process developer and publisher, defaulting to 'Unknown' if not available
            const developer = game.developer || 'Unknown';
            console.log('Developer:', developer);

            const publisher = game.publisher || 'Unknown';
            console.log('Publisher:', publisher);

            // Process genres as a string, splitting if necessary
            const genres = typeof game.genres === 'string' && game.genres.trim() !== ''
                ? game.genres.split(',').map(genre => genre.trim()).join(', ')
                : 'Unknown';
            console.log('Genres:', genres);

            // Use provided release date, or default to 'Unknown'
            const releaseDate = typeof game.released === 'string' && game.released.trim() !== ''
                ? game.released
                : 'Unknown';
            console.log('Release Date:', releaseDate);

            // Background image URL setup, or an empty string if missing
            const backgroundImage = game.backgroundImage
                ? game.backgroundImage
                : '';
            console.log('Background Image:', backgroundImage);

            // Game description fallback
            const description = game.description || 'No description available';

            // Ensure rating is processed as a float
            const rating = typeof game.rating === 'number'
                ? parseFloat(game.rating.toFixed(1))
                : 0;

            // Build the final GameDto object
            const gameDto = {
                id: game.id,
                name: game.name,
                developer,
                publisher,
                genres,
                released: releaseDate,
                backgroundImage,
                description,
                rating,
            };

            console.log('Final gameDto to send:', gameDto);

            // Send the request to add the game to the collection
            const response = await fetch(`/api/Nexus/add/game/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameDto),
            });

            if (response.ok) {
                console.log('Game added to collection!');
                showToast('Game added to collection!');
            } else {
                console.error('Failed to add game:', response.status);
                showToast('Failed to add game to collection', 'error');
            }
        } catch (error) {
            console.error('Error adding game to collection:', error);
            showToast('An error occurred while adding the game.', 'error');
        }
    };




    // Function to fetch related games based on genre
    const handleRelatedGames = async (game) => {
        try {
            // Check if related games are cached
            if (relatedGamesCache[game.id]) {
                setRelatedGames(relatedGamesCache[game.id]);
                return;
            }

            const genres = game.genres.split(', ').map(g => g.trim());

            if (genres.length === 0) {
                setRelatedGames([]);
                return;
            }

            // Fetch related games based on the first genre
            const genreQuery = encodeURIComponent(genres[0]);
            const apiUrl = `/api/Game/search/${genreQuery}?page=1&sortOrder=rating&genre=${encodeURIComponent(genres[0])}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();

                // Filter out the current game
                const otherGames = data.games.filter(g => g.id !== game.id);

                // Separate same series games and others
                const sameSeriesGames = otherGames.filter(g => g.series === game.series); // Assuming 'series' is a property in your game objects
                const otherRelatedGames = otherGames.filter(g => g.series !== game.series);

                // Sort both arrays by rating
                const sortedSameSeriesGames = sameSeriesGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                const sortedOtherRelatedGames = otherRelatedGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));

                // Combine and limit to top 5
                const combinedGames = [...sortedSameSeriesGames, ...sortedOtherRelatedGames];
                const topRatedRelatedGames = combinedGames.slice(0, 5); // Get the top 5

                setRelatedGames(topRatedRelatedGames);
                setRelatedGamesCache(prev => ({ ...prev, [game.id]: topRatedRelatedGames }));
            } else {
                setRelatedGames([]);
                console.error('Failed to fetch related games');
            }
        } catch (error) {
            console.error("Error fetching related games:", error);
            setRelatedGames([]);
        }
    };




    // Function to view detailed information about a game
    const handleViewDetails = (game) => {
        console.log("Game Details:", game);
        setSelectedGame(game);
        handleRelatedGames(game);
    };

    // Function to bookmark a game
    const handleBookmark = (game) => {
        // Prevent duplicate bookmarks
        if (!bookmarks.some(b => b.id === game.id)) {
            setBookmarks((prev) => [...prev, game]);
            showToast('Game bookmarked successfully!');
        } else {
            showToast('Game is already bookmarked.');
        }
    };

    // Function to share a game link
    const handleShare = (game) => {
        const shareUrl = `https://www.rawg.io/games/${game.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Game link copied to clipboard!');
        }).catch((error) => {
            console.error('Failed to copy: ', error);
            showToast('Failed to copy link.', 'error');
        });
    };

    // Function to handle clicking on a related game
    const handleRelatedGameClick = (game) => {
        setSelectedGame(game);
        handleRelatedGames(game);
    };

    // Function to display toast notifications
    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

    // Function to escape special characters for regex
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
    };

    // Function to highlight the search query in game titles
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

    return (
        <div className="game-search-container">
            <h2>Search Games</h2>

            <div className="search-controls">
                {/* Game Name Input */}
                <input
                    type="text"
                    placeholder="Enter game name..."
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
            {!loading && !error && searched && games.length === 0 && (
                <div className="empty-state">
                    <FaGamepad className="empty-state-icon" />
                    <h3>No games found</h3>
                    <p>Try a different search term or genre</p>
                </div>
            )}

            {/* Search Results */}
            <div className="results-container">
                {games.map((game) => (
                    <article key={`${game.id}-${game.name}`} className="game-card">
                        <img
                            src={game.backgroundImage}
                            alt={game.name}
                            className="game-image"
                        />
                        <div className="game-details">
                            <h3>{highlightQuery(game.name, query)}</h3>
                            {game.released && <p><strong>Released:</strong> {game.released}</p>}
                            {game.rating && (
                                <p className="rating-row"><span className="stars">{Array.from({ length: 5 }, (_, i) => i < Math.round(game.rating / 2) ? <span key={i} className="star-filled">★</span> : <span key={i} className="star-empty">☆</span>)}</span> <span className="rating-value">{game.rating.toFixed(1)} / 5</span></p>
                            )}
                            {game.genres && (
                                <div className="genre-badges">
                                    {game.genres.split(', ').slice(0, 3).map((g, i) => (
                                        <span key={i} className="genre-badge">{g}</span>
                                    ))}
                                </div>
                            )}
                            {game.developer && <p><strong>Developer:</strong> {game.developer}</p>}
                            {game.publisher && <p><strong>Publisher:</strong> {game.publisher}</p>}
                            {game.description && <p className="description">{game.description.slice(0, 150)}...</p>}

                            <div className="actions">
                                <button
                                    onClick={() => handleAddToCollection(game)}
                                    className="add-button"
                                >
                                    Add to Collection
                                </button>
                                <button onClick={() => handleBookmark(game)} className="bookmark-button">
                                    Bookmark
                                </button>
                                <button onClick={() => handleShare(game)} className="share-button">
                                    Share
                                </button>
                                <button onClick={() => handleViewDetails(game)} className="details-button">
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

            {selectedGame && (
                <div className="modal" onClick={() => setSelectedGame(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedGame(null)} className="close-modal">X</button>
                        <h3>{selectedGame.name}</h3>
                        {selectedGame.released && (
                            <p><strong>Released:</strong> {selectedGame.released}</p>
                        )}
                        {selectedGame.rating && (
                            <p><strong>Rating:</strong> {selectedGame.rating}</p>
                        )}
                        {selectedGame.genres && (
                            <p><strong>Genres:</strong> {selectedGame.genres}</p>
                        )}
                        {selectedGame.developer && (
                            <p><strong>Developer:</strong> {selectedGame.developer}</p>
                        )}
                        {selectedGame.publisher && (
                            <p><strong>Publisher:</strong> {selectedGame.publisher}</p>
                        )}
                        {selectedGame.description && (
                            <p className="description">{selectedGame.description}</p>
                        )}
                        <a href={`https://www.rawg.io/games/${selectedGame.id}`} target="_blank" rel="noopener noreferrer">
                            View on RAWG
                        </a>

                        {/* Related Games */}
                        <div className="related-games-container">
                            <h3>Related Games</h3>
                            {relatedGames.length > 0 ? (
                                <div className="related-games-list">
                                    {relatedGames.map((game) => (
                                        <div key={game.id} className="related-game-card" onClick={() => handleRelatedGameClick(game)}>
                                            <img
                                                src={game.backgroundImage || 'https://via.placeholder.com/100x150?text=No+Image'}
                                                alt={game.name}
                                                className="related-game-image"
                                            />
                                            <div className="related-game-info">
                                                <h4>{highlightQuery(game.name, query)}</h4>
                                                {game.released && <p>{game.released}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No related games could be found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bookmarks Section */}
            {bookmarks.length > 0 && (
                <div className="bookmarks">
                    <h4>Bookmarked Games:</h4>
                    <div className="bookmarks-list">
                        {bookmarks.map((bookmark) => (
                            <div key={bookmark.id} className="bookmark-card">
                                <h5>{bookmark.name}</h5>
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

export default GameSearch;
