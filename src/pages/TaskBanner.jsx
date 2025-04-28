import React, { useState } from 'react';

export default function TaskBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`task-banner ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <p>
        Want to try it out now?{' '}
        <button className="generate-button" onClick={handleClick}>
          Generate now
        </button>
      </p>
      {isExpanded && <div>Expanded content here</div>}
    </div>
  );
}
