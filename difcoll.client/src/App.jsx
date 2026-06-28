import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { api } from "./api";
import MainPage from "./pages/MainPage";
import UserContainer from "./components/UserContainer";
import Navbar from "./components/Navbar";
import BookSearch from "./components/BookSearch";
import MovieSearch from "./components/MovieSearch";
import GameSearch from "./components/GameSearch";
import MyNexus from "./components/MyNexus";
import NotFound from "./pages/NotFound";

const App = () => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out-cubic", once: true });

    const fetchUserId = async () => {
      try {
        const response = await api('/api/account/userinfo', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.status === 401) {
          setUserId(null);
        } else if (response.ok) {
          const userData = await response.json();
          setUserId(userData.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUserId();
  }, []);

  const handleLogout = async () => {
    await api('/api/account/logout', { method: 'POST', credentials: 'include' });
    setUserId(null);
    setUser(null);
    window.location.href = '/login';
  };

  if (!userId) {
    return <UserContainer />;
  }

  return (
    <div style={{ paddingTop: '64px' }}>
      <Navbar userId={userId} onLogout={handleLogout} user={user} />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<UserContainer />} />
        <Route path="/search-books" element={<BookSearch />} />
        <Route path="/search-movies" element={<MovieSearch />} />
        <Route path="/search-games" element={<GameSearch />} />
        <Route path="/my-nexus" element={<MyNexus userId={userId} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
