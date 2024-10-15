import { useState, useEffect } from 'react';

const GameSearch = () => {
    const [query, setQuery] = useState('');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGame, setSelectedGame] = useState(null);

    useEffect(() => {
        if (query) {
            handleSearch();
        }
    }, []);

    const handleSearch = async () => {
        if (query.trim() === '') {
            setError('Please enter a search query.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=YOUR_API_KEY`
            );
            if (response.ok) {
                const data = await response.json();
                setGames(data.results || []);
            } else {
                setError('Failed to fetch games');
                setGames([]);
            }
        } catch (err) {
            console.error('Error fetching games:', err);  // Log the error
            setError('Error fetching games');
            setGames([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = (game) => {
        console.log('Game added to collection:', game);
        // Logic for adding game to collection
    };

    const handleViewDetails = (game) => {
        setSelectedGame(game);
    };

    return (
        <div className="game-search-container">
            <h2>Search Games</h2>

            <div className="search-controls">
                <input
                    type="text"
                    placeholder="Enter game name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                    className="search-input"
                />
                <button onClick={handleSearch} className="search-button">
                    Search
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            <div className="results-container">
                {games.map((game) => {
                    const { name, released, background_image, rating } = game;
                    const gameImage = background_image || 'https://via.placeholder.com/300x450?text=No+Image+Available';

                    return (
                        <article key={game.id} className="game-card">
                            <img src={gameImage} alt={name} className="game-image" />
                            <div className="game-details">
                                <h3>{name}</h3>
                                {released && <p><strong>Released:</strong> {released}</p>}
                                {rating && <p><strong>Rating:</strong> {rating}</p>}

                                <div className="actions">
                                    <button onClick={() => handleAddToCollection(game)} className="add-button">
                                        Add to Collection
                                    </button>
                                    <button onClick={() => handleViewDetails(game)} className="details-button">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameSearch;
