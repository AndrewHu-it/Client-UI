import React from 'react';

export default function Home() {
  return (
    <>
      <div className="hero">
        <h2>Beautifully Simple</h2>
        <p>This is a clean and minimal React page built with Vite.</p>
      </div>
      <div className="grid">
        <div className="card">
          <h3>Fast</h3>
          <p>Experience lightning-fast builds and hot module replacement with Vite.</p>
        </div>
        <div className="card">
          <h3>Modern</h3>
          <p>Utilizing the latest React features for a robust development experience.</p>
        </div>
        <div className="card">
          <h3>Customizable</h3>
          <p>Easy to extend and adapt to your needs with clean component structure.</p>
        </div>
      </div>
    </>
  );
}
