import PropTypes from 'prop-types';

const LoginButton = ({ provider, logo }) => {
    const handleLogin = () => {
        // Redirect to the login endpoint with the chosen provider
        window.location.href = `https://localhost:7113/api/account/login?provider=${provider}`;
    };

    return (
        <button className={`login-button ${provider}`} onClick={handleLogin}>
            <img src={logo} alt={`${provider} logo`} className="provider-logo" />
            
        </button>
    );
};

LoginButton.propTypes = {
    provider: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
};

export default LoginButton;
