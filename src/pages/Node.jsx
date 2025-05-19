import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Node() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [allNodes, setAllNodes] = useState(null);
  const [expandedNodeId, setExpandedNodeId] = useState(null); // ⚠️ added: which node is expanded
  const [hoveredNodeId, setHoveredNodeId]     = useState(null); // ⚠️ added: which row is hovered
  const isFirstLoad = useRef(true);

  // Poll stats, growth, and nodes every 10 seconds without UI flicker
  useEffect(() => {
    const fetchData = async () => {
      const initial = isFirstLoad.current;
      if (initial) {
        setLoading(true);
        setError(null);
      }
      try {
        const [resStats, resGrowth, resNodes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/client/summary-statistics`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/client/node-growth`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/client/all-nodes`),
        ]);
        if (!resStats.ok) throw new Error(`Stats HTTP ${resStats.status}`);
        if (!resGrowth.ok) throw new Error(`Growth HTTP ${resGrowth.status}`);
        if (!resNodes.ok) throw new Error(`Nodes HTTP ${resNodes.status}`);
        const statsData = await resStats.json();
        const growth = await resGrowth.json();
        const nodes = await resNodes.json();
        setStats(statsData);
        setGrowthData(growth);
        setAllNodes(nodes);
      } catch (e) {
        if (initial) setError(e.message);
        else console.error(e);
      } finally {
        if (initial) setLoading(false);
        isFirstLoad.current = false;
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Prepare data for line chart safely
  const intervals = growthData?.intervals || {};
  const startingDate = growthData?.starting_date ? new Date(growthData.starting_date) : new Date();
  const intervalSizeMs = growthData?.interval_size ? growthData.interval_size * 1000 : 0;
  const intervalEntries = Object.entries(intervals)
    .map(([key, val]) => {
      const idx = parseInt(key.split('_')[1], 10) - 1;
      const time = new Date(startingDate.getTime() + idx * intervalSizeMs);
      return { time, val };
    })
    .sort((a, b) => a.time - b.time);
  const labels = intervalEntries.map(item => item.time.toLocaleDateString());
  const dataPoints = intervalEntries.map(item => item.val);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Nodes Over Time',
        data: dataPoints,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#333', font: { size: 14 } } },
      title: { display: true, text: '', color: '#333', font: { size: 18 } }
    },
    scales: {
      x: { ticks: { color: '#666' }, grid: { color: '#eee' } },
      y: { beginAtZero: true, ticks: { color: '#666' }, grid: { color: '#eee' } }
    }
  };

  const nodesArray = allNodes
    ? Object.values(allNodes).filter(item => item && typeof item === 'object' && 'node_id' in item)
    : [];
  const sortedNodes = [...nodesArray].sort((a, b) => b.tasks_completed - a.tasks_completed);
  const medals = ['🥇','🥈','🥉'];
  const medalsMap = sortedNodes.slice(0,3).reduce((acc, n, i) => (acc[n.node_id] = medals[i], acc), {});
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
    
    <div className="container node-page">
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Node Statistics</h2>
      {/* Summary stats cards */}
      
<div className="stats-grid"> {/* ⚠️ CHANGED: match Task’s grid container */}
  <div className="stat-card">
    <h3>Total Nodes</h3>
    <p>{stats.num_nodes.toLocaleString()}</p> {/* ⚠️ CHANGED: formatted with commas */}
  </div>
  <div className="stat-card">
    <h3>Active Nodes</h3>
    <p>{stats.num_active_nodes.toLocaleString()}</p> {/* ⚠️ CHANGED: formatted with commas */}
  </div>
  <div className="stat-card">
    <h3>Estimated TFLOPS</h3>
    <p>{stats.estimated_compute_value_TFLOPs.toLocaleString()}</p> {/* ⚠️ CHANGED: formatted with commas */}
  </div>
</div>

      {growthData && (
        <div className="chart-card">
          <h2>Node Growth Over Time</h2>
          {growthData.message ? <p>{growthData.message}</p> : <Line data={chartData} options={chartOptions} />}
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
          {/* Nodes grid with inline detail expansion */}
          <div className="nodes-grid">
            {displayedNodes.map(node => (
              <React.Fragment key={node.node_id}>
                <div className="node-wrapper">
                  <div className="node-card" onClick={() => setExpandedNodeId(expandedNodeId === node.node_id ? null : node.node_id)}>
                    <div className="node-title">
                      {node.name}
                      {medalsMap[node.node_id] && <span className="medal">{medalsMap[node.node_id]}</span>}
                    </div>
                    <div className="node-joined">Joined: {new Date(node.date_joined.$date).toLocaleDateString()}</div>
                    <div className="node-summary">
                      <span className={`status-dot ${node.available ? 'active' : 'inactive'}`}></span>
                      {node.tasks_completed} tasks completed
                    </div>
                  </div>
                </div>
                {expandedNodeId === node.node_id && (
                  <div className="detail-panel">
                    <h3>{node.name} Details</h3>
                    <p><strong>Node ID:</strong> {node.node_id}</p>
                    <p><strong>Joined:</strong> {new Date(node.date_joined.$date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {node.available ? 'Active' : 'Inactive'}</p>
                    <p><strong>Tasks Completed:</strong> {node.tasks_completed}</p>
                    <div className="node-specs-grid">
                      <div><strong>Cores:</strong> {node.computer_specs?.cores}</div>
                      <div><strong>CPU:</strong> {node.computer_specs?.cpu}</div>
                      <div><strong>GPU:</strong> {node.computer_specs?.gpu}</div>
                      <div><strong>RAM:</strong> {node.computer_specs?.ram}</div>
                    </div>
                    <button className="close-details" onClick={() => setExpandedNodeId(null)}>Close</button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
