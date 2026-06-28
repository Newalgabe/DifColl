import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import PropTypes from 'prop-types';
import './UserProfile.css';
import { FaEdit, FaSignOutAlt, FaUser, FaInfoCircle, FaMapMarkerAlt, FaBirthdayCake, FaHeart, FaHome } from 'react-icons/fa';
import { api } from '../api';
import FriendsList from './FriendsList';

const UserProfile = ({ onLogout }) => {
    const [userId, setUserId] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [nickname, setNickname] = useState("");
    const [pictureUrl, setPictureUrl] = useState("");
    const [newPictureUrl, setNewPictureUrl] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [location, setLocation] = useState("");
    const [interests, setInterests] = useState("");
    const [socialMediaLinks, setSocialMediaLinks] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [contactInfo, setContactInfo] = useState("");

    const navigate = useNavigate(); // Initialize navigate

    const availablePronouns = ['They/Them', 'She/Her', 'He/Him', 'Other'];

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api('/api/account/userinfo', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const userData = await response.json();
                    console.log("User data:", userData); // Debugging: Log the entire user data

                    setUserId(userData.id || "");
                    // Handle different provider data formats
                    setNickname(userData.name || userData.nickname || "User");
                    setEmail(userData.email || "");
                    setPictureUrl(userData.picture || userData.pictureUrl || "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg");
                    setBio(userData.bio || "");
                    setPronouns(userData.pronouns || "");
                    setLocation(userData.location || "");
                    setInterests(userData.interests || "");
                    setSocialMediaLinks(userData.socialMediaLinks || "");
                    setDateOfBirth(userData.dateOfBirth || "");
                    setContactInfo(userData.contactInformation || "");
                    setNewPictureUrl(userData.pictureUrl || "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg");
                } else {
                    console.error('Failed to load user info');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleSave = async () => {
        const profileData = {
            nickname: nickname || "",
            pictureUrl: newPictureUrl || pictureUrl || "",
            bio: bio || "",
            pronouns: pronouns || "",
            location: location || "",
            interests: interests || "",
            socialMediaLinks: socialMediaLinks || "",
            dateOfBirth: dateOfBirth || "",
            contactInformation: contactInfo || ""
        };

        try {
            const response = await api('/api/account/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
                credentials: 'include',
            });

            if (response.ok) {
                const updatedUser = await response.json();

                // Update React state with new profile data
                setNickname(updatedUser.nickname || "");
                setPictureUrl(updatedUser.pictureUrl || "");
                setBio(updatedUser.bio || "");
                setPronouns(updatedUser.pronouns || "");
                setLocation(updatedUser.location || "");
                setInterests(updatedUser.interests || "");
                setSocialMediaLinks(updatedUser.socialMediaLinks || "");
                setDateOfBirth(updatedUser.dateOfBirth || "");
                setContactInfo(updatedUser.contactInformation || "");

                // Exit edit mode after successful save
                setIsEditing(false);
                setUploadStatus('success');
            } else {
                console.error('Error updating profile');
                setUploadStatus('failure');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setUploadStatus('failure');
        }
    };

    const toggleDetails = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="profile-container" data-aos="fade-up">
            <button
                onClick={() => navigate('/')}
                className="return-button"
                aria-label="Return to Main Menu"
            >
                <FaHome size={24} /> {/* FaHome icon */}
            </button>
            <div className="background-overlay"></div> {/* Decorative background */}
            {isEditing ? (
                <div className="form-container" data-aos="zoom-in">
                    <h2>Edit Profile</h2>
                    <label>
                        <FaUser className="input-icon" />
                        Nickname:
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        <FaInfoCircle className="input-icon" />
                        Profile Picture URL:
                        <input
                            type="text"
                            value={newPictureUrl}
                            onChange={(e) => setNewPictureUrl(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    {uploadStatus === 'success' && <p className="success-message">URL Updated Successfully!</p>}
                    {uploadStatus === 'failure' && <p className="error-message">Failed to Update URL. Try Again!</p>}
                    <label>
                        <FaHeart className="input-icon" />
                        Bio:
                        <input
                            type="text"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        <FaUser className="input-icon" />
                        Pronouns:
                        <select
                            value={pronouns}
                            onChange={(e) => setPronouns(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Select Pronouns</option>
                            {availablePronouns.map((pronoun) => (
                                <option key={pronoun} value={pronoun}>
                                    {pronoun}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <FaMapMarkerAlt className="input-icon" />
                        Location:
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        <FaHeart className="input-icon" />
                        Interests:
                        <input
                            type="text"
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        <FaHeart className="input-icon" />
                        Social Media Links:
                        <input
                            type="text"
                            value={socialMediaLinks}
                            onChange={(e) => setSocialMediaLinks(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        <FaBirthdayCake className="input-icon" />
                        Date of Birth:
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        <FaInfoCircle className="input-icon" />
                        Contact Information:
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <div className="button-group">
                        <button onClick={handleSave} className="save-button">
                            Save Changes
                        </button>
                        <button onClick={() => setIsEditing(false)} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="profile-details" data-aos="zoom-in">
                    <h2 className="profile-heading">Welcome, {nickname}</h2>
                    <div className="profile-header">
                        {pictureUrl ? (
                            <img
                                src={pictureUrl}
                                alt="User Profile"
                                className="profile-picture"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                            />
                        ) : (
                            <p>No profile picture available</p>
                            )}

                        <div className="profile-actions">
                            <button onClick={() => setIsEditing(true)} className="edit-button">
                                <FaEdit /> Edit Profile
                            </button>
                            <button onClick={onLogout} className="logout-button">
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                        </div>
                        <p className="profile-userid">User ID: {userId}</p>

                    <p className="profile-email">Email: {email}</p>
                    <div className="stats-container">
                        <div className="stat-card" data-aos="fade-right" data-aos-delay="200">
                            <FaHeart className="stat-icon" />
                            <p>Interests</p>
                            <span>{interests || "N/A"}</span>
                        </div>
                        <div className="stat-card" data-aos="fade-right" data-aos-delay="400">
                            <FaMapMarkerAlt className="stat-icon" />
                            <p>Location</p>
                            <span>{location || "N/A"}</span>
                        </div>
                        <div className="stat-card" data-aos="fade-right" data-aos-delay="600">
                            <FaBirthdayCake className="stat-icon" />
                            <p>Date of Birth</p>
                            <span>{dateOfBirth || "N/A"}</span>
                        </div>
                    </div>
                    <button onClick={toggleDetails} className="details-button">
                        {isExpanded ? 'Hide Details' : 'View Details'}
                    </button>
                    {isExpanded && (
                        <div className="expanded-details" data-aos="fade-left" data-aos-delay="200">
                            <p><FaUser /> Pronouns: {pronouns || "N/A"}</p>
                            <p><FaInfoCircle /> Bio: {bio || "No bio provided"}</p>
                            <p><FaInfoCircle /> Contact Info: {contactInfo || "No contact info provided"}</p>
                            <p><FaInfoCircle /> Social Links: {socialMediaLinks || "N/A"}</p>
                        </div>
                        )}
                        <FriendsList />
                </div>
            )}
        </div>
    );
};

UserProfile.propTypes = {
    onLogout: PropTypes.func.isRequired,
};

export default UserProfile;



