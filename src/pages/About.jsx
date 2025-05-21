import React, { useState, useEffect, useMemo, useCallback } from 'react';
import GalaxyImage from '../assets/galaxy.png';
import BlackholeImage from '../assets/blackhole.png';
import FractalImage from '../assets/fractal1.png';
import GraphicImage from '../assets/graphic1.png';
import AppIcon from '../assets/appicon.png';
import UserDemoVideo from '../assets/user-demo.mp4';

export default function About() {
  const handleJoinClick = () => {
    document.getElementById('join-section').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDemoClick = () => {
    document.getElementById('demo-section').scrollIntoView({ behavior: 'smooth' });
  };

  const [downloadUrl, setDownloadUrl] = useState('');
  const [showSeniorInfo, setShowSeniorInfo] = useState(false);
  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/AndrewHu-it/Node-App-Updater/releases/tags/prod');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const dmg = data.assets.find(a => a.name.endsWith('.dmg'));
        setDownloadUrl(dmg ? dmg.browser_download_url : '');
      } catch (e) {
        console.error(e);
      }
    };
    fetchRelease();
  }, []);

  return (
    <div className="about-page container">
      <div className="hero-section">
        <div className="hero-header">
          <h2 style={{ fontSize: '4rem', fontWeight: 'bold' }}>Crowd Compute</h2>
          <p className="hero-subtitle">Hundreds of billions of dollars of unused computing resources sit idle all day long</p>
          <button className="join-button" onClick={handleDemoClick}>Watch Demo</button>
          <button className="secondary-button" onClick={handleJoinClick}>Join Network</button>
        </div>
        <div className="hero-media">
          <img src={GalaxyImage} alt="Galaxy" className="hero-image" />
          {/* shadow applied in CSS */}
        </div>
      </div>
      <div className="stats-grid about-cards">
        <div className="stat-card"><h3>Eligible Macbooks</h3><p>100M+</p></div>
        <div className="stat-card"><h3>Average Utilization</h3><p>24.5%</p></div>
        <div className="stat-card"><h3>Untapped Value</h3><p>$100B+</p></div>
      </div>
      <div className="container demo-bar">
        <span className="demo-bar-text">Please watch the demo videos</span>
        <button className="demo-bar-button" onClick={handleDemoClick}>Demo Videos</button>
      </div>
      <div className="hero-content">
        <div className="challenge-section">
          <div className="challenge-text">
            <p className="challenge-title">
              These resources should be used to solve the most pressing challenges facing our civilization and explore the universe.
            </p>
            <ul className="challenge-list" style={{ marginLeft: '1.5rem' }}>
              <li>Protein folding and drug discovery</li>
              <li>Climate Modeling</li>
              <li>Cryptography</li>
              <li>Physics and scientific simulations</li>
              <li>AI training and inference</li>
              <li>Exploring mathematical conjectures</li>
              <li>Ascending the Kardashev scale</li>
            </ul>
          </div>
          <div className="challenge-media">
            <img src={BlackholeImage} alt="Black hole simulation" className="challenge-image" />
            <p className="challenge-caption">
              The first simulated image of a black hole, calculated with an IBM 7040 computer using punch cards and hand-plotted by French astrophysicist Jean-Pierre Luminet in 1978
            </p>
          </div>
        </div>
        <div style={{ fontSize: '1.1rem' }}> 
          <p>
            Crowd Compute taps into this goldmine of unused computational resources by creating a user-friendly network for MacBooks. Users download a lightweight piece of software that autonomously completes tasks with no inconvenience to their daily usage.
          </p>
          <p>
            Our first proof of concept is distributed fractal generation. Clients who want to generate a fractal can assign a Job, which is split into several Tasks. Each Task is sent to a different laptop, where it is completed in parallel<sup>1</sup>. This allows Jobs that would normally take hours or days on a single machine to be finished in mere minutes or seconds.
          </p>
          <p style={{ fontSize: '0.95rem' }}>
            <small><sup>1</sup> Much like how a GPU parallelizes workloads.</small>
          </p>
        </div>
      </div>
      {/* Visuals */}
      <div style={{ display: 'flex', gap: '2rem', margin: '2rem 0' }}>
        {/* Fractal card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <img src={FractalImage} alt="Fractal example" style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block', borderRadius: '8px' }} />
          <div style={{ background: '#fff', padding: '0.75rem', textAlign: 'center', borderBottomLeftRadius: '12px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Example Fractal created with this network</p>
          </div>
        </div>
        {/* Graphic card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <img src={GraphicImage} alt="Graphic example" style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block', borderRadius: '8px' }} />
          <div style={{ background: '#fff', padding: '0.75rem', textAlign: 'center', borderBottomRightRadius: '12px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Network Architecture Diagram (Fig. 1)</p>
          </div>
        </div>
      </div>
      {/* Senior Project Information (Collapsible) */}
      <div style={{ width: '100%', margin: '3rem 0', boxSizing: 'border-box', padding: '0 1rem' }}>
        <div
          onClick={() => setShowSeniorInfo(!showSeniorInfo)}
          style={{
            cursor: 'pointer',
            padding: '1rem',
            background: '#f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '2rem' }}>Senior Project Information</h2>
          <span style={{ fontSize: '1.5rem', transform: showSeniorInfo ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ▶
          </span>
        </div>
        {showSeniorInfo && (
          <div style={{ padding: '1rem 1.5rem', background: '#fff', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 8px 8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <p><a href="https://sites.google.com/view/senior-project-hurlbut" target="_blank" rel="noopener noreferrer">https://sites.google.com/view/senior-project-hurlbut</a></p>
            <p>I am proposing to make a distributed computing network for Macbooks within the Priory community. This network will utilize spare computational resources to tackle large-scale computational tasks. The network will consist of a centralized server that will receive tasks and distribute them to available computers within the network. Tasks may be assigned either through the server API, or through a web page. Each MacBook will be running a light-weight native Swift-based application that requests tasks from the server, completes them, and sends the results back. Students may consent to join the network or opt out at any time. Participating computers will receive tasks when computational resources are underutilized (i.e. the user is not already doing something computationally intense on the computer) and the user has sufficient battery life. Once a task is completed, the computer will send the results back to the centralized server. (See Fig. 1) The central server coordinates the distribution of tasks via an algorithm that takes into consideration network speeds, under utilized computational resources, battery life, and other relevant parameters. There is also a web interface where progress on tasks can be viewed.</p>
            <p>The final product has two parts: A functional distributed computing network, and useful and interesting results of computations on that network. For the former, such a network could potentially be passed down to knowledgeable computer science students to maintain and utilize in the future. For the latter, I will start by producing exceptionally high resolution images of fractals (including, but not limited to, the Mandelbrot set, Julia set, or Newton Fractals). Anybody can view the results of these computations online via the web interface. As the network matures and its capabilities expand, I may expand its scope to additional computationally intensive problems, including scientific simulations, video rendering or AI Inference.</p>
            <p>I’ve long been fascinated by the idea that many computers sit idle for large portions of the day, even though they possess significant computing power. Utilizing these idle resources is both an engineering challenge that taps into my strengths, and a creative solution to resource inefficiency. The target audience will find this project meaningful because those who choose to participate can collectively solve problems that individuals could not solve on their single device. Fractals in particular are also very beautiful, and I think many people would find this interesting. Even people who are not in the network would benefit because they would still be able to view the products.</p>
          </div>
        )}
      </div>
      <div id="demo-section" style={{ margin: '3rem 0', width: '100%', boxSizing: 'border-box', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Demo Videos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Client Side (Web Interface)</h3>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
              <iframe
                src="https://www.youtube.com/embed/KyrLzmHroD8?si=C0rcaFRYh49l2Obt"
                title="Client Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              ></iframe>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>The Client is the one utilizing the network to generate fractals.</p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Node Side (Mac App)</h3>
            <video src={UserDemoVideo} controls style={{ width: '100%', borderRadius: '8px' }} />
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>The Nodes generate fractals by completing tasks</p>
          </div>
        </div>
      </div>
      <div id="join-section" style={{ background: '#fff', padding: '4rem 0', textAlign: 'center', position: 'relative' }}>
        <img src={AppIcon} alt="App Icon" style={{ width: '120px', height: 'auto', margin: '0 auto', borderRadius: '20%', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }} />
        <h2 style={{ fontSize: '4rem', margin: '1.5rem 0' }}>Join the Network Today</h2>
        <button
          onClick={() => {
            if (downloadUrl) {
              const downloadLink = document.createElement('a');
              downloadLink.href = downloadUrl;
              downloadLink.download = 'CrowdCompute.dmg';
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
            }
          }}
          style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', padding: '1.25rem 3rem', fontSize: '1.5rem', display: 'inline-flex', alignItems: 'center', cursor: downloadUrl ? 'pointer' : 'default', opacity: downloadUrl ? 1 : 0.6 }}
        >
          <span style={{ fontSize: '1.75rem', marginRight: '1rem', color: '#fff' }}></span>
          Download for Macbooks
        </button>
        <p style={{ fontSize: '1.1rem', color: '#333', marginTop: '1.5rem' }}>
          macOS Ventura 13.5 or later required
        </p>
        {/* GitHub release link */}
        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }}>
          <a href="https://github.com/AndrewHu-it/Node-App-Updater/releases/tag/prod" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1rem', color: '#0073e6', textDecoration: 'underline' }}>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
