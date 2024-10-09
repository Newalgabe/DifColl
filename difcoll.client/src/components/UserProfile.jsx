import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './UserProfile.css';  // Import the external stylesheet

const UserProfile = ({ onLogout }) => {
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

    const availablePronouns = ['They/Them', 'She/Her', 'He/Him', 'Other'];

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('https://localhost:7113/api/account/userinfo', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const userData = await response.json();
                    setNickname(userData.name || "");
                    setEmail(userData.email || "");
                    setPictureUrl(userData.pictureUrl || "");
                    setBio(userData.bio || "");
                    setPronouns(userData.pronouns || "");
                    setLocation(userData.location || "");
                    setInterests(userData.interests || "");
                    setSocialMediaLinks(userData.socialMediaLinks || "");
                    setDateOfBirth(userData.dateOfBirth || "");
                    setContactInfo(userData.contactInformation || "");
                    setNewPictureUrl(userData.pictureUrl || "https://default-profile-url.com/default-image.png"); // Set default URL
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
            nickname: nickname || "", // Use existing values if not changed
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
            const response = await fetch('https://localhost:7113/api/account/update-profile', {
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
        <div className="profile-container">
            {isEditing ? (
                <div className="form-container">
                    <h2>Edit Profile</h2>
                    <label>
                        Nickname:
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        Profile Picture URL:
                        <input
                            type="text"
                            value={newPictureUrl}
                            onChange={(e) => setNewPictureUrl(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    {uploadStatus === 'success' && <p>URL Updated Successfully!</p>}
                    {uploadStatus === 'failure' && <p>Failed to Update URL. Try Again!</p>}
                    <label>
                        Bio:
                        <input
                            type="text"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
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
                        Location:
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        Interests:
                        <input
                            type="text"
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        Social Media Links:
                        <input
                            type="text"
                            value={socialMediaLinks}
                            onChange={(e) => setSocialMediaLinks(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        Date of Birth:
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <label>
                        Contact Information:
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            className="input-field"
                        />
                    </label>
                    <button onClick={handleSave} className="save-button">
                        Save Changes
                    </button>
                    <button onClick={() => setIsEditing(false)} className="cancel-button">
                        Cancel
                    </button>
                </div>
            ) : (
                <div>
                    <h2 className="profile-heading">Welcome, {nickname}</h2>
                    {pictureUrl ? (
                        <img
                            src={pictureUrl}
                            alt="User Profile"
                            className="profile-picture"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <p>No profile picture available</p>
                    )}
                    <p className="profile-email">Email: {email}</p>
                    <button onClick={toggleDetails} className="show-more-button">
                        {isExpanded ? "Show Less" : "Show More"}
                    </button>
                    <div className={`collapsible ${isExpanded ? 'expanded' : ''}`}>
                        <p>Bio: {bio}</p>
                        <p>Pronouns: {pronouns}</p>
                        <p>Location: {location}</p>
                        <p>Interests: {interests}</p>
                        <p>
                            Social Media: <a href={socialMediaLinks} target="_blank" rel="noopener noreferrer">{socialMediaLinks}</a>
                        </p>
                        <p>Date of Birth: {dateOfBirth}</p>
                        <p>Contact: {contactInfo}</p>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="edit-button">
                        Edit Profile
                    </button>
                    <button onClick={onLogout} className="logout-button">
                        Logout
                    </button>
                    <div className="links-container">
                        <Link to="/search-books" className="profile-link">Search Books</Link>
                        <Link to="/my-books" className="profile-link">My Book Collection</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

UserProfile.propTypes = {
    onLogout: PropTypes.func.isRequired
};

export default UserProfile;
