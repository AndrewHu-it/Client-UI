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
  const growthEntries = Array.isArray(growthData)
    ? growthData
    : growthData && !growthData.message
    ? Object.entries(growthData).map(([date, count]) => ({ date, count }))
    : [];
  const nodesArray = allNodes
    ? Object.values(allNodes).filter(item => item && typeof item === 'object' && 'node_id' in item)
    : [];
  const sortedNodes = [...nodesArray].sort((a, b) => new Date(b.date_joined.$date) - new Date(a.date_joined.$date));

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
                    <td>{count}</td>
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
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Tasks Completed</th>
                <th>Tasks Failed</th>
                <th>Cores</th>
                <th>CPU</th>
                <th>GPU</th>
                <th>RAM</th>
              </tr>
            </thead>
            <tbody>
              {sortedNodes.map(node => (
                <tr key={node.node_id}>
                  <td>{node.name}</td>
                  <td>{new Date(node.date_joined.$date).toLocaleString()}</td>
                  <td>{node.available ? 'Active' : 'Inactive'}</td>
                  <td>{node.tasks_completed}</td>
                  <td>{node.tasks_failed}</td>
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
