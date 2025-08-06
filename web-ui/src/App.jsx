import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BingoCard from './components/BingoCard';
import CalledNumbers from './components/CalledNumbers';
import GameInfo from './components/GameInfo';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [user, setUser] = useState(null);
  const [game, setGame] = useState(null);
  const [bingoCard, setBingoCard] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [gameStatus, setGameStatus] = useState('waiting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextDrawTime, setNextDrawTime] = useState(0);
  const [lastCalled, setLastCalled] = useState(null);

  // Get user ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');

  useEffect(() => {
    if (userId) {
      loadUser();
      generateBingoCard();
      startAutoCalling();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error('Error loading user:', err);
      // Create mock user for demo
      setUser({
        id: userId,
        username: 'Demo User',
        balance: 100,
        registered: true
      });
    }
  };

  const generateBingoCard = () => {
    const card = [];
    const ranges = [
      [1, 15],   // B
      [16, 30],  // I
      [31, 45],  // N
      [46, 60],  // G
      [61, 75],  // O
    ];

    for (let col = 0; col < 5; col++) {
      const nums = [];
      for (let i = ranges[col][0]; i <= ranges[col][1]; i++) {
        nums.push(i);
      }
      // Shuffle and take first 5
      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
      }
      for (let row = 0; row < 5; row++) {
        if (!card[row]) card[row] = [];
        card[row][col] = nums[row];
      }
    }
    
    // Set center as free
    card[2][2] = 'FREE';
    setBingoCard(card);
    setMarkedNumbers([card[2][2]]); // Mark free space
  };

  const startAutoCalling = () => {
    setGameStatus('playing');
    const interval = setInterval(() => {
      callNextNumber();
    }, 3000); // Call every 3 seconds

    return () => clearInterval(interval);
  };

  const callNextNumber = () => {
    const availableNumbers = [];
    for (let i = 1; i <= 75; i++) {
      if (!calledNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) {
      setGameStatus('finished');
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const calledNumber = availableNumbers[randomIndex];
    
    setCalledNumbers(prev => [...prev, calledNumber]);
    setLastCalled(calledNumber);
    setNextDrawTime(3);

    // Check if user has this number
    if (bingoCard) {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (bingoCard[row][col] === calledNumber) {
            // Auto-mark the number
            setTimeout(() => {
              markNumber(calledNumber);
            }, 1000);
            return;
          }
        }
      }
    }
  };

  const markNumber = (number) => {
    if (!markedNumbers.includes(number)) {
      setMarkedNumbers(prev => [...prev, number]);
    }
  };

  const handleCellClick = (row, col) => {
    const number = bingoCard[row][col];
    if (number !== 'FREE' && calledNumbers.includes(number)) {
      markNumber(number);
    }
  };

  const checkBingo = () => {
    if (!bingoCard) return false;

    // Check rows
    for (let row = 0; row < 5; row++) {
      if (bingoCard[row].every(num => markedNumbers.includes(num))) {
        return true;
      }
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      if (bingoCard.every(row => markedNumbers.includes(row[col]))) {
        return true;
      }
    }

    // Check diagonals
    if (bingoCard.every((row, i) => markedNumbers.includes(row[i]))) {
      return true;
    }
    if (bingoCard.every((row, i) => markedNumbers.includes(row[4 - i]))) {
      return true;
    }

    return false;
  };

  const claimBingo = () => {
    if (checkBingo()) {
      setGameStatus('won');
      alert('🎉 BINGO! You won!');
    } else {
      alert('❌ Not a valid Bingo pattern. Keep playing!');
    }
  };

  const leaveGame = () => {
    setGameStatus('left');
    setCalledNumbers([]);
    setMarkedNumbers(['FREE']);
    setLastCalled(null);
  };

  const playAgain = () => {
    generateBingoCard();
    setCalledNumbers([]);
    setMarkedNumbers(['FREE']);
    setGameStatus('playing');
    setLastCalled(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading Yegna Bingo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
          🎮 Yegna Bingo
        </h1>
        
        {user && (
          <div className="game-info">
            <div className="info-card">
              <h3>Balance</h3>
              <div className="value">{user.balance} ETB</div>
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
              <div className="value">{calledNumbers.length}/75</div>
            </div>
          </div>
        )}

        {lastCalled && (
          <div className="success" style={{ textAlign: 'center' }}>
            🎲 Last Called: {lastCalled}
          </div>
        )}

        {bingoCard && (
          <BingoCard
            card={bingoCard}
            markedNumbers={markedNumbers}
            onCellClick={handleCellClick}
          />
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="btn btn-success" onClick={claimBingo} style={{ marginRight: '10px' }}>
            🏆 Claim Bingo
          </button>
          <button className="btn btn-secondary" onClick={playAgain} style={{ marginRight: '10px' }}>
            🔄 Play Again
          </button>
          <button className="btn btn-danger" onClick={leaveGame}>
            ❌ Leave Game
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Called Numbers</h2>
        <CalledNumbers calledNumbers={calledNumbers} />
      </div>
    </div>
  );
}

export default App; 