import { useEffect, useState } from 'react';
import { api } from '../api';

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const response = await api('/api/account/userinfo');
            if (response.ok) {
                const data = await response.json();
                setUserInfo(data);
            }
        };

        fetchUserInfo();
    }, []);

    if (!userInfo) {
        return <div>Loading user info...</div>;
    }

    return (
        <div>
            <h1>{userInfo.Name}&#39;s Profile</h1>
            <p>Email: {userInfo.Email}</p>
            {userInfo.Picture && <img src={userInfo.Picture} alt="Profile" />}
        </div>
    );
};

export default Profile;
