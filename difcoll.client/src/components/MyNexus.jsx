import { useEffect, useState } from 'react';
import NexusService from './NexusService';
import PropTypes from 'prop-types';
import './MyNexus.css';

const MyNexus = ({ userId }) => {
    const [nexusItems, setNexusItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItemIds, setExpandedItemIds] = useState([]); // Track which items are expanded

    useEffect(() => {
        const fetchNexusItems = async () => {
            setLoading(true); // Reset loading state on fetch
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

    if (loading) {
        return <div>Loading your collections...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="nexus-collection">
            <h2>My Nexus Collection</h2>
            {nexusItems.length === 0 ? (
                <p>You have no items in your collection yet.</p>
            ) : (
                <div className="nexus-items-grid">
                    {nexusItems.map((item) => {
                        const isExpanded = expandedItemIds.includes(item.id);
                        const descriptionPreview = item.description
                            ? item.description.slice(0, 100) + '...'
                            : '';

                        return (
                            <div
                                key={`${item.id}-${item.type}`} // Ensure unique key by combining id and type
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

                                    {/* Conditionally render details based on type */}
                                    {item.type === 'book' && (
                                        <>
                                            <p>Author: {item.authors || 'N/A'}</p>
                                        </>
                                    )}

                                    {item.type === 'movie' && (
                                        <>
                                            <p>Directors: {item.directors || 'N/A'}</p>
                                        </>
                                    )}

                                    <p>
                                        Genres: {item.genres || 'N/A'}
                                    </p>
                                    <p>
                                        Description:{' '}
                                        {isExpanded ? item.description : descriptionPreview}
                                        {item.description && (
                                            <button
                                                onClick={() => toggleReadMore(item.id)}
                                                className="read-more-btn"
                                            >
                                                {isExpanded ? 'Read less' : 'Read more'}
                                            </button>
                                        )}
                                    </p>
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
