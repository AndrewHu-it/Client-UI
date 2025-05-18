import React from 'react';

export default function TaskBanner() {
  return (
    <div className="task-banner">
      <p className="banner-text">
        Want to try it out now?{' '}
        <button className="generate-button">
          Generate Now
        </button>
      </p>
    </div>
  );
}
