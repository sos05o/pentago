import { Grid2 as Grid, Box } from '@mui/material';
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
    <Grid container columns={3} spacing={1} style={{ width: '100%', height: '100%', borderRadius: '3px', padding: '4px' }}>
      {grid.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <Grid
            size={1}
            key={`${rowIndex}-${colIndex}`}
            style={{
              backgroundColor: getColor(value),
              border: `3px solid ${value !== 0 ? getColor(value) : "rgb(121, 130, 122)"}`,
              borderRadius: '3px',
            }}
            onClick={() => updateBoard(index, { x: rowIndex, y: colIndex })}
          >
            <Box />
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default Square;