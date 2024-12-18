import TurnLeftIcon from '@mui/icons-material/TurnLeft';
import TurnRightIcon from '@mui/icons-material/TurnRight';
import { IconButton } from '@mui/material';

export type TurnType = {
  // 左右のターンアイコンを返す
  isLeft: boolean
  rotate: number
  color: string
  onClick: () => void
}

export const Turn = ({ isLeft, rotate, color, onClick }: TurnType) => {
  const event = () => {
    onClick()
  }

  return (
    <IconButton aria-label="turn" onClick={event} style={{ transform: `rotate(${rotate}deg)` }}>
      {
        isLeft ? <TurnLeftIcon sx={{ color: color }} /> : <TurnRightIcon sx={{ color: color }} />
      }
    </IconButton>
  )
}