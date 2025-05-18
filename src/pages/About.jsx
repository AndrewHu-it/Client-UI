import React from 'react';
import Join from './Join';
import GalaxyImage from '../assets/galaxy.png';
import BlackholeImage from '../assets/blackhole.png';

export default function About() {
  const handleJoinClick = () => {
    document.getElementById('join-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="about-page container">
      <div className="hero-section">
        <div className="hero-header">
        <h2 style={{ fontSize: '4rem', fontWeight: 'bold' }}>Crowd Compute</h2>
          <p className="hero-subtitle">Hundreds of billions of dollars of unused computing resources sit idle.</p>
          <button className="join-button" onClick={handleJoinClick}>Join Network</button>
        </div>
        <div className="hero-media">
          <img src={GalaxyImage} alt="Galaxy" className="hero-image" />
          {/* shadow applied in CSS */}
        </div>
      </div>
      <div className="stats-grid about-cards">
        <div className="stat-card"><h3>Eligible Macbooks</h3><p>100M+</p></div>
        <div className="stat-card"><h3>Average Utilization</h3><p>24.5%</p></div>
        <div className="stat-card"><h3>Total Untapped Value</h3><p>$97.5B</p></div>
      </div>
      <div className="hero-content">
        <div className="challenge-section">
          <div className="challenge-text">
            <p className="challenge-title">
              These resources should be used to solve the most pressing challenges facing our civilization and explore the universe.
            </p>
            <ul className="challenge-list">
              <li>Protein folding and drug discovery</li>
              <li>Climate Modeling</li>
              <li>Cryptography</li>
              <li>Physics and scientific simulations</li>
              <li>AI training and inference</li>
              <li>Exploring mathematical conjectures.</li>
            </ul>
          </div>
          <div className="challenge-media">
            <img src={BlackholeImage} alt="Black hole simulation" className="challenge-image" />
            <p className="challenge-caption">
              The first simulated image of a black hole, calculated with an IBM 7040 computer using 1960 punch cards and hand-plotted by French astrophysicist Jean-Pierre Luminet in 1978
            </p>
          </div>
        </div>
        <div style={{ fontSize: '1.1rem' }}> {/* ⚠️ INCREASED FONT SIZE */}
  <p>
    Crowd Compute taps into this goldmine of unused computational resources by creating a user-friendly network for MacBooks. Members download a lightweight piece of software that autonomously completes tasks with no inconvenience to the user.
  </p>
  <p>
    Our first proof of concept is distributed fractal generation. Clients who want to generate a fractal can assign a Job, which is split into several Tasks. Each Task is sent to a different laptop, where it is completed in parallel<sup>1</sup>. This allows Jobs that would normally take hours or days on a single machine to be finished in mere minutes or seconds.
  </p>
  <p style={{ fontSize: '0.95rem' }}>
    <small><sup>1</sup> Much like how a GPU parallelizes workloads.</small>
  </p>
</div>

      </div>
      <div id="join-section">
        <Join />
      </div>
    </div>
  );
}
