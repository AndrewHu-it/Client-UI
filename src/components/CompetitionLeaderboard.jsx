import React from 'react';
import './CompetitionLeaderboard.css';

export default function CompetitionLeaderboard({ nodes }) {
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

  return (
    <div className="leaderboard-card">
      <h2>Priory Competition</h2>
      <div className="leaderboard-list">
        {nodes.map((node, idx) => {
          const medal = medals[idx] || '🏅';
          const prize = idx === 0 ? 100 : idx === 1 ? 50 : idx === 2 ? 25 : 5;
          return (
            <div key={node.node_id} className="leaderboard-item">
              <span className="position">{medal}</span>
              <span className="info">
                {node.name} <span className={`status-dot ${node.available ? 'active' : 'inactive'}`}></span> {node.tasks_completed} tasks
              </span>
              <span className="prize">💰 ${prize}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
