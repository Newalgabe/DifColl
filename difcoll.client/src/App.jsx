import { Route, Routes } from 'react-router-dom';
import UserContainer from './components/UserContainer';
import BookSearch from './components/BookSearch';
import BookCollection from './components/BookCollection';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<UserContainer />} />
            <Route path="/search-books" element={<BookSearch/>} />
            <Route path="/my-books" element={<BookCollection />} />
        </Routes>
    );
};

export default App;
