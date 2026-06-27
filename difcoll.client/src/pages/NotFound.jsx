import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import './NotFound.css';

const NotFound = () => (
  <div className="not-found">
    <h1 className="glow-text">404</h1>
    <p>Page not found</p>
    <Link to="/" className="btn-primary">
      <FaHome /> Go Home
    </Link>
  </div>
);

export default NotFound;