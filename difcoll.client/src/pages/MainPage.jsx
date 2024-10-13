// MainPage.jsx
import { Link } from 'react-router-dom';
import './MainPage.css'; // Add styles for the main page
import { FaBook, FaUsers, FaStar, FaChartBar, FaUsersCog } from 'react-icons/fa'; // Using react-icons for additional icons

const MainPage = () => {
    const testimonials = [
        {
            quote: "DifColl has revolutionized the way I manage my collections. It's intuitive and feature-packed!",
            author: "- Alex M."
        },
        {
            quote: "Connecting with friends over our shared interests has never been easier. Highly recommend DifColl!",
            author: "- Jamie L."
        },
        {
            quote: "The personalized recommendations are spot on. I've discovered so many new favorites thanks to DifColl.",
            author: "- Taylor S."
        },
    ];

    const statistics = [
        {
            icon: <FaUsersCog />,
            number: "1.2K",
            label: "Active Users"
        },
        {
            icon: <FaChartBar />,
            number: "500K",
            label: "Collections Managed"
        },
        {
            icon: <FaStar />,
            number: "10K",
            label: "Positive Reviews"
        },
    ];

    return (
        <div className="main-page">
            {/* Hero Section */}
            <section className="hero-section" data-aos="fade-up">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Welcome to DifColl</h1>
                        <p>Manage your books, movies, and games all in one place. Share your collections with friends and discover new recommendations!</p>
                        <div className="auth-section" data-aos="fade-up" data-aos-delay="200">
                            <p>Get started by signing in with your Google account:</p>
                            <a
                                href="/login" // Using href instead of Link to maintain functionality with external authentication
                                className="btn btn-google"
                            >
                                <img
                                    src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                                    alt="Google Logo"
                                    className="google-logo"
                                />
                                Sign in with Google
                            </a>
                        </div>
                    </div>
                    <div className="hero-image" data-aos="zoom-in" data-aos-delay="400">
                        <img
                            src="https://www.apple.com/newsroom/images/tile-images/Apple_unveils_best_of_2017.jpg.og.jpg?202408200426" // Replace with a valid URL
                            alt="Illustration of managing collections"
                        />
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="statistics-section" data-aos="fade-up">
                <div className="statistics-container">
                    {statistics.map((stat, index) => (
                        <div className="stat-card" key={index} data-aos="zoom-in" data-aos-delay={index * 200}>
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-info">
                                <h3>{stat.number}</h3>
                                <p>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" data-aos="fade-up">
                <h2>Why Choose DifColl?</h2>
                <div className="features-container">
                    <div className="feature-card" data-aos="zoom-in" data-aos-delay="200">
                        <FaBook className="feature-icon" />
                        <h3>Comprehensive Management</h3>
                        <p>Effortlessly manage your entire collection of books, movies, and games in one unified platform.</p>
                    </div>
                    <div className="feature-card" data-aos="zoom-in" data-aos-delay="400">
                        <FaUsers className="feature-icon" />
                        <h3>Social Sharing</h3>
                        <p>Connect with friends, share your collections, and discover what others are enjoying.</p>
                    </div>
                    <div className="feature-card" data-aos="zoom-in" data-aos-delay="600">
                        <FaStar className="feature-icon" />
                        <h3>Personalized Recommendations</h3>
                        <p>Get tailored suggestions based on your preferences and collection trends.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section" data-aos="fade-up">
                <h2>What Our Users Say</h2>
                <div className="testimonials-container">
                    {testimonials.map((testimonial, index) => (
                        <div className="testimonial-card" key={index} data-aos="fade-up" data-aos-delay={index * 200}>
                            <p>&#34;{testimonial.quote}&#34;</p>
                            <h4>{testimonial.author}</h4>
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Content */}
            <div className="main-content">
                {/* Search Section */}
                <div className="search-section" data-aos="fade-up">
                    <h2><FaBook className="section-icon" /> Search the Collection</h2>
                    <div className="search-buttons">
                        <Link to="/search-books" className="btn btn-primary">Search Books</Link>
                        <Link to="/search-movies" className="btn btn-primary">Search Movies</Link>
                        <Link to="/search-games" className="btn btn-primary">Search Games</Link>
                    </div>
                </div>

                {/* Unified Community Section */}
                <div className="community-section" data-aos="fade-up">
                    <h2><FaUsers className="section-icon" /> Explore Nexus</h2>
                    <p>Access and manage your entire collection of books, movies, and games in one place.</p>
                    <Link to="/my-nexus" className="btn btn-secondary">Manage Your Nexus</Link>
                </div>
            </div>

            {/* Overlay Section */}
            <section className="overlay-section" data-aos="fade-up">
                <div className="overlay-content">
                    <h2>Join the DifColl Community</h2>
                    <p>Connect, share, and grow with like-minded enthusiasts. Your collections are just the beginning!</p>
                    <Link to="/my-nexus" className="btn btn-primary">
                        Manage Your Nexus <FaUsersCog />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="main-footer" data-aos="fade-up">
                <p>Connect with your collections and friends in one place. Start exploring now!</p>
            </footer>
        </div>
    );

};

export default MainPage;
