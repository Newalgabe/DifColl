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
    const [ratingStats, setRatingStats] = useState({ averageRating: null, ratingsCount: null });
    const [ratings, setRatings] = useState({});
    const [language, setLanguage] = useState('');
    const [isbn, setIsbn] = useState('');
    const [categories, setCategories] = useState([]);
    const [previewLink, setPreviewLink] = useState('');
    const [description, setDescription] = useState(''); // Added description state
    const [loadingRelatedBooks, setLoadingRelatedBooks] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);  // State for the current page




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

    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
    };

    const highlightQuery = (text, query) => {
        if (!text || !query) return text; // Ensure text and query are defined

        const escapedQuery = escapeRegExp(query.trim());
        if (escapedQuery === '') return text; // If query is empty after trimming, return text

        const regex = new RegExp(`(${escapedQuery})`, 'gi');
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

    const handleSearch = async (index) => {
        if (!query.trim()) {
            setError('Please enter a search term.');
            return; // Exit the function if the query is empty
        }

        setLoading(true);
        setError(null);
        const categoryFilter = category ? `+subject:${encodeURIComponent(category)}` : '';
        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}${categoryFilter}&startIndex=${index}&maxResults=10&orderBy=${sortOrder}`
            );
            if (response.ok) {
                const data = await response.json();
                setBooks(data.items || []);
                setTotalItems(data.totalItems || 0);
                setStartIndex(index);

                // Extract ratings and new fields
                const ratingsMap = {};
                data.items.forEach((book) => {
                    const { averageRating } = book.volumeInfo || {};
                    if (averageRating) {
                        ratingsMap[book.id] = averageRating;
                    }
                });
                setRatings(ratingsMap);
            } else {
                setError('Failed to fetch books');
                setBooks([]);
                setTotalItems(0);
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error fetching books');
            setBooks([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (pageNumber) => {
        const newIndex = (pageNumber - 1) * 10;  // Calculate the new start index based on the page number
        setStartIndex(newIndex);
        setCurrentPage(pageNumber);
        handleSearch(newIndex);  // Trigger search with the new start index
    };

    const handleNextPage = () => {
        if (currentPage * 10 < totalItems) {
            setCurrentPage(currentPage + 1);
            handlePageChange(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            handlePageChange(currentPage - 1);
        }
    };


    // Fetch user ID function
    const fetchUserId = async () => {
        try {
            const response = await fetch('https://localhost:7113/api/account/userinfo', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('Fetched userId:', userData.id);  // Check the userId value
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


    // Add book to collection function
    const handleAddToCollection = async (book) => {
        try {
            const userId = await fetchUserId();  // Assuming fetchUserId gets and returns the correct user ID

            if (!userId) {
                showToast('Unable to fetch user information');
                return;
            }

            console.log('Adding to collection for userId:', userId);

            const response = await fetch(`https://localhost:7113/api/Nexus/add/book/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: book.id,
                    title: book.volumeInfo.title,
                    authors: book.volumeInfo.authors?.join(', '),
                    description: book.volumeInfo.description,
                    thumbnail: book.volumeInfo.imageLinks?.thumbnail || "", // Ensure thumbnail is not empty
                    publishedDate: book.volumeInfo.publishedDate || "Unknown", // Ensure you send published date
                    genres: book.volumeInfo.categories?.join(', ') || "Unknown", // Ensure you send genre
                    rating: book.volumeInfo.averageRating || 0 // Ensure you send rating
                }),

            });

            if (response.ok) {
                console.log('Book added to collection:', book);
                showToast('Book added to collection!');
            } else {
                const errorData = await response.json().catch(() => ({})); // Handle empty or non-JSON response
                console.error('Failed to add book:', errorData);
                showToast('Failed to add book to collection');
            }
        } catch (error) {
            console.error('Error adding book to collection:', error);
            showToast('An error occurred while adding the book.');
        }
    };


    const handleRelatedBooks = async (book) => {
        try {
            setLoadingRelatedBooks(true); // Set loading to true when fetching related books

            // Check if related books are cached
            if (relatedBooksCache[book.id]) {
                setRelatedBooks(relatedBooksCache[book.id]);
                setLoadingRelatedBooks(false); // Set loading to false after fetching from cache
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
                setLoadingRelatedBooks(false);
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
        } finally {
            setLoadingRelatedBooks(false); // Ensure loading is set to false once the fetch is done
        }
    };


    const handleViewDetails = (book) => {
        if (book && book.volumeInfo) {
            const { title, authors, description, averageRating, ratingsCount, language, industryIdentifiers, categories, previewLink } = book.volumeInfo;

            // Set new fields
            setRatingStats({ averageRating, ratingsCount });
            setLanguage(language);
            setIsbn(industryIdentifiers?.[0]?.identifier || 'N/A');
            setCategories(categories || []);
            setPreviewLink(previewLink || '');
            setDescription(description || 'No description available.'); // Added line

            console.log("Book Details:", title, authors, description, averageRating, ratingsCount, language, isbn, categories, previewLink);

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

    return (
        <div className="book-search-container">
            <h2>Search Books</h2>

            <div className="search-controls">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Enter book name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(0);
                        }
                    }}
                    className="search-input"
                />

                {/* Sort Order Dropdown */}
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(0);
                        }
                    }}
                    className="sort-select"
                >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                </select>

                {/* Category Input */}
                <input
                    type="text"
                    placeholder="Category (optional)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(0);
                        }
                    }}
                    className="category-input"
                />

                {/* Search Button */}
                <button
                    onClick={() => handleSearch(0)}
                    className="search-button"
                    disabled={loading} // Disable the button when loading
                >
                    {loading ? <div className="spinner"></div> : 'Search'} {/* Show spinner or text based on loading state */}
                </button>
            </div>


            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            <div className="results-container">
                {books.map((book) => {
                    const { title = '', authors, publishedDate, description, imageLinks, pageCount, publisher } = book.volumeInfo || {};

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
                                {ratingStats.averageRating && <p><strong>Average Rating:</strong> {ratingStats.averageRating}</p>}
                                {ratingStats.ratingsCount && <p><strong>Ratings Count:</strong> {ratingStats.ratingsCount}</p>}
                                {ratings[book.id] && <p><strong>User Rating:</strong> {ratings[book.id]}</p>} {/* Updated line */}
                                {language && <p><strong>Language:</strong> {language}</p>}
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
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    Previous
                </button>

                <input
                    type="number"
                    value={currentPage}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    min="1"
                    max={Math.ceil(totalItems / 10)}  // Maximum number of pages
                    className="page-input"
                />

                <span> / {Math.ceil(totalItems / 10)}</span>  {/* Total number of pages */}

                <button
                    onClick={handleNextPage}
                    disabled={currentPage * 10 >= totalItems}
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
                        {selectedBook.volumeInfo.averageRating && (
                            <p><strong>Average Rating:</strong> {selectedBook.volumeInfo.averageRating}</p>
                        )}
                        {selectedBook.volumeInfo.ratingsCount && (
                            <p><strong>Ratings Count:</strong> {selectedBook.volumeInfo.ratingsCount}</p>
                        )}
                        {language && (
                            <p><strong>Language:</strong> {language}</p>
                        )}
                        {isbn && (
                            <p><strong>ISBN:</strong> {isbn}</p>
                        )}
                        {categories.length > 0 && (
                            <p><strong>Categories:</strong> {categories.join(', ')}</p>
                        )}
                        {description && (
                            <p className="description">{description}</p>
                        )}
                        {previewLink && (
                            <a href={previewLink} target="_blank" rel="noopener noreferrer">
                                Read more
                            </a>
                        )}

                        <div className="related-books-container">
                            <h3>Related Books</h3>
                            {loadingRelatedBooks ? (
                                <div className="spinner"></div> // Spinner displayed when loading
                            ) : relatedBooks.length > 0 ? (
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
                                                {book.volumeInfo.authors && <p>by {book.volumeInfo.authors.join(', ')}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No related books found.</p>
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

            {toastMessage && (
                <div className="toast">
                    <p>{toastMessage}</p>
                </div>
            )}
        </div>
    );

};

export default BookSearch;
