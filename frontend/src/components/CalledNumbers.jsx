import React from 'react';

const CalledNumbers = ({ calledNumbers }) => {
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1);

  return (
    <div className="called-numbers">
      {numbers.map((number) => {
        const isCalled = calledNumbers.includes(number);
        
        return (
          <div
            key={number}
            className={`called-number ${isCalled ? 'called' : ''}`}
          >
            {number}
          </div>
        );
      })}
    </div>
  );
};

export default CalledNumbers; 