import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Lookup from './pages/Lookup';
import Node from './pages/Node';

export default function App() {
  return (
    <Router>
      <header className="container">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/lookup">Lookup</Link></li>
            <li><Link to="/node">Node</Link></li>
          </ul>
        </nav>
        <h1>Welcome to My Simple React Page</h1>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/node" element={<Node />} />
        </Routes>
      </main>

      <footer>
        <p> 2025 Simple React Page. All rights reserved.</p>
      </footer>
    </Router>
  );
}
