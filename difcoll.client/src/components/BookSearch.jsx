import { useState, useEffect } from 'react';
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
    const [relatedBooksCache, setRelatedBooksCache] = useState({});
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const savedQuery = localStorage.getItem('query');
        const savedCategory = localStorage.getItem('category');
        const savedSortOrder = localStorage.getItem('sortOrder');
        const savedStartIndex = parseInt(localStorage.getItem('startIndex'), 10) || 0;

        if (savedQuery) setQuery(savedQuery);
        if (savedCategory) setCategory(savedCategory);
        if (savedSortOrder) setSortOrder(savedSortOrder);
        if (savedStartIndex) setStartIndex(savedStartIndex);

        if (savedQuery) {
            handleSearch(savedStartIndex, savedQuery, savedCategory, savedSortOrder);
        }
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.setItem('query', query);
            localStorage.setItem('category', category);
            localStorage.setItem('sortOrder', sortOrder);
            localStorage.setItem('startIndex', startIndex);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [query, category, sortOrder, startIndex]);

    const handleSearch = async (index = 0, searchQuery = query, searchCategory = category, searchSortOrder = sortOrder) => {
        setLoading(true);
        setError(null);
        const categoryFilter = searchCategory ? `+subject:${encodeURIComponent(searchCategory)}` : '';
        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}${categoryFilter}&startIndex=${index}&maxResults=10&orderBy=${searchSortOrder}`
            );
            if (response.ok) {
                const data = await response.json();
                setBooks(data.items || []);
                setTotalItems(data.totalItems || 0);
                setStartIndex(index);
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
            handleSearch(newIndex);
        }
    };

    const handlePreviousPage = () => {
        if (startIndex > 0) {
            const newIndex = startIndex - 10;
            handleSearch(newIndex);
        }
    };

    const handleAddToCollection = (book) => {
        console.log('Book added to collection:', book);
    };

    const handleRelatedBooks = async (book) => {
        try {
            if (relatedBooksCache[book.id]) {
                setRelatedBooks(relatedBooksCache[book.id]);
                return;
            }

            const authors = book.volumeInfo.authors;
            const categories = book.volumeInfo.categories;

            let query = '';

            if (authors && authors.length > 0) {
                query = `inauthor:"${encodeURIComponent(authors[0])}"`;
            } else if (categories && categories.length > 0) {
                query = `subject:"${encodeURIComponent(categories[0])}"`;
            } else {
                query = '';
            }

            if (!query) {
                setRelatedBooks([]);
                return;
            }

            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5&orderBy=relevance`
            );

            if (response.ok) {
                const data = await response.json();
                const related = data.items || [];
                setRelatedBooks(related);
                setRelatedBooksCache(prev => ({ ...prev, [book.id]: related }));
            } else {
                setRelatedBooks([]);
                console.error('Failed to fetch related books');
            }
        } catch (error) {
            console.error("Error fetching related books:", error);
            setRelatedBooks([]);
        }
    };

    const handleViewDetails = (book) => {
        if (book && book.volumeInfo) {
            const { title, authors, description } = book.volumeInfo;
            console.log("Book Details:", title, authors, description);

            setSelectedBook(book);

            handleRelatedBooks(book);
        } else {
            console.warn("Book details not found");
        }
    };

    const handleBookmark = (book) => {
        setBookmarks((prev) => [...prev, book]);
        showToast('Book bookmarked successfully!');
    };

    const handleShare = (book) => {
        const shareUrl = `https://books.google.com/books?id=${book.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Book link copied to clipboard!');
        }).catch((error) => {
            console.error('Failed to copy: ', error);
            showToast('Failed to copy link.');
        });
    };

    const highlightQuery = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? (
                        <span key={i} className="highlight">{part}</span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    const handleRelatedBookClick = (book) => {
        setSelectedBook(book);
        handleRelatedBooks(book);
    };

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage('');
        }, 3000);
    };

    useEffect(() => {
    }, []);

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
            {error && <p className="error">{error}</p>}

            <div className="results-container">
                {books.map((book) => {
                    const { title, authors, publishedDate, description, imageLinks, pageCount, publisher } = book.volumeInfo;
                    const bookImage = imageLinks?.thumbnail?.replace('http://', 'https://').replace('zoom=1', 'zoom=2') || 'https://via.placeholder.com/300x450?text=No+Image+Available';

                    return (
                        <article key={`${book.id}-${title}`} className="book-card">
                            <img
                                src={bookImage}
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

            {selectedBook && (
                <div className="modal" onClick={() => setSelectedBook(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setSelectedBook(null)} className="close-modal">X</button>
                        <h3>{selectedBook.volumeInfo.title}</h3>
                        {selectedBook.volumeInfo.authors && (
                            <p><strong>Author(s):</strong> {selectedBook.volumeInfo.authors.join(', ')}</p>
                        )}
                        {selectedBook.volumeInfo.publishedDate && (
                            <p><strong>Published:</strong> {selectedBook.volumeInfo.publishedDate}</p>
                        )}
                        {selectedBook.volumeInfo.publisher && (
                            <p><strong>Publisher:</strong> {selectedBook.volumeInfo.publisher}</p>
                        )}
                        {selectedBook.volumeInfo.pageCount && (
                            <p><strong>Pages:</strong> {selectedBook.volumeInfo.pageCount}</p>
                        )}
                        {selectedBook.volumeInfo.description && (
                            <p className="description">{selectedBook.volumeInfo.description}</p>
                        )}
                        {selectedBook.volumeInfo.previewLink && (
                            <a href={selectedBook.volumeInfo.previewLink} target="_blank" rel="noopener noreferrer">
                                Read more
                            </a>
                        )}

                        {}
                        <div className="related-books-container">
                            <h3>Related Books</h3>
                            {relatedBooks.length > 0 ? (
                                <div className="related-books-list">
                                    {relatedBooks.map((book) => (
                                        <div key={book.id} className="related-book-card" onClick={() => handleRelatedBookClick(book)}>
                                            <img
                                                src={book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/100'}
                                                alt={book.volumeInfo.title}
                                                className="related-book-image"
                                            />
                                            <div className="related-book-info">
                                                <h4>{book.volumeInfo.title}</h4>
                                                {book.volumeInfo.authors && <p>{book.volumeInfo.authors.join(', ')}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No related books could be found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

            {}
            {toastMessage && (
                <div className="toast">
                    <p>{toastMessage}</p>
                </div>
            )}
        </div>
    );

};

export default BookSearch;
