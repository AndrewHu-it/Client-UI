import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import About from './pages/About';
import NavBar from './components/NavBar';
import Node from './pages/Node';
import Task from './pages/Task'; 
import Join from './pages/Join';
import AppIcon from './assets/appicon.png';

export default function App() {
  useEffect(() => {
    document.title = 'Crowd Compute';
    const link = document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = AppIcon;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = AppIcon;
      document.head.appendChild(newLink);
    }
  }, []);

  return (
    <Router>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="/about" element={<About />} />
          {/* Contact handled via mailto button */}
          <Route path="/node" element={<Node />} />
          <Route path="/task" element={<Task />} /> 
          <Route path="/join" element={<Join />} />

        </Routes>
      </main>

      <footer>
        <p>2025 Crowd Compute. All rights reserved.</p>
      </footer>
    </Router>
  );
}
