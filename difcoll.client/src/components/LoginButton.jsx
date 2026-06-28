import PropTypes from 'prop-types';
import { API_BASE } from '../api';

const providerLabels = {
  google: 'Google',
  microsoft: 'Microsoft',
  twitter: 'X (Twitter)',
};

const LoginButton = ({ provider, logo }) => {
    const handleLogin = () => {
        window.location.href = `${API_BASE}/api/account/login?provider=${provider}`;
    };

    return (
        <div className="login-button-wrapper">
          <button className={`login-button ${provider}`} onClick={handleLogin} aria-label={`Sign in with ${providerLabels[provider] || provider}`}>
              <img src={logo} alt="" className="provider-logo" />
          </button>
          <span className="login-button-label">{providerLabels[provider] || provider}</span>
        </div>
    );
};

LoginButton.propTypes = {
    provider: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
};

export default LoginButton;
