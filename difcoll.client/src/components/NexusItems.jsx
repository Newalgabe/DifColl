// NexusItems.jsx
import { useEffect, useState } from 'react';
import NexusService from './NexusService';
import PropTypes from 'prop-types';
import './MyNexus.css';

const NexusItems = ({ userId }) => {
    const [nexusItems, setNexusItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null); // New state for modal
    const [sortType, setSortType] = useState('All');
    const [sortOrder, setSortOrder] = useState('Type');
    const [favorites, setFavorites] = useState([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchNexusItems = async () => {
            setLoading(true);
            try {
                const items = await NexusService.getNexusCollections(userId);
                console.log('Fetched Nexus Items:', items);
                setNexusItems(items);
            } catch (error) {
                setError(error.message || 'Failed to load Nexus collections.');
            } finally {
                setLoading(false);
            }
        };

        fetchNexusItems();
    }, [userId]);

    const handleRemoveItem = async (item) => {
        try {
            if (item.type === "Book") {
                await NexusService.removeBookFromNexus(userId, item.id);
            } else if (item.type === "Movie") {
                await NexusService.removeMovieFromNexus(userId, item.id);
            } else if (item.type === "Game") {
                await NexusService.removeGameFromNexus(userId, item.id);
            }
            setNexusItems((prevItems) => prevItems.filter((nexusItem) => nexusItem.id !== item.id));
        } catch (error) {
            console.error("Failed to remove item:", error);
        }
    };

    const handleSortChange = (event) => {
        setSortType(event.target.value);
    };

    const handleSortOrderChange = (event) => {
        setSortOrder(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const toggleFavorite = (item) => {
        setFavorites((prevFavorites) =>
            prevFavorites.includes(item.id)
                ? prevFavorites.filter((favId) => favId !== item.id)
                : [...prevFavorites, item.id]
        );
    };

    const openModal = (item) => {
        setExpandedItem(item);
    };

    const closeModal = () => {
        setExpandedItem(null);
    };

    const filteredItems = nexusItems
        .filter(item => sortType === 'All' || item.type === sortType)
        .filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.genres && item.genres.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .filter(item => (showFavoritesOnly ? favorites.includes(item.id) : true));

    const sortedItems = filteredItems.sort((a, b) => {
        if (sortOrder === 'Rating') {
            return (b.rating || 0) - (a.rating || 0);
        }
        return a.type.localeCompare(b.type);
    });

    if (loading) {
        return <div>Loading your collections...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="nexus-collection">
            {/* Search */}
            <div>
                <label htmlFor="search">Search:</label>
                <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by title or genre"
                />
            </div>

            {/* Sort & Filter */}
            <div>
                <label htmlFor="sort-type">Filter by Type:</label>
                <select id="sort-type" value={sortType} onChange={handleSortChange}>
                    <option value="All">All</option>
                    <option value="Book">Books</option>
                    <option value="Movie">Movies</option>
                    <option value="Game">Games</option>
                </select>

                <label htmlFor="sort-order">Sort by:</label>
                <select id="sort-order" value={sortOrder} onChange={handleSortOrderChange}>
                    <option value="Type">Type</option>
                    <option value="Rating">Rating</option>
                </select>

                <label>
                    <input
                        type="checkbox"
                        checked={showFavoritesOnly}
                        onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    />
                    Show Favorites Only
                </label>
            </div>

            {sortedItems.length === 0 ? (
                <p>No items found.</p>
            ) : (
                <div className="nexus-items-grid">
                    {sortedItems.map((item) => (
                        <div
                            key={`${item.id}-${item.type}`}
                            className="nexus-item"
                        >
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="item-thumbnail"
                            />
                            <div className="item-details">
                                <h3>{item.title}</h3>
                                <p>Type: {item.type}</p>
                                <p>Rating: {item.rating || 'N/A'}</p>
                                <p>Released: {item.publishedDate || 'N/A'}</p>

                                {item.type === 'Book' && (
                                    <p>Author: {item.authors || 'N/A'}</p>
                                )}
                                {item.type === 'Movie' && (
                                    <p>Directors: {item.authors || 'N/A'}</p>
                                )}
                                {item.type === 'Game' && (
                                    <>
                                        <p>Developer: {item.developer || 'N/A'}</p>
                                        <p>Publisher: {item.publisher || 'N/A'}</p>
                                    </>
                                )}

                                <p>Genres: {item.genres || 'N/A'}</p>
                                <button onClick={() => openModal(item)} className="read-more-btn">Read more</button>

                                <button
                                    onClick={() => handleRemoveItem(item)}
                                    className="remove-item-btn"
                                >
                                    Remove from Nexus
                                </button>
                                <button
                                    onClick={() => toggleFavorite(item)}
                                    className="favorite-item-btn"
                                >
                                    {favorites.includes(item.id) ? 'Unfavorite' : 'Favorite'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Read More */}
            {expandedItem && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{expandedItem.title}</h2>
                        <p>{expandedItem.description}</p>
                        <button onClick={closeModal} className="modal-close-btn">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

NexusItems.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default NexusItems;
