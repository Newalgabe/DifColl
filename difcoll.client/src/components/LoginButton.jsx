
const LoginButton = () => {
    const handleLogin = () => {
        // Trigger navigation to the backend login endpoint
        window.location.href = 'https://localhost:7113/api/account/login';
    };

    return <button onClick={handleLogin}>Login with Google</button>;
};

export default LoginButton;
