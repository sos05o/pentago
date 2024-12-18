import React from 'react';

type SquareProps = {
  grid: number[][];
  index: number;
  updateBoard: (index: number, value: { x: number, y: number }) => void;
};

const Square: React.FC<SquareProps> = ({ grid, index, updateBoard }) => {
  const getColor = (value: number) => {
    switch (value) {
      case 0:
        return 'white';
      case 1:
        return 'red';
      case 2:
        return 'blue';
      default:
        return 'white';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
      {grid.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: getColor(value),
              border: '1px solid black',
            }}
            onClick={() => updateBoard(index, { x: rowIndex, y: colIndex })}
          ></div>
        ))
      )}
    </div>
  );
};

export default Square;