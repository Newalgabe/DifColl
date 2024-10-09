import { useState } from 'react';
import './BookSearch.css'; // Importing the CSS stylesheet

const BookSearch = () => {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startIndex, setStartIndex] = useState(0); // State for pagination
    const [totalItems, setTotalItems] = useState(0); // To track total number of results

    const handleSearch = async (index = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${index}&maxResults=10`
            );
            if (response.ok) {
                const data = await response.json();
                setBooks(data.items || []);
                setTotalItems(data.totalItems || 0); // Update total results
            } else {
                setError('Failed to fetch books');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error fetching books');
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        const newIndex = startIndex + 10;
        if (newIndex < totalItems) {
            setStartIndex(newIndex);
            handleSearch(newIndex);
        }
    };

    const handlePreviousPage = () => {
        if (startIndex > 0) {
            const newIndex = startIndex - 10;
            setStartIndex(newIndex);
            handleSearch(newIndex);
        }
    };

    const handleAddToCollection = (book) => {
        console.log('Book added to collection:', book);
    };

    return (
        <div className="book-search-container">
            <h2>Search Books</h2>
            <input
                type="text"
                placeholder="Enter book name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />
            <button onClick={() => handleSearch(0)} className="search-button">
                Search
            </button>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            <div className="results-container">
                {books.map((book) => {
                    const { title, authors, publishedDate, description, imageLinks, pageCount, publisher } = book.volumeInfo;
                    return (
                        <article key={book.id} className="book-card">
                            <img
                                src={imageLinks?.thumbnail || 'https://via.placeholder.com/150'}
                                alt={title}
                                className="book-image"
                            />
                            <div className="book-details">
                                <h3>{title}</h3>
                                {authors && <p><strong>Author(s):</strong> {authors.join(', ')}</p>}
                                {publishedDate && <p><strong>Published:</strong> {publishedDate}</p>}
                                {publisher && <p><strong>Publisher:</strong> {publisher}</p>}
                                {pageCount && <p><strong>Pages:</strong> {pageCount}</p>}
                                {description && <p className="description">{description.slice(0, 150)}...</p>}
                                <button
                                    onClick={() => handleAddToCollection(book)}
                                    className="add-button"
                                >
                                    Add to Collection
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
                <button
                    onClick={handlePreviousPage}
                    disabled={startIndex === 0}
                    className="pagination-button"
                >
                    Previous
                </button>
                <button
                    onClick={handleNextPage}
                    disabled={startIndex + 10 >= totalItems}
                    className="pagination-button"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default BookSearch;
