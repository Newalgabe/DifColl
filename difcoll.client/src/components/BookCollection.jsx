import { useEffect, useState } from 'react';

const BookCollection = () => {
    const [books, setBooks] = useState([]);

    const fetchCollection = async () => {
        try {
            const response = await fetch('https://localhost:7113/api/collection/books', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setBooks(data);
            } else {
                console.error('Failed to fetch collection');
            }
        } catch (error) {
            console.error('Error fetching collection:', error);
        }
    };

    useEffect(() => {
        fetchCollection();
    }, []);

    return (
        <div>
            <h2>Your Book Collection</h2>
            {books.length > 0 ? (
                <ul>
                    {books.map((book) => (
                        <li key={book.id}>
                            <h3>{book.title}</h3>
                            <p>{book.authors}</p>
                            {book.thumbnail && (
                                <img src={book.thumbnail} alt={book.title} />
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your collection is empty.</p>
            )}
        </div>
    );
};

export default BookCollection;
