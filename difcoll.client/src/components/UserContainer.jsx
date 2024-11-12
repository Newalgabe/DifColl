import { useEffect, useState } from 'react';
import UserProfile from './UserProfile';
import LoginButton from './LoginButton';
import './UserContainer.css';

const UserContainer = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('https://localhost:7113/api/account/userinfo', {
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
        await fetch('https://localhost:7113/api/account/logout', {
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
            {user ? (
                <UserProfile user={user} onLogout={handleLogout} />
            ) : (
                <div className="login-section">
                    <h2>Welcome to DifCol</h2>
                    <p>Please log in to access your profile</p>
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
                            logo="https://static.vecteezy.com/system/resources/previews/016/716/467/non_2x/twitter-icon-free-png.png"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserContainer;
