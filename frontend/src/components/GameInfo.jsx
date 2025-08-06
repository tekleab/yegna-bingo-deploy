import React from 'react';

const GameInfo = ({ user, gameStatus, nextDrawTime, calledCount }) => {
  return (
    <div className="game-info">
      <div className="info-card">
        <h3>Balance</h3>
        <div className="value">{user?.balance || 0} ETB</div>
      </div>
      <div className="info-card">
        <h3>Status</h3>
        <div className="value">{gameStatus.toUpperCase()}</div>
      </div>
      <div className="info-card">
        <h3>Next Draw</h3>
        <div className="value">{nextDrawTime}s</div>
      </div>
      <div className="info-card">
        <h3>Called</h3>
        <div className="value">{calledCount}/75</div>
      </div>
    </div>
  );
};

export default GameInfo; 