import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserProfile from './UserProfile';
import LoginButton from './LoginButton';
import { api } from '../api';
import { FaBook, FaFilm, FaGamepad, FaStar, FaUsers } from 'react-icons/fa';
import './UserContainer.css';

const UserContainer = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api('/api/account/userinfo', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else if (response.status === 401) {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = async () => {
        await api('/api/account/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    };

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <div className="user-container">
            <div className="user-orb user-orb--1" />
            <div className="user-orb user-orb--2" />
            <div className="user-orb user-orb--3" />
            <div className="user-grid" />
            {user ? (
                <UserProfile user={user} onLogout={handleLogout} />
            ) : (
                <div className="login-split">
                    <div className="login-section" data-aos="fade-right">
                        <h2>Welcome to DifColl</h2>
                        <p>Sign in to manage your collections and connect with friends!</p>
                        <div className="login-buttons">
                            <LoginButton
                                provider="google"
                                logo="https://www.cdnlogo.com/logos/g/35/google-icon.svg"
                            />
                            <LoginButton
                                provider="microsoft"
                                logo="https://cdn1.iconfinder.com/data/icons/flat-and-simple-part-1/128/microsoft-512.png"
                            />
                            <LoginButton
                                provider="twitter"
                                logo="https://static.vecteezy.com/system/resources/previews/031/737/227/non_2x/twitter-new-logo-twitter-icons-new-twitter-logo-x-2023-x-social-media-icon-free-png.png"
                            />
                        </div>
                    </div>
                    <div className="login-preview" data-aos="fade-left" data-aos-delay="200">
                        <h3 className="glow-text">Discover, Collect, Share</h3>
                        <p>Your personal hub for books, movies, and games</p>
                        <div className="preview-features">
                            <div className="preview-feature">
                                <FaBook className="preview-feature-icon" />
                                <span>Track your reading</span>
                            </div>
                            <div className="preview-feature">
                                <FaFilm className="preview-feature-icon" />
                                <span>Build your watchlist</span>
                            </div>
                            <div className="preview-feature">
                                <FaGamepad className="preview-feature-icon" />
                                <span>Log your gameplay</span>
                            </div>
                            <div className="preview-feature">
                                <FaUsers className="preview-feature-icon" />
                                <span>Share with friends</span>
                            </div>
                            <div className="preview-feature">
                                <FaStar className="preview-feature-icon" />
                                <span>Get recommendations</span>
                            </div>
                        </div>
                        <div className="preview-cta">
                            <Link to="/" className="btn-secondary">Learn More</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserContainer;
