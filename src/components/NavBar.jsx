import React from 'react';
import { Link } from 'react-router-dom';
import AppIcon from '../assets/app-icon.png';

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/about">
          <img src={AppIcon} alt="App Logo" className="app-icon" />
        </Link>
      </div>
      <ul className="navbar-center">
        <li><Link to="/about">About</Link></li>
        <li><Link to="/node">Node</Link></li>
        <li><Link to="/task">Task</Link></li>
      </ul>
      <div className="navbar-right">
        <a href="mailto:ahurlbut25@priorypanther.com" className="contact-button">Contact</a>
      </div>
    </nav>
  );
}
