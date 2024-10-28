import { useEffect, useState } from 'react';
import NexusService from './NexusService';
import PropTypes from 'prop-types';
import './MyNexus.css';

const MyNexus = ({ userId }) => {
    const [nexusItems, setNexusItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItemIds, setExpandedItemIds] = useState([]);
    const [sortType, setSortType] = useState('All'); // State for sorting
    const [sortOrder, setSortOrder] = useState('Type'); // New state for sorting order

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

    const toggleReadMore = (id) => {
        setExpandedItemIds((prevExpandedIds) =>
            prevExpandedIds.includes(id)
                ? prevExpandedIds.filter((itemId) => itemId !== id)
                : [...prevExpandedIds, id]
        );
    };

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

    // Filter nexus items based on the selected type
    const filteredItems = nexusItems.filter(item =>
        sortType === 'All' || item.type === sortType
    );

    // Sort items based on selected order (type or rating)
    const sortedItems = filteredItems.sort((a, b) => {
        if (sortOrder === 'Rating') {
            return (b.rating || 0) - (a.rating || 0); // Sort by rating descending
        }
        return a.type.localeCompare(b.type); // Default sort by type
    });

    if (loading) {
        return <div>Loading your collections...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="nexus-collection">
            <h2>My Nexus Collection</h2>

            {/* Sort By Type Dropdown */}
            <div>
                <label htmlFor="sort-type">Filter by Type:</label>
                <select id="sort-type" value={sortType} onChange={handleSortChange}>
                    <option value="All">All</option>
                    <option value="Book">Books</option>
                    <option value="Movie">Movies</option>
                    <option value="Game">Games</option>
                </select>
            </div>

            {/* Sort By Order Dropdown */}
            <div>
                <label htmlFor="sort-order">Sort by:</label>
                <select id="sort-order" value={sortOrder} onChange={handleSortOrderChange}>
                    <option value="Type">Type</option>
                    <option value="Rating">Rating</option>
                </select>
            </div>

            {sortedItems.length === 0 ? (
                <p>You have no items in your collection yet.</p>
            ) : (
                <div className="nexus-items-grid">
                    {sortedItems.map((item) => {
                        const isExpanded = expandedItemIds.includes(item.id);
                        const descriptionPreview = item.description
                            ? item.description.slice(0, 100) + '...'
                            : '';

                        return (
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

                                    {/* Display relevant field based on item type */}
                                    {item.type === 'Book' && (
                                        <p>Author: {item.authors || 'N/A'}</p>
                                    )}
                                    {item.type === 'Movie' && (
                                        <p>Directors: {item.authors || 'N/A'}</p>
                                    )}
                                    {item.type === 'Game' && (
                                        <p>Developer: {item.developers || 'N/A'}</p>
                                    )}

                                    <p>Genres: {item.genres || 'N/A'}</p>
                                    <p>
                                        Description: {isExpanded ? item.description : descriptionPreview}
                                        {item.description && (
                                            <button
                                                onClick={() => toggleReadMore(item.id)}
                                                className="read-more-btn"
                                            >
                                                {isExpanded ? 'Read less' : 'Read more'}
                                            </button>
                                        )}
                                    </p>

                                    <button
                                        onClick={() => handleRemoveItem(item)}
                                        className="remove-item-btn"
                                    >
                                        Remove from Nexus
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

MyNexus.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default MyNexus;
