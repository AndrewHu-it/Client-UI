import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import Contact from './pages/Contact';
import Node from './pages/Node';
import Task from './pages/Task'; // Import the new Task component
import Join from './pages/Join';

export default function App() {
  return (
    <Router>
      <header className="container">
        <nav>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/node">Node</Link></li>
            <li><Link to="/task">Task</Link></li> {/* Add navigation link to Task */}
            <li><Link to="/join">Join</Link></li>

          </ul>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/node" element={<Node />} />
          <Route path="/task" element={<Task />} /> {/* Add route for Task */}
          <Route path="/join" element={<Join />} />

        </Routes>
      </main>

      <footer>
        <p> 2025 Simple React Page. All rights reserved.</p>
      </footer>
    </Router>
  );
}
