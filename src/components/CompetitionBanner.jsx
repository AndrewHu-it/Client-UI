import React, { useState, useEffect } from 'react';
import './CompetitionBanner.css';

export default function CompetitionBanner() {
  const endDate = new Date('2025-05-23T09:00:00-07:00');
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const diff = endDate - now;
    if (diff <= 0) {
      return '0h 0m 0s';
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="container competition-banner">
      <div className="competition-text">
        Priory Distributed Computing Network Competition! First place: $100 gift card; Second place: $50; Third place: $25; Top ten participants: $5 each. Nodes will be judged based on the number of tasks they complete. Competition ends Friday 9:00 am.
      </div>
      <div className="timer">{timeLeft} remaining</div>
    </div>
  );
}
