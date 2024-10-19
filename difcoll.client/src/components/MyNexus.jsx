import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './MyNexus.css'; // Custom CSS for enhanced visuals

const MyNexus = ({ userId }) => {
    const [collections, setCollections] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the Nexus collections on component mount
    useEffect(() => {
        if (!userId) {
            setError("User ID is missing");
            setLoading(false);
            return;
        }

        const fetchCollections = async () => {
            try {
                const response = await fetch(`/api/nexus/collections?userId=${userId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch collections: ${response.statusText}`);
                }
                const data = await response.json();
                setCollections(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchCollections();
    }, [userId]);

    // Filter collections based on selected type
    const filteredCollections = collections.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'books' && item.type === 'Book') return true;
        if (filter === 'movies' && item.type === 'Movie') return true;
        if (filter === 'games' && item.type === 'Game') return true;
        return false;
    });

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="nexus-container" data-aos="fade-up">
            <h1 className="nexus-heading">My Nexus</h1>
            <div className="filter-buttons">
                <button
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'active' : ''}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('books')}
                    className={filter === 'books' ? 'active' : ''}
                >
                    Books
                </button>
                <button
                    onClick={() => setFilter('movies')}
                    className={filter === 'movies' ? 'active' : ''}
                >
                    Movies
                </button>
                <button
                    onClick={() => setFilter('games')}
                    className={filter === 'games' ? 'active' : ''}
                >
                    Games
                </button>
            </div>
            <div className="nexus-collection">
                {filteredCollections.length > 0 ? (
                    filteredCollections.map((item, index) => (
                        <div key={index} className="nexus-item" data-aos="fade-right" data-aos-delay={`${index * 100}`}>
                            <h3 className="nexus-title">{item.title}</h3>
                            <img
                                src={item.thumbnail || 'https://via.placeholder.com/128x195?text=No+Image'}
                                alt={item.title}
                                className="nexus-thumbnail"
                            />
                            <p className="nexus-rating">Rating: {item.rating || 'N/A'}</p>
                            <p className="nexus-type">Type: {item.type}</p>
                        </div>
                    ))
                ) : (
                    <div className="no-items-found">No items found in your collection</div>
                )}
            </div>
        </div>
    );
};

// Prop-types validation
MyNexus.propTypes = {
    userId: PropTypes.string.isRequired
};

export default MyNexus;
