import { useState } from 'react';
import './BookSearch.css';

const BookSearch = () => {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [category, setCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('relevance');
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [relatedBooks, setRelatedBooks] = useState([]);

    const handleSearch = async (index = 0) => {
        setLoading(true);
        setError(null);
        const categoryFilter = category ? `+subject:${category}` : '';
        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${query}${categoryFilter}&startIndex=${index}&maxResults=10&orderBy=${sortOrder}`
            );
            if (response.ok) {
                const data = await response.json();
                setBooks(data.items || []);
                setTotalItems(data.totalItems || 0);
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

    const handleViewDetails = (book) => {
        setSelectedBook(book);
        handleRelatedBooks(book);
    };

    const handleRelatedBooks = async (book) => {
        const relatedQuery = `subject:${book.volumeInfo.categories[0]}`;
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${relatedQuery}`);
            const data = await response.json();
            setRelatedBooks(data.items || []);
        } catch (error) {
            console.error('Failed to fetch related books', error);
        }
    };

    const handleBookmark = (book) => {
        setBookmarks((prev) => [...prev, book]);
    };

    const handleShare = (book) => {
        const shareUrl = `https://www.yourapp.com/book/${book.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Book link copied to clipboard!');
        });
    };

    const highlightQuery = (text, query) => {
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <span key={i} className="highlight">{part}</span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="book-search-container">
            <h2>Search Books</h2>

            <div className="search-controls">
                <input
                    type="text"
                    placeholder="Enter book name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                />
                <input
                    type="text"
                    placeholder="Category (optional)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="category-input"
                />
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                </select>
                <button onClick={() => handleSearch(0)} className="search-button">
                    Search
                </button>
            </div>

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
                                <h3>{highlightQuery(title, query)}</h3>
                                {authors && <p><strong>Author(s):</strong> {authors.join(', ')}</p>}
                                {publishedDate && <p><strong>Published:</strong> {publishedDate}</p>}
                                {publisher && <p><strong>Publisher:</strong> {publisher}</p>}
                                {pageCount && <p><strong>Pages:</strong> {pageCount}</p>}
                                {description && <p className="description">{description.slice(0, 150)}...</p>}

                                <div className="actions">
                                    <button
                                        onClick={() => handleAddToCollection(book)}
                                        className="add-button"
                                    >
                                        Add to Collection
                                    </button>
                                    <button onClick={() => handleBookmark(book)} className="bookmark-button">
                                        Bookmark
                                    </button>
                                    <button onClick={() => handleShare(book)} className="share-button">
                                        Share
                                    </button>
                                    <button onClick={() => handleViewDetails(book)} className="details-button">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {}
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

            {}
            {selectedBook && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{selectedBook.volumeInfo.title}</h3>
                        <p>{selectedBook.volumeInfo.description}</p>
                        <p>Publisher: {selectedBook.volumeInfo.publisher}</p>
                        <a href={selectedBook.volumeInfo.previewLink} target="_blank" rel="noopener noreferrer">
                            Read more
                        </a>
                        <button onClick={() => setSelectedBook(null)} className="close-modal">Close</button>
                    </div>
                </div>
            )}

            {}
            {relatedBooks.length > 0 && (
                <div className="related-books">
                    <h4>Related Books:</h4>
                    <div className="related-books-list">
                        {relatedBooks.map((relatedBook) => (
                            <div key={relatedBook.id} className="related-book-card">
                                <h5>{relatedBook.volumeInfo.title}</h5>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {}
            {bookmarks.length > 0 && (
                <div className="bookmarks">
                    <h4>Bookmarked Books:</h4>
                    <div className="bookmarks-list">
                        {bookmarks.map((bookmark) => (
                            <div key={bookmark.id} className="bookmark-card">
                                <h5>{bookmark.volumeInfo.title}</h5>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookSearch;
