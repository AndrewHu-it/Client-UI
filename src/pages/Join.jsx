import React, { useState, useEffect } from 'react';

export default function Join() {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const res = await fetch(
          'https://api.github.com/repos/AndrewHu-it/Node-App-Updater/releases/tags/prod'
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const dmg = data.assets.find(a => a.name.endsWith('.dmg'));
        setDownloadUrl(dmg ? dmg.browser_download_url : '');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRelease();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Join the Network</h1>
      <p>
        Download and install the latest Node App DMG to join the network.
      </p>
      {loading ? (
        <p>Loading release info…</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : downloadUrl ? (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#1890ff' }}
        >
          Download DMG
        </a>
      ) : (
        <p>No DMG asset found in release.</p>
      )}
      <p style={{ marginTop: '1rem' }}>
        <a
          href="https://github.com/AndrewHu-it/Node-App-Updater/releases/tag/prod"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub Release Page
        </a>
      </p>
    </div>
  );
}
