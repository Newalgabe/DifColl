
const LogoutButton = () => {
    const handleLogout = async () => {
        const response = await fetch('/api/account/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            window.location.href = '/'; // Redirect to home after logout
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
