import React, { useState, useEffect } from 'react';

export default function Task() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [clientId, setClientId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [numTasks, setNumTasks] = useState(16);
  const [region, setRegion] = useState({ x_min: -2.0, x_max: 1.0, y_min: -1.5, y_max: 1.5 });
  const [resolution, setResolution] = useState({ x_resolution: 3840, y_resolution: 2160 });
  const [color, setColor] = useState('simple_rgb');
  const [responseData, setResponseData] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [taskStats, setTaskStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [filterMinDate, setFilterMinDate] = useState('');
  const [filterMaxDate, setFilterMaxDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClientIdSelect, setFilterClientIdSelect] = useState('');
  const [filterJobId, setFilterJobId] = useState('');
  const [jobsList, setJobsList] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setResponseData(null);
    try {
      const payload = {
        client_id: clientId,
        job_description: jobDescription,
        priority,
        num_tasks: Number(numTasks),
        mandelbrot: {
          region: {
            x_min: Number(region.x_min),
            x_max: Number(region.x_max),
            y_min: Number(region.y_min),
            y_max: Number(region.y_max)
          },
          resolution: {
            x_resolution: Number(resolution.x_resolution),
            y_resolution: Number(resolution.y_resolution)
          },
          // ⚠️ ADDED: send along the chosen palette
          color
        }
      };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setResponseData(data);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFetchJobs = async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const filters = {};
      if (filterMinDate) filters.min_date = new Date(filterMinDate).toISOString();
      if (filterMaxDate) filters.max_date = new Date(filterMaxDate).toISOString();
      if (filterStatus) filters.status = filterStatus;
      if (filterClientIdSelect) filters.client_id = filterClientIdSelect;
      if (filterJobId) filters.job_id = filterJobId;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/all-jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJobsList(data.jobs || []);
    } catch (e) {
      setJobsError(e.message);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/job-statistics`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTaskStats(data);
      } catch (e) {
        setStatsError(e.message);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchTaskStats();
    handleFetchJobs();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '1rem auto' }}>
      <div
        style={{
          border: '2px solid #1890ff',
          backgroundColor: '#e6f7ff',
          padding: '1rem',
          borderRadius: '4px'
        }}
      >
        <p>
          Want to try it out now?{' '}
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Generate now'}
          </button>
        </p>
        {isExpanded && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.5rem' }}>
            <label>
              Client ID:
              <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} required />
            </label>
            <label>
              Job Description:
              <input type="text" value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
            </label>
            <label>
              Priority:
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              </label>

              {/* ⚠️ ADDED: color-palette selector */}
              <label>
              Color:
              <select value={color} onChange={e => setColor(e.target.value)}>
                <option value="simple_rgb">RGB</option>
                <option value="classic_mono">Classic Mono</option>
                <option value="escape_time_spectrum">Escape Time Spectrum</option>
                <option value="inferno_depth">Inferno Depth</option>
                <option value="deep_ocean">Deep Ocean</option>
                <option value="galactic">Galactic</option>
                <option value="fractal_forest">Fractal Forest</option>
              </select>
              </label>
            <label>
              Number of Tasks:
              <input type="number" value={numTasks} min={1} onChange={e => setNumTasks(e.target.value)} />
            </label>
            <fieldset style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
              <legend>Region</legend>
              <label>
                x_min:
                <input type="number" step="0.01" value={region.x_min} onChange={e => setRegion({ ...region, x_min: e.target.value })} />
              </label>
              <label>
                x_max:
                <input type="number" step="0.01" value={region.x_max} onChange={e => setRegion({ ...region, x_max: e.target.value })} />
              </label>
              <label>
                y_min:
                <input type="number" step="0.01" value={region.y_min} onChange={e => setRegion({ ...region, y_min: e.target.value })} />
              </label>
              <label>
                y_max:
                <input type="number" step="0.01" value={region.y_max} onChange={e => setRegion({ ...region, y_max: e.target.value })} />
              </label>
            </fieldset>
            <fieldset style={{ border: '1px solid #ddd', padding: '0.5rem' }}>
              <legend>Resolution</legend>
              <label>
                x_resolution:
                <input type="number" value={resolution.x_resolution} onChange={e => setResolution({ ...resolution, x_resolution: e.target.value })} />
              </label>
              <label>
                y_resolution:
                <input type="number" value={resolution.y_resolution} onChange={e => setResolution({ ...resolution, y_resolution: e.target.value })} />
              </label>
            </fieldset>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <button type="submit" disabled={submitting || !clientId}>
                {submitting ? 'Submitting...' : 'Submit Job'}
              </button>
            </div>
          </form>
        )}
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>Task Statistics</h2>
        {statsLoading ? (
          <p>Loading statistics…</p>
        ) : statsError ? (
          <p>Error: {statsError}</p>
        ) : taskStats ? (
          <ul>
            <li>Completed Jobs: {taskStats.completed_jobs}</li>
            <li>Completed Tasks: {taskStats.completed_tasks}</li>
          </ul>
        ) : null}
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>All Jobs</h2>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="datetime-local" value={filterMinDate} onChange={e => setFilterMinDate(e.target.value)} />
          <input type="datetime-local" value={filterMaxDate} onChange={e => setFilterMaxDate(e.target.value)} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="TASKS-ASSIGNED">TASKS-ASSIGNED</option>
            <option value="AVAILABLE">AVAILABLE</option>
          </select>
          <input placeholder="Client ID" type="text" value={filterClientIdSelect} onChange={e => setFilterClientIdSelect(e.target.value)} />
          <input placeholder="Job ID" type="text" value={filterJobId} onChange={e => setFilterJobId(e.target.value)} />
          <button onClick={handleFetchJobs} disabled={jobsLoading}>{jobsLoading ? 'Loading...' : 'Fetch Jobs'}</button>
        </div>
        {jobsError && <p style={{ color: 'red' }}>Error: {jobsError}</p>}
        {jobsLoading ? (
          <p>Loading jobs…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Client ID</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th># Tasks</th>
                <th>Created At</th>
                <th>Completed At</th>
              </tr>
            </thead>
            <tbody>
              {jobsList.map(job => (
                <tr key={job.job_id}>
                  <td>{job.job_id}</td>
                  <td>{job.client_id}</td>
                  <td>{job.job_description}</td>
                  <td>{job.priority}</td>
                  <td>{job.status}</td>
                  <td>{job.num_tasks}</td>
                  <td>{new Date(job.created_at.$date).toLocaleString()}</td>
                  <td>{job.completed_at ? new Date(job.completed_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {submitError && <div style={{ color: 'red', marginTop: '1rem' }}>Error: {submitError}</div>}
      {responseData && (
        <div style={{ background: '#f7f7f7', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
          <h3>Created Job</h3>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}