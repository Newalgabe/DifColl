// MyNexus.jsx
import NexusItems from './NexusItems';
import PropTypes from 'prop-types';
import './MyNexus.css';

const MyNexus = ({ userId }) => {
    return (
        <div>
            <h2>My Nexus Collection</h2>
            <NexusItems userId={userId} />
        </div>
    );
};

MyNexus.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default MyNexus;
