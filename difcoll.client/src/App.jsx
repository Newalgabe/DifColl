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
            duration: 1000,
            easing: "ease-in-out",
            once: true,
        });

        const fetchUserId = async () => {
            try {
                const response = await fetch('https://localhost:7113/api/account/userinfo', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.status === 401) {
                    setUserId(null);
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
        return <UserContainer />; // Redirect to login page if not authenticated
    }

    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<UserContainer />} />
            <Route path="/search-books" element={<BookSearch />} />
            <Route path="/search-movies" element={<MovieSearch />} />
            <Route path="/search-games" element={<GameSearch />} /> {/* Added GameSearch route */}
            <Route path="/my-nexus" element={<MyNexus userId={userId} />} />
        </Routes>
    );
};

export default App;
