import React, { useState } from 'react';

export default function Lookup() {
  const [nodeId, setNodeId] = useState('');
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080';

  const handleFetch = async () => {
    console.log('Fetch initiated', { nodeId, BASE_URL });
    setLoading(true);
    setError(null);
    try {
      const url = `${BASE_URL}/node/node-info/${nodeId}`;
      console.log('Fetching URL:', url);
      const res = await fetch(url);
      console.log('Raw response:', res);
      if (!res.ok) {
        const statusMsg =
          res.status === 404
            ? `Node '${nodeId}' not found (404). Please verify the ID.`
            : res.status === 500
            ? `Server error fetching node '${nodeId}'. Try again later (500).`
            : `Unexpected error (${res.status}): ${res.statusText}`;
        console.error('Fetch error response:', res.status, res.statusText);
        throw new Error(statusMsg);
      }
      const data = await res.json();
      console.log('Fetched data:', data);
      setNodeData(data);
    } catch (e) {
      console.error('Fetch exception:', e);
      const networkMsg = e.name === 'TypeError'
        ? `Network error: Cannot reach API at ${BASE_URL}. Check connection or URL.`
        : e.message;
      setError(networkMsg);
      setNodeData(null);
    } finally {
      setLoading(false);
      console.log('Loading state: false');
    }
  };

  return (
    <div className="container">
      <h2>Lookup Node</h2>
      <input
        type="text"
        value={nodeId}
        onChange={e => setNodeId(e.target.value)}
        placeholder="Enter Node ID"
      />
      <button onClick={handleFetch} disabled={!nodeId || loading}>
        {loading ? 'Loading...' : 'Fetch Node'}
      </button>
      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#ffe6e6',
          border: '1px solid #ff4d4f',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {nodeData && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Node information for {nodeId}</h3>
          <pre style={{ background: '#f7f7f7', padding: '1rem', borderRadius: '4px' }}>
            {JSON.stringify(nodeData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
