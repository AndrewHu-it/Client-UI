import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash'; // Assuming lodash is installed for debounce

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
  const [showFilters, setShowFilters] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const canvasRef = useRef(null);

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

  const computeMandelbrot = (region, palette, width, height, maxIterations = 100) => {
    const { x_min, x_max, y_min, y_max } = region;
    const dx = (x_max - x_min) / width;
    const dy = (y_max - y_min) / height;
    const imageData = new Uint8ClampedArray(width * height * 4);
    for (let px = 0; px < width; px++) {
      for (let py = 0; py < height; py++) {
        const x0 = x_min + px * dx;
        const y0 = y_min + py * dy;
        let x = 0;
        let y = 0;
        let iteration = 0;
        while (x * x + y * y <= 4 && iteration < maxIterations) {
          const xTemp = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xTemp;
          iteration++;
        }
        const color = getColor(iteration, maxIterations, palette);
        const index = (py * width + px) * 4;
        imageData[index] = color.r;
        imageData[index + 1] = color.g;
        imageData[index + 2] = color.b;
        imageData[index + 3] = 255;
      }
    }
    return new ImageData(imageData, width, height);
  };

  const getColor = (iteration, maxIterations, palette) => {
    if (iteration === maxIterations) {
      return { r: 0, g: 0, b: 0 };
    }
    const t = iteration / maxIterations;
    let r, g, b;
    switch (palette) {
      case 'simple_rgb':
        r = Math.floor(255 * t);
        g = 0;
        b = Math.floor(255 * (1 - t));
        break;
      case 'classic_mono':
        r = g = b = Math.floor(255 * t);
        break;
      // Add more palette implementations as needed
      default:
        r = g = b = Math.floor(255 * t);
    }
    return { r, g, b };
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

  useEffect(() => {
    if (!isExpanded) return;
    const generatePreview = () => {
      if (!canvasRef.current) return;
      setIsPreviewLoading(true);
      const canvas = canvasRef.current;
      const previewSize = 200;
      const aspectRatio = resolution.y_resolution / resolution.x_resolution;
      let canvasWidth, canvasHeight;
      if (resolution.x_resolution > resolution.y_resolution) {
        canvasWidth = previewSize;
        canvasHeight = previewSize * aspectRatio;
      } else {
        canvasHeight = previewSize;
        canvasWidth = previewSize / aspectRatio;
      }
      canvas.width = Math.round(canvasWidth);
      canvas.height = Math.round(canvasHeight);
      const ctx = canvas.getContext('2d');
      const imageData = computeMandelbrot(region, color, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
      setIsPreviewLoading(false);
    };
    const debouncedGenerate = _.debounce(generatePreview, 500);
    debouncedGenerate();
    return () => debouncedGenerate.cancel();
  }, [isExpanded, region, resolution, color]);

  return (
    <div className="container">
      <div className="task-banner">
        <p className="banner-text">
          Want to try it out now?{' '}
          <button className="generate-button" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Generate Now'}
          </button>
        </p>
        {isExpanded && (
          <div className="form-container">
            <div className="form-grid">
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
            </div>
            <fieldset className="region-fieldset">
              <legend>Region</legend>
              <div className="form-grid">
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
              </div>
            </fieldset>
            <fieldset className="resolution-fieldset">
              <legend>Resolution</legend>
              <div className="form-grid">
                <label>
                  x_resolution:
                  <input type="number" value={resolution.x_resolution} onChange={e => setResolution({ ...resolution, x_resolution: e.target.value })} />
                </label>
                <label>
                  y_resolution:
                  <input type="number" value={resolution.y_resolution} onChange={e => setResolution({ ...resolution, y_resolution: e.target.value })} />
                </label>
              </div>
            </fieldset>
            <div className="submit-section">
              <button className="submit-button" onClick={handleSubmit} disabled={submitting || !clientId}>
                {submitting ? 'Submitting...' : 'Submit Job'}
              </button>
            </div>
            <div className="preview-section">
              <h3>Low Resolution Preview</h3>
              {isPreviewLoading && <p className="preview-loading">Generating preview...</p>}
              <canvas ref={canvasRef} className="preview-canvas" />
              <p className="preview-note">
                This is a low-resolution preview. The final image will be at {resolution.x_resolution}x{resolution.y_resolution} pixels.
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="stats-section">
        <h2>Task Statistics</h2>
        {statsLoading ? (
          <p>Loading statistics…</p>
        ) : statsError ? (
          <p>Error: {statsError}</p>
        ) : taskStats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Completed Jobs</h3>
              <p>{taskStats.completed_jobs.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Tasks</h3>
              <p>{taskStats.completed_tasks.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Total Pixels</h3>
              <p>{taskStats.total_pixels.toLocaleString()}</p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="jobs-section">
        <h2>All Jobs</h2>
        <button className="filters-toggle" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {showFilters && (
          <div className="filters-panel" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
        )}
        {jobsError && <p style={{ color: 'red' }}>Error: {jobsError}</p>}
        {jobsLoading ? (
          <p>Loading jobs…</p>
        ) : (
          <div className="tasks-grid">
            {jobsList.map(job => {
              const totalTasks = job.num_tasks;
              const completed = Object.values(job.task_statuses || {}).filter(s => s === 'COMPLETED').length;
              const pct = totalTasks ? (completed / totalTasks) * 100 : 0;
              return (
                <div key={job.job_id} className="task-card">
                  <h3 className="task-title">{job.client_id}</h3>
                  {job.job_description && <p><strong>Description:</strong> {job.job_description}</p>}
                  <div className="status-bar">
                    <div className={`status-fill ${pct < 100 ? 'in-progress' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p>
                    {completed.toLocaleString()} of {totalTasks.toLocaleString()} tasks completed ({Math.round(pct)}%)
                  </p>
                  <p className="job-id">ID: {job.job_id}</p>
                </div>
              );
            })}
          </div>
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