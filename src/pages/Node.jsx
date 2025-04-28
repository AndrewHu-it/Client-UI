import React, { useState, useEffect } from 'react';

export default function Node() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [allNodes, setAllNodes] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/summary-statistics`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStats(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchGrowth = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/node-growth`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setGrowthData(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchGrowth();
  }, []);

  useEffect(() => {
    const fetchAllNodes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/all-nodes`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAllNodes(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAllNodes();
  }, []);

  // Prepare data structures for display
  const growthPayload = growthData?.data?.data ?? growthData?.data ?? growthData;
  const growthEntries = Array.isArray(growthPayload)
    ? growthPayload
    : growthPayload && typeof growthPayload === 'object'
    ? Object.entries(growthPayload).map(([date, count]) => ({ date, count }))
    : [];
  const nodesArray = allNodes
    ? Object.values(allNodes).filter(item => item && typeof item === 'object' && 'node_id' in item)
    : [];
  const sortedNodes = [...nodesArray].sort((a, b) => b.tasks_completed - a.tasks_completed);
  const [searchNodeId, setSearchNodeId] = useState('');
  const [searchData, setSearchData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const displayedNodes = searchData ? [searchData] : sortedNodes;
  const handleSearch = async () => {
    setSearchLoading(true);
    setSearchError(null);
    setSearchData(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/node/node-info/${searchNodeId}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? `Node '${searchNodeId}' not found` : `Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setSearchData(data);
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) return <p>Loading summary statistics…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container">
      <h1>Node Summary Statistics</h1>
      <ul>
        <li>Total Nodes: {stats.num_nodes}</li>
        <li>Active Nodes: {stats.num_active_nodes}</li>
        <li>Estimated Compute (TFLOPs): {stats.estimated_compute_value_TFLOPs}</li>
      </ul>
      {growthData && (
        <div>
          <h2>Node Growth Data</h2>
          {growthData.message ? (
            <p>{growthData.message}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {growthEntries.map(({ date, count }) => (
                  <tr key={date}>
                    <td>{new Date(date).toLocaleDateString()}</td>
                    <td>{typeof count === 'object' ? JSON.stringify(count) : count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {allNodes && (
        <div>
          <h2>All Nodes</h2>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={searchNodeId}
              onChange={e => {
                setSearchNodeId(e.target.value);
                if (!e.target.value) {
                  setSearchData(null);
                  setSearchError(null);
                }
              }}
              placeholder="Enter Node ID"
            />
            <button onClick={handleSearch} disabled={!searchNodeId || searchLoading}>
              {searchLoading ? 'Loading...' : 'Search'}
            </button>
          </div>
          {searchError && <div style={{ color: 'red' }}>Error: {searchError}</div>}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Tasks Completed</th>
                <th>Cores</th>
                <th>CPU</th>
                <th>GPU</th>
                <th>RAM</th>
              </tr>
            </thead>
            <tbody>
              {displayedNodes.map(node => (
                <tr key={node.node_id}>
                  <td>{node.name}</td>
                  <td>{new Date(node.date_joined.$date).toLocaleString()}</td>
                  <td>{node.available ? 'Active' : 'Inactive'}</td>
                  <td>{node.tasks_completed}</td>
                  <td>{node.computer_specs?.cores}</td>
                  <td>{node.computer_specs?.cpu}</td>
                  <td>{node.computer_specs?.gpu}</td>
                  <td>{node.computer_specs?.ram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
