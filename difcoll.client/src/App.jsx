import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles
import MainPage from "./pages/MainPage";
import UserContainer from "./components/UserContainer";
import BookSearch from "./components/BookSearch";
import MovieSearch from "./components/MovieSearch"; // Imported MovieSearch
import GameSearch from "./components/GameSearch"; // Imported GameSearch
import MyNexus from "./components/MyNexus"; // New Component for My Nexus

const App = () => {
    const [userId, setUserId] = useState(null); // State for user ID

    useEffect(() => {
        AOS.init({
            duration: 1000, // Customize animation duration
            easing: "ease-in-out", // Customize easing
            once: true, // Whether animation should happen only once
        });

        const fetchUserId = async () => {
            try {
                const response = await fetch('https://localhost:7113/api/account/userinfo', {
                    method: 'GET',
                    credentials: 'include', // Ensure cookies are included in the request
                });

                if (response.status === 401) {
                    // If user is unauthorized, redirect to Google login
                    window.location.href = 'https://localhost:7113/api/account/login'; // Adjust this based on your login endpoint
                } else if (response.ok) {
                    const userData = await response.json();
                    setUserId(userData.id);
                } else {
                    console.error('Failed to load user info');
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserId();
    }, []);


    if (!userId) {
        return <div>Loading...</div>; // Add a loading state until userId is available
    }

    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<UserContainer />} />
            <Route path="/search-books" element={<BookSearch />} />
            <Route path="/search-movies" element={<MovieSearch />} />
            <Route path="/search-games" element={<GameSearch />} /> {/* Added GameSearch route */}

            {/* Pass userId to MyNexus component */}
            <Route path="/my-nexus" element={<MyNexus userId={userId} />} />
        </Routes>
    );
};

export default App;