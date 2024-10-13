// MyNexus.jsx
import './MyNexus.css'; // Create and import corresponding CSS
import { FaBook, FaFilm, FaGamepad } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MyNexus = () => {
    return (
        <div className="nexus-container" data-aos="fade-up">
            <h2 className="nexus-heading">Welcome to Your Nexus</h2>
            <p className="nexus-description">Manage all your collections seamlessly in one place.</p>
            <div className="nexus-options">
                <Link to="/my-books" className="nexus-option-card">
                    <FaBook className="nexus-icon" />
                    <h3>Books</h3>
                </Link>
                <Link to="/my-movies" className="nexus-option-card">
                    <FaFilm className="nexus-icon" />
                    <h3>Movies</h3>
                </Link>
                <Link to="/my-games" className="nexus-option-card">
                    <FaGamepad className="nexus-icon" />
                    <h3>Games</h3>
                </Link>
            </div>
        </div>
    );
};

export default MyNexus;
