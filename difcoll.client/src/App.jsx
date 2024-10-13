// App.jsx
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import MainPage from './pages/MainPage';
import UserContainer from './components/UserContainer';
import BookSearch from './components/BookSearch';
import BookCollection from './components/BookCollection';
import MyNexus from './components/MyNexus'; // New Component for My Nexus

const App = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000, // Customize animation duration
            easing: 'ease-in-out', // Customize easing
            once: true, // Whether animation should happen only once
        });
    }, []);

    return (
        <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<UserContainer />} />
            <Route path="/search-books" element={<BookSearch />} />
            <Route path="/search-movies" element={<BookCollection />} />
            <Route path="/search-games" element={<BookCollection />} />
            <Route path="/my-nexus" element={<MyNexus />} /> {/* New Route */}
        </Routes>
    );
};

export default App;
