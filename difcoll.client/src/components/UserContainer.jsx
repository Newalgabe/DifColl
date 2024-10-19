import { useEffect, useState } from 'react';
import UserProfile from './UserProfile';

const UserContainer = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user information from the backend
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

    const handleLogin = () => {
        window.location.href = 'https://localhost:7113/api/account/login';
    };

    const handleLogout = async () => {
        await fetch('https://localhost:7113/api/account/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {user ? (
                <UserProfile user={user} onLogout={handleLogout} />
            ) : (
                <div>
                    <h2>You are not logged in</h2>
                    <button onClick={handleLogin}>Login with Google</button>
                </div>
            )}
        </div>
    );
};

export default UserContainer;
