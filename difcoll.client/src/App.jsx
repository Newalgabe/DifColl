import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import MainPage from './pages/MainPage';
import UserContainer from './components/UserContainer';
import BookSearch from './components/BookSearch';
import MovieSearch from './components/MovieSearch'; // Imported MovieSearch
import GameSearch from './components/GameSearch'; // Imported GameSearch
import MyNexus from './components/MyNexus'; // New Component for My Nexus

const App = () => {
    const [userId, setUserId] = useState(null); // Assuming you'll fetch or set the userId from authentication

    useEffect(() => {
        AOS.init({
            duration: 1000, // Customize animation duration
            easing: 'ease-in-out', // Customize easing
            once: true, // Whether animation should happen only once
        });

        // Assuming you fetch the userId from an API, localStorage, or authentication context
        const fetchUserId = async () => {
            // Example: Simulating fetching userId from an API or authentication
            const user = { id: "12345" }; // Replace this with your actual logic
            setUserId(user.id);
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
