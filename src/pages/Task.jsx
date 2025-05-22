import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash'; // Assuming lodash is installed for debounce

export default function Task() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [clientId, setClientId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [numTasks, setNumTasks] = useState(16);
  const [region, setRegion] = useState({ x_min: '-2.0', x_max: '1.0', y_min: '-1.5', y_max: '1.5' });
  const [resolution, setResolution] = useState({ x_resolution: 5000, y_resolution: 5000 });
  const [autoAdjustPixelRatio, setAutoAdjustPixelRatio] = useState(true);
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
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [downloadingJobId, setDownloadingJobId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const canvasRef = useRef(null);
  const isFirstLoad = useRef(true);

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
      // Refresh jobs list to include newly created job
      await handleFetchJobs();
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
      // Sort jobs by creation date descending
      let jobs = data.jobs || [];
      if (jobs.length && jobs[0].created_at) {
        jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      setJobsList(jobs);
    } catch (e) {
      setJobsError(e.message);
    } finally {
      setJobsLoading(false);
    }
  };

  // Download completed job image
  const handleDownloadJob = async jobId => {
    setDownloadingJobId(jobId);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/completed-job/${jobId}`);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jobId}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setDownloadingJobId(null);
    }
  };

  const computeMandelbrot = (region, palette, width, height, maxIterations = 100) => {
    const x_min = parseFloat(region.x_min);
    const x_max = parseFloat(region.x_max);
    const y_min = parseFloat(region.y_min);
    const y_max = parseFloat(region.y_max);
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

  // Convert HSB/HSV to RGB
  function hsbToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.floor(r * 255), g: Math.floor(g * 255), b: Math.floor(b * 255) };
  }

  const getColor = (iteration, maxIterations, palette) => {
    // Black for points inside the set
    if (iteration === maxIterations) return { r: 0, g: 0, b: 0 };
    const t = iteration / maxIterations;
    switch (palette) {
      case 'simple_rgb': {
        // RGB stripes
        const i = iteration % 256;
        return { r: (i * 5) % 256, g: (i * 7) % 256, b: (i * 11) % 256 };
      }
      case 'classic_mono': {
        const v = iteration < maxIterations ? 255 : 0;
        return { r: v, g: v, b: v };
      }
      case 'escape_time_spectrum': {
        return hsbToRgb(t, 1, 1);
      }
      case 'inferno_depth': {
        const rVal = Math.min(1, 2 * t);
        const gVal = Math.min(1, 2 * (t - 0.5));
        return { r: Math.floor(rVal * 255), g: Math.floor(Math.max(0, gVal) * 255), b: 0 };
      }
      case 'deep_ocean': {
        return { r: 0, g: Math.floor(t * 255), b: 255 };
      }
      case 'galactic': {
        const hue = 0.75 - 0.5 * t;
        return hsbToRgb(hue, 0.7, 0.9);
      }
      case 'fractal_forest': {
        const gVal = 0.5 + 0.5 * t;
        return { r: 0, g: Math.floor(gVal * 255), b: 0 };
      }
      default: {
        // Fallback to grayscale
        const v = Math.floor(255 * t);
        return { r: v, g: v, b: v };
      }
    }
  };

  const updateXResolution = e => {
    const inputVal = parseInt(e.target.value, 10) || 0;
    const clampedX = Math.min(Math.max(inputVal, 2), 15000);
    if (autoAdjustPixelRatio) {
      const mathWidth = parseFloat(region.x_max) - parseFloat(region.x_min);
      const mathHeight = parseFloat(region.y_max) - parseFloat(region.y_min);
      let newY = Math.round(clampedX * mathHeight / mathWidth);
      newY = Math.min(Math.max(newY, 2), 15000);
      setResolution({ x_resolution: clampedX, y_resolution: newY });
      // clamp tasks so each slice ≥2px
      setNumTasks(prev => Math.min(prev, Math.min(100, Math.floor(clampedX/2), Math.floor(newY/2))));
    } else {
      setResolution({ ...resolution, x_resolution: clampedX });
      // clamp tasks for updated X resolution
      setNumTasks(prev => Math.min(prev, Math.min(100, Math.floor(clampedX/2), Math.floor(resolution.y_resolution/2))));
    }
  };

  const updateYResolution = e => {
    const inputVal = parseInt(e.target.value, 10) || 0;
    const clampedY = Math.min(Math.max(inputVal, 2), 15000);
    if (autoAdjustPixelRatio) {
      const mathWidth = parseFloat(region.x_max) - parseFloat(region.x_min);
      const mathHeight = parseFloat(region.y_max) - parseFloat(region.y_min);
      let newX = Math.round(clampedY * mathWidth / mathHeight);
      newX = Math.min(Math.max(newX, 2), 15000);
      setResolution({ x_resolution: newX, y_resolution: clampedY });
      // clamp tasks so each slice ≥2px
      setNumTasks(prev => Math.min(prev, Math.min(100, Math.floor(newX/2), Math.floor(clampedY/2))));
    } else {
      setResolution({ ...resolution, y_resolution: clampedY });
      // clamp tasks for updated Y resolution
      setNumTasks(prev => Math.min(prev, Math.min(100, Math.floor(resolution.x_resolution/2), Math.floor(clampedY/2))));
    }
  };

  // Poll stats and jobs every 10 seconds
  useEffect(() => {
    const fetchData = async () => {
      const initial = isFirstLoad.current;
      if (initial) {
        setStatsLoading(true);
        setStatsError(null);
        setJobsLoading(true);
        setJobsError(null);
      }
      try {
        // Fetch task stats
        const resStats = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/job-statistics`);
        if (!resStats.ok) throw new Error(`HTTP ${resStats.status}`);
        const dataStats = await resStats.json();
        setTaskStats(dataStats);
      } catch (e) {
        setStatsError(e.message);
      } finally {
        if (initial) setStatsLoading(false);
      }
      // Fetch jobs list with current filters
      try {
        const filters = {};
        if (filterMinDate) filters.min_date = new Date(filterMinDate).toISOString();
        if (filterMaxDate) filters.max_date = new Date(filterMaxDate).toISOString();
        if (filterStatus) filters.status = filterStatus;
        if (filterClientIdSelect) filters.client_id = filterClientIdSelect;
        if (filterJobId) filters.job_id = filterJobId;
        const resJobs = await fetch(`${import.meta.env.VITE_API_BASE_URL}/client/all-jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters),
        });
        if (!resJobs.ok) throw new Error(`HTTP ${resJobs.status}`);
        const dataJobs = await resJobs.json();
        let jobs = dataJobs.jobs || [];
        if (jobs.length && jobs[0].created_at) jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setJobsList(jobs);
      } catch (e) {
        setJobsError(e.message);
      } finally {
        if (initial) setJobsLoading(false);
      }
      if (initial) isFirstLoad.current = false;
    };
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [filterMinDate, filterMaxDate, filterStatus, filterClientIdSelect, filterJobId]);

  useEffect(() => {
    if (!isExpanded) return;
    const generatePreview = () => {
      if (!canvasRef.current) return;
      setIsPreviewLoading(true);
      const canvas = canvasRef.current;
      const previewSize = 400;
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


      <div className="stats-section">
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Use Statistics</h2> {/* ⚠️ CHANGED: made text larger and bolder */}
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

      <div
        className="jobs-section"
        style={{ marginTop: '3rem' }}
      ></div>
    



      <div className="task-banner light-blue-banner">
        <p className="banner-text">
          Want to try it out?{' '}
          <button className="generate-button" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Generate Now'}
          </button>
        </p>
        {isExpanded && (
          <div className="expanded-content">
            <div className="form-section">
              <div className="form-grid">
                <label>Client ID: <input type="text" value={clientId} onChange={e => setClientId(e.target.value)} required /></label>
                <label>Job Description: <input type="text" value={jobDescription} onChange={e => setJobDescription(e.target.value)} required /></label>
                <label>Priority: <select value={priority} onChange={e => setPriority(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
                <label>Color: <select value={color} onChange={e => setColor(e.target.value)}><option value="simple_rgb">RGB</option><option value="classic_mono">Classic Mono</option><option value="escape_time_spectrum">Escape Time Spectrum</option><option value="inferno_depth">Inferno Depth</option><option value="deep_ocean">Deep Ocean</option><option value="galactic">Galactic</option><option value="fractal_forest">Fractal Forest</option></select></label>
                <label>Number of Tasks: <input type="number"
                  min={1}
                  // dynamically cap tasks so resolution/numTasks ≥2
                  max={Math.min(100, Math.floor(resolution.x_resolution/2), Math.floor(resolution.y_resolution/2))}
                  step={1}
                  value={numTasks}
                  onChange={e => {
                    const val = parseInt(e.target.value, 10) || 0;
                    const maxByRes = Math.min(100, Math.floor(resolution.x_resolution/2), Math.floor(resolution.y_resolution/2));
                    const clamped = Math.min(Math.max(val, 1), maxByRes);
                    setNumTasks(clamped);
                  }} />
                </label>
              </div>
              <fieldset className="region-fieldset">
                <legend>Region</legend>
                <div className="form-grid">
                  <label>x_min: <input type="number" step="0.01" value={region.x_min} onChange={e => setRegion({ ...region, x_min: e.target.value })} /></label>
                  <label>x_max: <input type="number" step="0.01" value={region.x_max} onChange={e => setRegion({ ...region, x_max: e.target.value })} /></label>
                  <label>y_min: <input type="number" step="0.01" value={region.y_min} onChange={e => setRegion({ ...region, y_min: e.target.value })} /></label>
                  <label>y_max: <input type="number" step="0.01" value={region.y_max} onChange={e => setRegion({ ...region, y_max: e.target.value })} /></label>
                </div>
              </fieldset>
              <fieldset className="resolution-fieldset">
                <legend>Resolution</legend>
                <div className="form-grid">
                  <label>x_resolution: <input type="number" min={2} max={15000} step={1} value={resolution.x_resolution} onChange={updateXResolution} /></label>
                  <label>y_resolution: <input type="number" min={2} max={15000} step={1} value={resolution.y_resolution} onChange={updateYResolution} /></label>
                  <div className="toggle-container">
                    <label className="switch">
                      <input type="checkbox" checked={autoAdjustPixelRatio} onChange={e => setAutoAdjustPixelRatio(e.target.checked)} />
                      <span className="slider"></span>
                    </label>
                    <span className="switch-label">Automatically adjust pixel ratio</span>
                  </div>
                </div>
              </fieldset>
            </div>
            <div className="preview-section">
              <h3>Low Resolution Preview</h3>
              {isPreviewLoading ? <p className="preview-loading">Generating preview...</p> : <canvas ref={canvasRef} className="preview-canvas" />}
              <p className="preview-note">This is a low-resolution preview. The final image will be at {resolution.x_resolution}x{resolution.y_resolution} pixels.</p>
            </div>
            <div className="submit-section">
              <button className="submit-button" onClick={handleSubmit} disabled={submitting || !clientId || !jobDescription}>{submitting ? 'Submitting...' : 'Submit Job'}</button>
            </div>
          </div>
        )}
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
                <React.Fragment key={job.job_id}>
                  <div className="task-wrapper">
                    <div className="task-card" onClick={() => setExpandedJobId(expandedJobId === job.job_id ? null : job.job_id)}>
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
                  </div>
                  {expandedJobId === job.job_id && (
                    <div className="detail-panel">
                      <h3>Job Details For: {job.client_id}</h3>
                      <div className="detail-grid">
                        <div className="detail-col">
                          <p><strong>Job ID:</strong> {job.job_id}</p>
                          <p><strong>Client ID:</strong> {job.client_id}</p>
                          {job.job_description && <p><strong>Description:</strong> {job.job_description}</p>}
                          <p><strong>Created At:</strong> {new Date(job.created_at.$date || job.created_at).toLocaleString()}</p>
                          <p><strong>Completed At:</strong> {job.completed_at ? new Date(job.completed_at.$date || job.completed_at).toLocaleString() : 'Not completed'}</p>
                          <p><strong>Priority:</strong> {job.priority}</p>
                          <p><strong>Num Tasks:</strong> {job.num_tasks}</p>
                        </div>
                        <div className="detail-col">
                          <h4>Mandelbrot Region</h4>
                          <p>x_min: {job.mandelbrot.region.x_min}, x_max: {job.mandelbrot.region.x_max}</p>
                          <p>y_min: {job.mandelbrot.region.y_min}, y_max: {job.mandelbrot.region.y_max}</p>
                          <h4>Resolution</h4>
                          <p>x_resolution: {job.mandelbrot.resolution.x_resolution}</p>
                          <p>y_resolution: {job.mandelbrot.resolution.y_resolution}</p>
                        </div>
                      </div>

                      <details>
                        <summary>Expand tasks and nodes</summary>
                        <ul>
                          {Object.entries(job.tasks_and_nodes || {}).map(([taskId, nodeId]) => (
                            <li key={taskId}>{taskId} → {nodeId}</li>
                          ))}
                        </ul>
                      </details>
                      <div className="detail-footer">
                        {job.status === 'COMPLETED' ? (
                          <button
                            className="download-button"
                            disabled={downloadingJobId === job.job_id}
                            onClick={() => handleDownloadJob(job.job_id)}
                          >
                            {downloadingJobId === job.job_id ? 'Downloading...' : 'Download Job'}
                          </button>
                        ) : (
                          <button className="download-button processing" disabled>
                            Still Processing
                          </button>
                        )}
                        <button className="close-details" onClick={() => setExpandedJobId(null)}>
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
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