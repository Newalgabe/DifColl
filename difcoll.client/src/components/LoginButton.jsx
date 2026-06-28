import PropTypes from 'prop-types';
import { API_BASE } from '../api';

const LoginButton = ({ provider, logo }) => {
    const handleLogin = () => {
        window.location.href = `${API_BASE}/api/account/login?provider=${provider}`;
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
