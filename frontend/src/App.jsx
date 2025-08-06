import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

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
  const [gameId, setGameId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [canClaimBingo, setCanClaimBingo] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [cardSelectionMode, setCardSelectionMode] = useState(false);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [playerSelectedCards, setPlayerSelectedCards] = useState({});

  // Get user ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user');

  useEffect(() => {
    if (userId) {
      loadUser();
      // Check if user is already in a game
      checkCurrentGame();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId]);

  // Poll for game updates
  useEffect(() => {
    if (gameId) {
      const interval = setInterval(() => {
        updateGameStatus();
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [gameId]);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      setUser(response.data.data.user);
    } catch (err) {
      console.error('Error loading user:', err);
      // Create mock user for demo
      setUser({
        id: userId,
        username: 'Demo User',
        balance: 10,
        registered: true
      });
    }
  };

  const checkCurrentGame = async () => {
    try {
      if (user && user.currentGame) {
        // User is already in a game
        setGameId(user.currentGame);
        await updateGameStatus();
      } else {
        // Show game creation/joining options
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking current game:', err);
      setLoading(false);
    }
  };

  const updateGameStatus = async () => {
    try {
      if (!gameId) return;

      const response = await axios.get(`${API_BASE_URL}/games/${gameId}/status`);
      const gameData = response.data.data.game;

      setGame(gameData);
      setGameStatus(gameData.status);
      setCalledNumbers(gameData.calledNumbers || []);
      setPlayers(gameData.players || []);
      setLastCalled(gameData.currentNumber);
      setCurrentCall(gameData.currentNumber);
      setCardSelectionMode(gameData.cardSelectionMode || false);
      setCurrentPlayerTurn(gameData.currentPlayerTurn);
      setPlayerSelectedCards(gameData.playerSelectedCards || {});

      // Find current player's data
      const currentPlayer = gameData.players.find(p => p.telegramId === userId);
      if (currentPlayer) {
        setBingoCard(currentPlayer.bingoCard);
        setMarkedNumbers(currentPlayer.markedNumbers);
        setCanClaimBingo(checkBingoWin(currentPlayer.bingoCard, currentPlayer.markedNumbers));
        setSelectedCards(currentPlayer.selectedCards || []);
      }

      if (gameData.gameEnded) {
        setGameStatus('ended');
      }
    } catch (err) {
      console.error('Error updating game status:', err);
    }
  };

  const createGame = async (betAmount) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/games/create`, {
        telegramId: userId,
        betAmount: betAmount
      });

      if (response.data.success) {
        setGameId(response.data.data.game.id);
        setGameStatus('waiting');
        await updateGameStatus();
      }
    } catch (err) {
      console.error('Error creating game:', err);
      alert('Failed to create game');
    }
  };

  const joinGame = async (gameIdToJoin) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/games/join`, {
        gameId: gameIdToJoin,
        telegramId: userId
      });

      if (response.data.success) {
        setGameId(gameIdToJoin);
        setGameStatus('waiting');
        await updateGameStatus();
      }
    } catch (err) {
      console.error('Error joining game:', err);
      alert('Failed to join game');
    }
  };

  const selectCard = async (number) => {
    if (!cardSelectionMode || currentPlayerTurn !== userId) {
      return;
    }

    // Check if card is already selected by someone
    const isCardUsed = Object.values(playerSelectedCards).some(cards => 
      cards.includes(number)
    );

    if (isCardUsed) {
      alert('This card is already selected by another player!');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/games/${gameId}/select-card`, {
        gameId: gameId,
        telegramId: userId,
        cardNumber: number
      });

      if (response.data.success) {
        await updateGameStatus();
      }
    } catch (err) {
      console.error('Error selecting card:', err);
      alert('Failed to select card');
    }
  };

  const claimBingo = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/games/${gameId}/bingo`, {
        gameId: gameId,
        telegramId: userId
      });

      if (response.data.success) {
        alert(`🎉 BINGO! You won ${response.data.data.winnings} ETB!`);
        setGameStatus('ended');
        await updateGameStatus();
      }
    } catch (err) {
      console.error('Error claiming bingo:', err);
      alert('Invalid bingo claim');
    }
  };

  const generateBingoCard = () => {
    // Generate 1-90 grid for Yegna Bingo
    const numbers = [];
    for (let i = 1; i <= 90; i++) {
      numbers.push(i);
    }
    return numbers;
  };

  const checkBingoWin = (card, markedNumbers) => {
    // Check for any bingo pattern (5 in a row, column, or diagonal)
    // For now, just check if enough numbers are marked
    return markedNumbers.length >= 5;
  };

  const handleCellClick = (number) => {
    if (cardSelectionMode) {
      selectCard(number);
    } else if (gameStatus === 'playing') {
      if (markedNumbers.includes(number)) {
        setMarkedNumbers(markedNumbers.filter(n => n !== number));
      } else {
        setMarkedNumbers([...markedNumbers, number]);
      }
    }
  };

  const isNumberMarked = (number) => {
    return markedNumbers.includes(number);
  };

  const isNumberCalled = (number) => {
    return calledNumbers.includes(number);
  };

  const isCardSelected = (number) => {
    return selectedCards.includes(number);
  };

  const isCardUsedByOthers = (number) => {
    return Object.entries(playerSelectedCards).some(([playerId, cards]) => 
      playerId !== userId && cards.includes(number)
    );
  };

  const isCurrentPlayerTurn = () => {
    return currentPlayerTurn === userId;
  };

  if (loading) {
    return (
      <div className="yegna-bingo-container">
        <div className="loading">Loading Yegna Bingo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="yegna-bingo-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="yegna-bingo-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="time">6:29 AM</div>
        <div className="title-section">
          <span className="close-btn">✕</span>
          <h1>Yegna Bingo</h1>
          <div className="menu-icons">
            <span>⌄</span>
            <span>⋮</span>
          </div>
        </div>
        <div className="status-icons">
          <span>📶</span>
          <span>1.4 K/s</span>
          <span>🔋 63%</span>
        </div>
      </div>

      {/* Card Selection Mode */}
      {cardSelectionMode && (
        <div className="card-selection-header">
          <div className="selection-status">
            {isCurrentPlayerTurn() ? (
              <div className="your-turn">🎯 Your Turn - Select Your Cards!</div>
            ) : (
              <div className="waiting-turn">⏳ Waiting for {players.find(p => p.telegramId === currentPlayerTurn)?.username || 'another player'} to select cards...</div>
            )}
          </div>
          <div className="selection-info">
            <div className="selected-count">Selected: {selectedCards.length}/15</div>
            <div className="remaining-count">Remaining: {90 - Object.values(playerSelectedCards).flat().length}</div>
          </div>
        </div>
      )}

      {/* Game Info Cards */}
      <div className="game-info-cards">
        <div className="info-card">
          <div className="info-label">Derash</div>
          <div className="info-value">
            {players.filter(player => player.markedNumbers && player.markedNumbers.length > 1).length || 0}
          </div>
        </div>
        <div className="info-card">
          <div className="info-label">Players</div>
          <div className="info-value">{players.length || 0}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Bet</div>
          <div className="info-value">{game?.betAmount || 10}</div>
        </div>
        <div className="info-card">
          <div className="info-label">Call</div>
          <div className="info-value">{calledNumbers.length}</div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="game-area">
        {/* Left Panel - Bingo Grid */}
        <div className="bingo-grid-panel">
          {/* BINGO Header */}
          <div className="bingo-header">
            <div className="bingo-letter b">B</div>
            <div className="bingo-letter i">I</div>
            <div className="bingo-letter n">N</div>
            <div className="bingo-letter g">G</div>
            <div className="bingo-letter o">O</div>
          </div>

          {/* Numbers Grid */}
          <div className="numbers-grid">
            {generateBingoCard().map((number) => (
              <div
                key={number}
                className={`number-cell ${
                  cardSelectionMode ? (
                    isCardSelected(number) ? 'selected' :
                    isCardUsedByOthers(number) ? 'used-by-others' :
                    isCurrentPlayerTurn() ? 'selectable' : 'disabled'
                  ) : (
                    isNumberMarked(number) ? 'marked' : ''
                  )
                } ${
                  isNumberCalled(number) ? 'called' : ''
                }`}
                onClick={() => handleCellClick(number)}
              >
                {number}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Game Status */}
        <div className="game-status-panel">
          {/* Game Status */}
          <div className="game-status">
            <div className="status-text">
              {cardSelectionMode ? 'SELECTING CARDS' :
               gameStatus === 'waiting' ? 'WAITING' : 
               gameStatus === 'playing' ? 'STARTED' : 
               gameStatus === 'ended' ? 'ENDED' : 'WAITING'}
            </div>
          </div>

          {/* Current Call */}
          <div className="current-call-section">
            <div className="current-call-label">Current Call</div>
            <div className="current-call-display">
              {currentCall ? (
                <div className="called-number">{currentCall}</div>
              ) : (
                <div className="no-call">-</div>
              )}
            </div>
          </div>

          {/* Game Actions */}
          <div className="game-actions">
            {cardSelectionMode && isCurrentPlayerTurn() && selectedCards.length >= 15 && (
              <button className="finish-selection-btn" onClick={() => {
                // This will be handled by the backend when all players finish
              }}>
                ✅ Finish Selection
              </button>
            )}

            {gameStatus === 'playing' && canClaimBingo && (
              <div className="bingo-winner">
                <div className="winner-announcement">🎉 BINGO! You Won!</div>
                <button className="bingo-btn" onClick={claimBingo}>
                  🏆 Claim Prize
                </button>
              </div>
            )}
            
            {gameStatus === 'ended' && (
              <div className="game-ended">
                <div className="ended-text">Game Completed</div>
                {game?.winner && (
                  <div className="winner-text">
                    {game.winner === userId ? '🎉 You Won!' : '🏆 Another player won'}
                  </div>
                )}
                <div className="prize-amount">
                  Prize: {game?.potAmount} ETB
                </div>
              </div>
            )}

            {!gameId && (
              <div className="create-join-section">
                <h3>Create or Join Game</h3>
                <div className="bet-buttons">
                  <button onClick={() => createGame(10)}>10 ETB</button>
                  <button onClick={() => createGame(20)}>20 ETB</button>
                  <button onClick={() => createGame(50)}>50 ETB</button>
                </div>
                <div className="join-section">
                  <input 
                    type="text" 
                    placeholder="Enter Game ID" 
                    id="gameIdInput"
                  />
                  <button onClick={() => {
                    const gameIdInput = document.getElementById('gameIdInput').value;
                    if (gameIdInput) joinGame(gameIdInput);
                  }}>
                    Join Game
                  </button>
                </div>
              </div>
            )}

            {gameId && gameStatus === 'waiting' && !cardSelectionMode && (
              <div className="waiting-section">
                <div className="waiting-text">Waiting for players...</div>
                <div className="game-id-display">
                  <div className="game-id-label">Game ID:</div>
                  <div className="game-id-value">{gameId}</div>
                  <button 
                    className="copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(gameId);
                      alert('Game ID copied!');
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div className="player-count">
                  Players: {players.length}/4
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="user-info">
          <div className="wallet-info">
            <div className="wallet-label">Wallet</div>
            <div className="wallet-value">{user.balance} ETB</div>
          </div>
          <div className="stake-info">
            <div className="stake-label">Stake</div>
            <div className="stake-value">{game?.betAmount || 10} ETB</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 