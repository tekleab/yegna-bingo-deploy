import React from 'react';

const BingoCard = ({ card, markedNumbers, onCellClick }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div>
      {/* BINGO Headers */}
      <div className="bingo-header">
        {headers.map((header, index) => (
          <div key={index} className="bingo-header-cell">
            {header}
          </div>
        ))}
      </div>

      {/* Bingo Card Grid */}
      <div className="bingo-card">
        {card.map((row, rowIndex) =>
          row.map((number, colIndex) => {
            const isMarked = markedNumbers.includes(number);
            const isFree = number === 'FREE';
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`bingo-cell ${isMarked ? 'marked' : ''} ${isFree ? 'free' : ''}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {number}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BingoCard; 