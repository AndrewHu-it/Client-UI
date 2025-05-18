import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import NavBar from './components/NavBar';
import Node from './pages/Node';
import Task from './pages/Task'; 
import Join from './pages/Join';

export default function App() {
  return (
    <Router>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/about" element={<About />} />
          {/* Contact handled via mailto button */}
          <Route path="/node" element={<Node />} />
          <Route path="/task" element={<Task />} /> 
          <Route path="/join" element={<Join />} />

        </Routes>
      </main>

      <footer>
        <p> 2025 Simple React Page. All rights reserved.</p>
      </footer>
    </Router>
  );
}
