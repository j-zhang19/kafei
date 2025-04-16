// src/pages/HomePage.js

import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>Welcome to Data Structure Visualizer</h1>
            <p>This site lets you explore data structures in 3D!</p>
            <Link to="/linked-list">
                <button style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
                    Visualize Linked List
                </button>
            </Link>
        </div>
    );
};

export default HomePage;
