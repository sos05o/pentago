import { Box, Button, CssBaseline, Paper } from "@mui/material"
import Grid from "@mui/material/Grid2"
import { Turn } from "./component/Turn"
import { useState } from "react"
import Board from "./component/Square"

export type Player = {
  color: string
  name: string
}

export const App = () => {
  // 勝敗を管理するstate
  const [result, setResult] = useState<{flag: boolean, player: number}>({flag: false, player: 0})
  // 現在のプレイヤーの選択が完了したかどうかを管理するstate
  const [isPlayerSelected, setIsPlayerSelected] = useState<boolean>(false)

  const [currentPlayer, setCurrentPlayer] = useState<{ player1: boolean, player2: boolean }>({ player1: true, player2: false })

  // 3x3の盤面を2x2だけ持つ配列
  // board[0][0]が左上、board[0][1]が右上、board[1][0]が左下、board[1][1]が右下
  const [board, setBoard] = useState<number[][][]>([
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
  ])

  // boardの更新関数
  // ただし、どの値が更新されるかはSquareコンポーネントで処理するので、board[index]のindexをSquareコンポーネントに渡す際に定義するラッパー関数
  // indexは0~3の整数 0:左上, 1:右上, 2:左下, 3:右下
  // valueは3x3の盤面の座標
  const updateBoard = (index: number, value: { x: number, y: number }) => {
    if (isPlayerSelected) { return }
    // currentPlayerを参照して、現在のプレイヤーを取得
    const currentPlayer = getCurrentPlayer()
    // boardをコピー
    const newBoard = [...board]
    // board[index]をコピー
    const targetBoard = [...newBoard[index]]
    // targetBoardの座標が、現在のプレイヤーが選択しているときは何もしない
    if (targetBoard[value.x][value.y] === (currentPlayer.name === "player1" ? 1 : 2)) {
      return
    }
    // targetBoardの座標を更新
    if (targetBoard[value.x][value.y] !== 0) {
      return
    }
    targetBoard[value.x][value.y] = currentPlayer.name === "Player1" ? 1 : 2
    setIsPlayerSelected(true)
    // newBoard[index]を更新
    newBoard[index] = targetBoard
    judgeWinner(newBoard)
    // boardを更新
    setBoard(newBoard)
  }

  // 盤面を回転させる関数
  // 回転させるときに、どの盤面が回転されるか、どの方向に回転されるかを引数に取る
  const rotateBoard = (target: number, direction: "left" | "right") => {
    const newBoard = JSON.parse(JSON.stringify(board))
    const targetBoard = newBoard[target]
    const rotatedBoard = JSON.parse(JSON.stringify(targetBoard))

    if (direction === "left") {
      // 左回転
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          rotatedBoard[i][j] = targetBoard[j][2 - i]
        }
      }
    } else {
      // 右回転
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          rotatedBoard[i][j] = targetBoard[2 - j][i]
        }
      }
    }
    newBoard[target] = rotatedBoard
    return newBoard
  }

  // 現在のboard 2x2[3x3]の盤面で勝敗がついているかどうかを判定する関数
  const judgeWinner = (newBoard: number[][][]) => {
    // 縦横斜めのうち、5つ連続しているかどうかを判定
    // 連続していたらtrueを返す
    // 連続していなかったらfalseを返す

    // 一度、全ての盤面を1つの配列にまとめる
    const allBoard = newBoard.flat().flat()
    // 縦の判定
    const size = 6;
    // 勝利したユーザーを格納する変数
    // 0: 未決定, 1: player1, 2: player2
    let winner = 0

    // 判定するときに、盤面は3x3が4つ並んでおり、たとえば(0, 2)の右隣りは(0, 3)ではなく(1, 0)なので、
    // 1次元配列では、(0, 2)は2, (0, 3)は3, (1, 0)は9となる
    // (2, 0)の下は(3, 0)ではなく(18, 0)なので、
    // この関係を利用して、縦の判定を行う

    // あらかじめ、縦の判定を行うための配列を作成
    // 縦の判定は、最初の数字をxとして、[x, x+3, x+6, x+18, x+21]か、[x, x+3, x+15, x+18, x+21]のいずれかである
    const vertical = [
      [0, 3, 6, 18, 21],
      [0, 3, 15, 18, 21]
    ]

    // あらかじめ、横の判定を行うための配列を作成
    // 横の判定は、最初の数字をxとして、[x, x+1, x+2, x+9, x+10]か、[x, x+1, x+8, x+9, x+10]のいずれかである
    const horizontal = [
      [0, 1, 2, 9, 10],
      [0, 1, 8, 9, 10]
    ]

    // あらかじめ、ななめの判定を行うための配列を作成
    // ななめの判定は、最初の数字をxとして、[x, x+4, x+8, x+12, x+16]か、[x, x+4, x+6, x+12, x+16]のいずれかである
    const diagonal = [
      [0, 4, 8, 27, 31],
      [4, 8, 27, 31, 35],
      [1, 5, 15, 28, 32],
      [3, 7, 20, 30, 34],
      [11, 13, 15, 20, 22],
      [13, 15, 20, 22, 24],
      [8, 10, 12, 19, 21],
      [14, 16, 23, 25, 27]
    ]

    // 縦の判定
    // それぞれのパターンについて、全てのマスについて判定を行う
    // 6列x2パターンに対して、最初のマスの値を取得し、同じ値がverticalのパターン座標で5つ連続しているかどうかを判定する
    // 縦左
    for (let i = 0; i < size / 2; i++) {
      // 縦の上段
      const baseNum1 = allBoard[i]
      const baseNum2 = allBoard[i+3]

      if (baseNum1 === 0 && baseNum2 === 0) { continue }
      if (baseNum1 !== 0 && vertical[0].every((n) => allBoard[n + i] === baseNum1)) {
        winner = baseNum1
        break
      }
      // 縦の下段
      if (baseNum2 !== 0 && vertical[1].every((n) => allBoard[n + i + 3] === baseNum2)) {
        winner = baseNum2
        break
      }
    }
    if (winner !== 0) {
      setBoard(newBoard)
      console.log(`${winner}の勝ちA`)
      setResult({flag: winner !== 0, player: winner})
      return winner !== 0
    }
    for (let i = 9; i < size * 2; i++) {
      // 縦の上段
      const baseNum1 = allBoard[i]
      const baseNum2 = allBoard[i+3]

      if (baseNum1 === 0 && baseNum2 === 0) { continue }
      
      if (baseNum1 !== 0 && vertical[0].every((n) => allBoard[n + i] === baseNum1)) {
        winner = baseNum1
        continue
      }
      // 縦の下段
      if (baseNum2 !== 0 && vertical[1].every((n) => allBoard[n + i + 3] === baseNum2)) {
        winner = baseNum2
        break
      }
    }
    if (winner !== 0) {
      setBoard(newBoard)
      console.log(`${winner}の勝ちA`)
      setResult({flag: winner !== 0, player: winner})
      return winner !== 0
    }
    // 横の上3行
    for (let i = 0; i <= size; i+=3) {
      const baseNum1 = allBoard[i]
      const baseNum2 = allBoard[i + 1]
      // 横の左側
      if (baseNum1 === 0 && baseNum2 === 0) { continue }
      if (baseNum1 !== 0 && horizontal[0].every((n) => allBoard[n + i] === baseNum1)) {
        winner = baseNum1
        break
      }
      // 横の右側
      if (baseNum2 !== 0 && horizontal[1].every((n) => allBoard[n + i + 1] === baseNum2)) {
        winner = baseNum2
        break
      }
    }
    if (winner !== 0) {
      setBoard(newBoard)
      setResult({flag: winner !== 0, player: winner})
      return winner !== 0
    }
    // 横の下3行
    for (let i = 18; i <= size * 4; i+=3) {
      const baseNum1 = allBoard[i]
      const baseNum2 = allBoard[i + 1]
      // 横の左側
      if (baseNum1 === 0 && baseNum2 === 0) { continue }
      if (baseNum1 !== 0 && horizontal[0].every((n) => allBoard[n + i] === baseNum1)) {
        winner = baseNum1
        break
      }
      // 横の右側
      if (baseNum2 !== 0 && horizontal[1].every((n) => allBoard[n + i + 1] === baseNum2)) {
        winner = baseNum2
        break
      }
    }
    if (winner !== 0) {
      setBoard(newBoard)
      setResult({flag: winner !== 0, player: winner})
      return winner !== 0
    }
    // ななめの判定
    diagonal.some((pattern) => {
      // diagonal[i]の要素をindexとして、allBoardの値が0以外かつ、patternの要素が全て同じ値かどうかを判定
      const result = pattern.every(n => allBoard[n] !== 0 && allBoard[n] === allBoard[pattern[0]])
      // resultがtrueの場合、winnerにallBoard[pattern[0]]を代入
      if (result) {
        winner = allBoard[pattern[0]]
      }
    })

    setBoard(newBoard)
    if (winner !== 0) {
      setResult({flag: winner !== 0, player: winner})
    }
    // allBoardがすべて埋まっている場合、引き分け
    if (winner === 0 && allBoard.every((n) => n !== 0)) {
      setResult({flag: true, player: 3})
      return true
    }
    return winner !== 0
  }

  // currentPlayerを変更する関数
  const changeCurrentPlayer = (player: { player1: boolean, player2: boolean }) => {
    setCurrentPlayer(player)
  }

  // リセットボタンを押したときの処理
  const handleReset = () => {
    setBoard([
      [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
      [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    ])
    setResult({flag: false, player: 0})
    setIsPlayerSelected(false)
    setCurrentPlayer({ player1: true, player2: false })
  }

  const Player1Props: Player = {
    color: "#FF0000",
    name: "Player1",
  }

  const Player2Props: Player = {
    color: "#0000FF",
    name: "Player2",
  }

  const handleClick = (target: number, direction: "left" | "right") => {
    if (!isPlayerSelected) { return }
    if (result.flag) {
      // 勝敗が決まっている場合は何もしない
      return
    }
    const newBoard = rotateBoard(target, direction)
    if (judgeWinner(newBoard)) {
      // 勝敗判定
      console.log(result)
      return
    } else {
      // ターンを交代する
      setIsPlayerSelected(false)
      if (currentPlayer.player1) {
        changeCurrentPlayer({ player1: false, player2: true })
      } else {
        changeCurrentPlayer({ player1: true, player2: false })
      }
    }
  }

  // currentPlayerを参照して、現在のプレイヤーを取得
  const getCurrentPlayer = () => {
    if (currentPlayer.player1) {
      return Player1Props
    } else {
      return Player2Props
    }
  }

  return (
    <>
      <CssBaseline />
      {
        result.flag ? (
          <h1 style={{ textAlign: "center" }}>勝敗:{result.player === 1 ? Player1Props.name : result.player === 2 ? Player2Props.name : result.player === 3 && "引き分け"} {<Button variant={"contained"} color={"primary"} onClick={handleReset}>リセット</Button>}</h1>
        ) : (
          <>
            <h1 style={{ textAlign: "center" }}>{getCurrentPlayer().name}の操作です</h1>
            <p style={{ textAlign: "center" }}>{isPlayerSelected ? "盤を回転させてください" : "マスを押してください"}</p>
          </>
        )
      }

      <Box sx={{ width: "clamp(100px, min(100vw, 100vh), 600px)", aspectRatio: 1, display: "flex", alignItems: "center", justifyContent: "center", margin: "auto" }}>
        {/* 要素を4つ、2x2で中央寄せ */}
        <Grid container columns={4} alignContent={"center"} rowSpacing={1} justifyContent="center" alignItems="center" style={{ width: "100%", height: "100%" }}>
          {/* <Grid size={1}></Grid> */}
          <Grid size={4} container columns={4} spacing={1} justifyContent={"center"}>
            <Grid size={2} justifyContent={"right"}>
              <Box style={
                { height: "100%", maxHeight: "min(40vw, 40vh)", aspectRatio: 1, marginLeft: "auto", display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto 1fr", gridTemplateAreas: '". right" "left paper"', gap: "1px" }
              } >
                <Box sx={{ gridArea: "right", textAlign: "left" }}>
                  <Turn isLeft={false} rotate={0} color={getCurrentPlayer().color} onClick={() => handleClick(0, "right")} />
                </Box>
                <Box sx={{ gridArea: "left", alignContent: "start" }}>
                  <Turn isLeft={true} rotate={-90} color={getCurrentPlayer().color} onClick={() => handleClick(0, "left")} />
                </Box>
                <Paper style={{ gridArea: "paper", height: "100%", maxHeight: "min(40vw, 40vh)", aspectRatio: 1 }} >
                  {/* updateBoard関数のindexだけ、ここで渡したい */}
                  <Board grid={board[0]} index={0} updateBoard={updateBoard} />
                </Paper>
              </Box>
            </Grid>
            <Grid size={2} justifyContent={"left"}>
              <Box style={
                { height: "100%", maxHeight: "min(40vw, 40vh)", aspectRatio: 1, marginRight: "auto", display: "grid", gridTemplateColumns: "1fr auto", gridTemplateRows: "auto 1fr", gridTemplateAreas: '"left ." "paper right"', gap: "1px" }
              } >
                <Box sx={{ gridArea: "right", alignContent: "start" }}>
                  <Turn isLeft={false} rotate={90} color={getCurrentPlayer().color} onClick={() => handleClick(1, "right")} />
                </Box>
                <Box sx={{ gridArea: "left", textAlign: "right" }}>
                  <Turn isLeft={true} rotate={0} color={getCurrentPlayer().color} onClick={() => handleClick(1, "left")} />
                </Box>
                <Paper style={{ gridArea: "paper", height: "100%", maxHeight: "min(40vw, 40vh)", aspectRatio: 1 }} >
                  <Board grid={board[1]} index={1} updateBoard={updateBoard} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
          {/* <Grid size={1}></Grid>
          <Grid size={1}></Grid> */}
          <Grid size={4} container columns={4} spacing={1} justifyContent={"center"}>
            <Grid size={2} justifyContent={"right"}>
              <Box style={
                { height: "100%", maxHeight: "min(40vw, 40vh)", aspectRatio: 1, marginLeft: "auto", display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "1fr auto", gridTemplateAreas: '"right paper" ". left"', gap: "1px" }
              } >
                <Box sx={{ gridArea: "right", alignContent: "end" }}>
                  <Turn isLeft={false} rotate={-90} color={getCurrentPlayer().color} onClick={() => handleClick(2, "right")} />
                </Box>
                <Box sx={{ gridArea: "left", textAlign: "start" }}>
                  <Turn isLeft={true} rotate={180} color={getCurrentPlayer().color} onClick={() => handleClick(2, "left")} />
                </Box>
                <Paper style={{ gridArea: "paper", height: "100%", maxHeight: "min(40vw, 40vh)", aspectRatio: 1 }} >
                  <Board grid={board[2]} index={2} updateBoard={updateBoard} />
                </Paper>
              </Box>
            </Grid>
            <Grid size={2} justifyContent={"left"}>
              <Box style={
                { height: "100%", maxHeight: "min(40vw, 40vh)", aspectRatio: 1, marginRight: "auto", display: "grid", gridTemplateColumns: "1fr auto", gridTemplateRows: "1fr auto", gridTemplateAreas: '"paper left" "right ."', gap: "1px" }
              } >
                <Box sx={{ gridArea: "right", textAlign: "right" }}>
                  <Turn isLeft={false} rotate={180} color={getCurrentPlayer().color} onClick={() => handleClick(3, "right")} />
                </Box>
                <Box sx={{ gridArea: "left", alignContent: "end" }}>
                  <Turn isLeft={true} rotate={90} color={getCurrentPlayer().color} onClick={() => handleClick(3, "left")} />
                </Box>
                <Paper style={{ gridArea: "paper", height: "100%", maxHeight: "min(40vw, 40vh)", aspectRatio: 1 }} >
                  <Board grid={board[3]} index={3} updateBoard={updateBoard} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
          {/* <Grid size={1}></Grid> */}
        </Grid>
      </Box>
    </>
  )
}
