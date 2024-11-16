import { useState, useEffect } from "react";
import { FaUserPlus, FaUserTimes, FaBook } from "react-icons/fa";
import './FriendsList.css';


const FriendsList = () => {
    const [friends, setFriends] = useState([]);
    const [friendIdToAdd, setFriendIdToAdd] = useState("");
    const [addFriendStatus, setAddFriendStatus] = useState("");
    const [removeFriendStatus, setRemoveFriendStatus] = useState("");  // Used to show status of friend removal
    const [friendCollection, setFriendCollection] = useState([]);
    const [userCollection, setUserCollection] = useState([]);
    const [showFriendCollection, setShowFriendCollection] = useState(false);
    const [showUserCollection, setShowUserCollection] = useState(false);
    const [expandedFriendId, setExpandedFriendId] = useState(null);

    // Get current userId (this could come from a global state or context)
    const userId = "f32315e4a75cc150"; // Replace with actual userId if necessary

    // Fetch friends on component mount
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await fetch("https://localhost:7113/api/Account/friends", {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    const friendProfiles = await response.json();
                    setFriends(friendProfiles);
                } else {
                    console.error("Failed to load friends.");
                }
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };

        fetchFriends();
    }, []);

    // Fetch user's collection
    const handleViewUserCollection = async () => {
        // Toggle off if already open
        if (showUserCollection) {
            setShowUserCollection(false);
            return;
        }

        // If closed, fetch and open the collection
        try {
            const response = await fetch(`https://localhost:7113/api/Nexus/collections?userId=${userId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const collectionData = await response.json();
                console.log("User's collection data:", collectionData);
                setUserCollection(collectionData);
                setShowUserCollection(true);
            } else {
                console.error("Failed to load user's collection.");
            }
        } catch (error) {
            console.error("Error fetching user's collection:", error);
        }
    };


    // Fetch and display friend’s collection
    const handleViewFriendCollection = async (friendId) => {
        try {
            const response = await fetch(`https://localhost:7113/api/Nexus/collections?userId=${friendId}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const collectionData = await response.json();
                console.log("Friend's collection data:", collectionData);
                setFriendCollection(collectionData);
                setShowFriendCollection(true);
            } else {
                console.error("Failed to load friend's collection.");
            }
        } catch (error) {
            console.error("Error fetching friend's collection:", error);
        }
    };

    // Handle add friend by userId
    const handleAddFriend = async () => {
        try {
            const response = await fetch(`https://localhost:7113/api/Account/add-friend/${friendIdToAdd}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const updatedFriends = await response.json();
                setFriends(updatedFriends);
                setAddFriendStatus("Friend added successfully.");
                setFriendIdToAdd(""); // Clear input after adding
            } else {
                const message = await response.text();
                setAddFriendStatus(message);
            }
        } catch (error) {
            console.error("Error adding friend:", error);
            setAddFriendStatus("Error adding friend.");
        }
    };

    // Handle remove friend
    const handleRemoveFriend = async (friendId) => {
        try {
            const response = await fetch(`https://localhost:7113/api/Account/remove-friend/${friendId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                const updatedFriends = await response.json();
                setFriends(updatedFriends);
                setRemoveFriendStatus("Friend removed successfully.");
            } else {
                const message = await response.text();
                setRemoveFriendStatus(message);
            }
        } catch (error) {
            console.error("Error removing friend:", error);
            setRemoveFriendStatus("Error removing friend.");
        }
    };

    // Toggle friend details
    const toggleFriendDetails = (friendId) => {
        setExpandedFriendId(expandedFriendId === friendId ? null : friendId);
    };

    // Download collection as JSON
    const downloadCollectionAsJson = () => {
        const dataStr = JSON.stringify(userCollection, null, 2); // Pretty format the JSON
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user_collection_${userId}.json`;
        link.click();
        URL.revokeObjectURL(url); // Clean up the URL object
    };

    // Generate Shareable Link
    const generateShareableLink = () => {
        const link = `https://localhost:7113/api/Nexus/collections?userId=${userId}`;
        return link;
    };

    return (
        <div className="friends-list-container">
            <h2>My Friends</h2>

            {/* Add Friend Section by userId */}
            <div className="add-friend-section">
                <input
                    type="text"
                    placeholder="Enter Friend's User ID"
                    value={friendIdToAdd}
                    onChange={(e) => setFriendIdToAdd(e.target.value)}
                    className="friend-id-input"
                />
                <button onClick={handleAddFriend} className="add-friend-button">
                    <FaUserPlus /> Add Friend
                </button>
                {addFriendStatus && <p className="status-message">{addFriendStatus}</p>}
            </div>

            {/* Button to View Own Collection */}
            <div className="view-own-collection">
                <button onClick={handleViewUserCollection} className="view-collection-button">
                    <FaBook /> View My Collection
                </button>
            </div>

            {/* Share Options */}
            {showUserCollection && (
                <div className="share-options">
                    <h3>Share Your Collection</h3>
                    <div>
                        <button onClick={downloadCollectionAsJson} className="download-json-button">
                            Download as JSON
                        </button>
                    </div>
                    <div>
                        <p>Or share this link:</p>
                        <input type="text" value={generateShareableLink()} readOnly className="shareable-link" />
                        <button
                            onClick={() => navigator.clipboard.writeText(generateShareableLink())}
                            className="copy-link-button"
                        >
                            Copy Link
                        </button>
                    </div>
                </div>
            )}

            {/* Friend List */}
            <div className="friend-list">
                {friends.length > 0 ? (
                    friends.map((friend) => (
                        <div key={friend.userId} className="friend-card">
                            <div className="friend-details">
                                <img
                                    src={friend.pictureUrl || "default-profile.png"}
                                    alt={`${friend.name}'s profile`}
                                    className="friend-profile-picture"
                                />
                                <div className="friend-info">
                                    <p className="friend-name">
                                        {friend.nickname || friend.name || "Unnamed Friend"}
                                    </p>
                                    <p className="friend-email">{friend.contactInformation}</p>
                                    {expandedFriendId === friend.userId ? (
                                        <div className="friend-extra-details">
                                            <p><strong>Location:</strong> {friend.location || "N/A"}</p>
                                            <p><strong>Bio:</strong> {friend.bio || "No bio provided"}</p>
                                            <p><strong>Interests:</strong> {friend.interests || "N/A"}</p>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className="friend-actions">
                                <button
                                    onClick={() => handleRemoveFriend(friend.userId)}
                                    className="remove-friend-button"
                                >
                                    <FaUserTimes /> Remove
                                </button>
                                <button
                                    onClick={() => toggleFriendDetails(friend.userId)}
                                    className="toggle-details-button"
                                >
                                    {expandedFriendId === friend.userId ? "Hide Details" : "See More"}
                                </button>
                                <button
                                    onClick={() => handleViewFriendCollection(friend.userId)}
                                    className="view-collection-button"
                                >
                                    <FaBook /> View Collection
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No friends added yet.</p>
                )}
            </div>

            {/* Friend's Collection Modal */}
            {showFriendCollection && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Friend&#39;s Collection</h3>
                        <ul className="collection-list">
                            {friendCollection.length > 0 ? (
                                friendCollection.map((item, index) => (
                                    <li key={index} className="collection-item">
                                        <img src={item.thumbnail} alt={item.title} className="item-thumbnail" />
                                        <div className="item-details">
                                            <h4>{item.title}</h4>
                                            <p><strong>Rating:</strong> {item.rating}</p>
                                            <p><strong>Type:</strong> {item.type}</p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p>No items in this collection.</p>
                            )}
                        </ul>
                        <button className="modal-close-button" onClick={() => setShowFriendCollection(false)}>Close</button>
                    </div>
                </div>
            )}

            {/* User's Collection */}
            {showUserCollection && (
                <div className="user-collection">
                    <h3>Your Collection</h3>
                    <ul>
                        {userCollection.length > 0 ? (
                            userCollection.map((item, index) => (
                                <li key={index} className="collection-item">
                                    <img src={item.thumbnail} alt={item.title} className="item-thumbnail" />
                                    <h4>{item.title}</h4>
                                    <p>Rating: {item.rating}</p>
                                    <p>Type: {item.type}</p>
                                </li>
                            ))
                        ) : (
                            <p>No items in your collection.</p>
                        )}
                    </ul>
                    <button onClick={() => setShowUserCollection(false)}>Close Collection</button>
                </div>
            )}

            {/* Display status of friend removal */}
            {removeFriendStatus && <p className="status-message">{removeFriendStatus}</p>}
        </div>
    );
};

export default FriendsList;
