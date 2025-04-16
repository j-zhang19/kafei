import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LinkedListPage from './pages/LinkedListPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/linked-list" element={<LinkedListPage />} />
            </Routes>
        </Router>
    );
};

export default App;
