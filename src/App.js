import React, { useState, useEffect } from 'react';
import './App.css';
import seedrandom from 'seedrandom';

// 画像をインポート
import oniImage from './img/oni.png';
import fukuImage from './img/fuku.png';

// in/0000.txt の内容を埋め込み
const initialGridData = `
20
........x.x......o..
.............o.x.o..
o.o.ox...x........o.
......x.x.......x...
x..x....x...........
..x...x...o....o....
.x...xo....ox.......
......o..x......o.o.
xx....o........o....
o...........o......x
ox.xoo.x...o.......o
.oo..x..xo.....x..ox
...x......x.........
.o......x........o..
.x...xx.....o.o.....
...........x.o.....x
...o....o.oox.o..ox.
................x...
..........o.....o..x
...............x....
`;

// out/0000.txt の内容を埋め込み
const cpuMovesData = `
U 9
L 14
L 6
U 8
L 14
U 8
U 8
U 8
U 8
U 8
U 8
L 4
U 6
L 6
U 6
U 7
U 7
L 8
L 4
U 6
L 14
U 6
L 14
U 6
L 14
U 6
L 4
U 5
L 14
U 5
R 11
U 5
L 8
R 15
D 12
D 12
D 12
D 12
U 3
L 5
L 5
U 10
L 5
U 9
U 9
U 3
L 8
L 8
L 8
L 8
U 0
L 10
L 10
L 3
U 15
R 18
U 15
D 16
D 16
R 2
U 8
U 8
D 10
U 8
D 16
D 10
D 12
U 15
U 5
U 6
U 8
L 13
D 9
D 9
L 7
D 9
D 9
D 9
U 15
R 16
L 10
U 5
R 14
R 14
R 14
R 14
R 16
L 4
D 9
R 9
D 9
L 10
`;

function App() {
  const gridSize = 20;
  const [grid, setGrid] = useState(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
  );
  const [initGrid, setInitGrid] = useState(null); // 初期状態を保持
  const [selectedCell, setSelectedCell] = useState(null);
  const [moveCount, setMoveCount] = useState(0); // 矢印ボタンのクリック回数を管理
  const [isScoreScreen, setIsScoreScreen] = useState(null); // 初期値をnullに設定
  const [isCPURunning, setIsCPURunning] = useState(false); // CPUモードの実行中フラグ
  const [highlightedRow, setHighlightedRow] = useState(null); // スライド中の行を管理
  const [highlightedCol, setHighlightedCol] = useState(null); // スライド中の列を管理

  // 初期状態を設定
  const loadInitialGrid = () => {
    const lines = initialGridData.trim().split('\n');
    const newGrid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

    lines.slice(1).forEach((line, row) => {
      line.split('').forEach((char, col) => {
        if (char === 'x') newGrid[row][col] = '鬼';
        if (char === 'o') newGrid[row][col] = '福神様';
      });
    });

    setGrid(newGrid);
    setInitGrid(newGrid); // 初期状態を保持
  };

  useEffect(() => {
    loadInitialGrid();
    setIsScoreScreen(false); // 初期状態の読み込み後にスコア画面を非表示
  }, []);

  const handleReset = () => {
    if (initGrid) {
      setGrid([...initGrid]); // 初期状態を使用してリセット
    }
    setMoveCount(0); // 操作回数をリセット
    setSelectedCell(null); // 選択状態をリセット
    setIsScoreScreen(false); // スコア画面を非表示
  };

  const handleCPUClick = async () => {
    if (isCPURunning) return; // 実行中なら何もしない
    setIsCPURunning(true); // 実行中フラグを設定

    handleReset(); // リセット処理を呼び出す

    const lines = cpuMovesData.trim().split('\n');

    // initGrid のディープコピーを作成して currentGrid に代入
    let currentGrid = initGrid.map(row => [...row]);

    for (const line of lines) { // すべての行を処理
      const [direction, index] = line.split(' ');
      const idx = parseInt(index, 10);

      const newGrid = currentGrid.map(row => [...row]); // 現在の盤面をコピー

      if (direction === 'U' || direction === 'D') {
        setHighlightedCol(idx); // スライド中の列をハイライト
        if (direction === 'U') {
          for (let i = 0; i < gridSize - 1; i++) {
            newGrid[i][idx] = newGrid[i + 1][idx];
          }
          newGrid[gridSize - 1][idx] = null; // 最後の要素を消滅
        } else {
          for (let i = gridSize - 1; i > 0; i--) {
            newGrid[i][idx] = newGrid[i - 1][idx];
          }
          newGrid[0][idx] = null; // 最初の要素を消滅
        }
      } else if (direction === 'L' || direction === 'R') {
        setHighlightedRow(idx); // スライド中の行をハイライト
        if (direction === 'L') {
          for (let i = 0; i < gridSize - 1; i++) {
            newGrid[idx][i] = newGrid[idx][i + 1];
          }
          newGrid[idx][gridSize - 1] = null; // 最後の要素を消滅
        } else {
          for (let i = gridSize - 1; i > 0; i--) {
            newGrid[idx][i] = newGrid[idx][i - 1];
          }
          newGrid[idx][0] = null; // 最初の要素を消滅
        }
      }

      currentGrid = newGrid; // 現在の盤面を更新
      setGrid(newGrid); // グリッドを更新
      setMoveCount((prev) => prev + 1); // 操作回数をカウント
      await new Promise((resolve) => setTimeout(resolve, 100)); // スライド操作を待機

      setHighlightedRow(null); // ハイライトを解除
      setHighlightedCol(null); // ハイライトを解除
    }

    setIsCPURunning(false); // 実行中フラグを解除
  };

  // スコア計算関数
  const calculateScore = () => {
    const n = gridSize; // 盤面の大きさ
    let x = 0; // 盤面上の鬼の個数
    let y = 40; // 盤面から取り除かれた福の個数

    // 盤面を走査して鬼と福の数をカウント
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell === '鬼') x++;
        if (cell === '福神様') y--;
      });
    });

    // スコア計算
    let score = 0;
    if (x === 0 && y === 0) {
      score = 8 * n * n - moveCount; // x=0かつy=0の場合
    } else {
      score = 4 * n * n - n * (x + y); // それ以外の場合はxとyの数に応じてスコアを計算
    }

    return score;
  };

  // 鬼の数が0になったらスコア画面を表示
  useEffect(() => {
    if (isScoreScreen === null) return; // 初期状態の読み込み中は何もしない
    const x = grid.flat().filter(cell => cell === '鬼').length;
    if (x === 0 && grid.flat().length > 0) {
      setIsScoreScreen(true);
    }
  }, [grid]);

  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
  };

  const handleCancelSelection = (event) => {
    event.stopPropagation(); // クリックイベントの伝播を防ぐ
    setSelectedCell(null); // 選択状態を解除
  };

  const isHighlighted = (row, col) => {
    return selectedCell && (selectedCell.row === row || selectedCell.col === col);
  };

  const handleArrowClick = (event, direction) => {
    if (!selectedCell) return; // 選択されたセルがない場合は何もしない

    const { row, col } = selectedCell;
    const newGrid = [...grid.map(row => [...row])]; // gridをコピーして新しい配列を作成

    if (direction === 'up') {
        for (let i = 0; i < gridSize - 1; i++) {
            newGrid[i][col] = newGrid[i + 1][col];
        }
        newGrid[gridSize - 1][col] = null; // 最後の要素を消滅
    } else if (direction === 'down') {
        for (let i = gridSize - 1; i > 0; i--) {
            newGrid[i][col] = newGrid[i - 1][col];
        }
        newGrid[0][col] = null; // 最初の要素を消滅
    } else if (direction === 'left') {
        for (let i = 0; i < gridSize - 1; i++) {
            newGrid[row][i] = newGrid[row][i + 1];
        }
        newGrid[row][gridSize - 1] = null; // 最後の要素を消滅
    } else if (direction === 'right') {
        for (let i = gridSize - 1; i > 0; i--) {
            newGrid[row][i] = newGrid[row][i - 1];
        }
        newGrid[row][0] = null; // 最初の要素を消滅
    }

    setGrid(newGrid); // 新しいグリッドを設定
    setMoveCount((prev) => prev + 1); // 操作回数をカウント
  };

  return (
    <div className="App">
      <div className="header">
        <div className="score-display">
          スコア: {calculateScore()}
        </div>
        <div className="operation-count">
          操作回数: {moveCount}
        </div>
        <button onClick={handleCPUClick} className="cpu-button">
          CPU
        </button>
        <button onClick={handleReset} className="reset-button">
          リセット
        </button>
      </div>
      {isScoreScreen === true && (
        <>
          <div className="overlay"></div> {/* 黒の透明度50%のオーバーレイ */}
          <div className="score-screen">
            <div className="score-content">
              <div>スコア: {calculateScore()}</div>
              <div>操作回数: {moveCount}</div>
              <button onClick={handleReset} className="reset-button">
                リセット
              </button>
            </div>
          </div>
          <div className="grid-container">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`grid-cell ${
                    highlightedRow === rowIndex || highlightedCol === colIndex
                      ? 'highlighted-slide'
                      : ''
                  } ${
                    selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                      ? 'selected'
                      : isHighlighted(rowIndex, colIndex)
                      ? 'highlighted'
                      : ''
                  }`}
                >
                  {cell && (
                    <img
                      src={cell === '福神様' ? fukuImage : oniImage}
                      alt={cell}
                      className="grid-image"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
      {isScoreScreen === false && (
        <>
          <div className="grid-container">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`grid-cell ${
                    highlightedRow === rowIndex || highlightedCol === colIndex
                      ? 'highlighted-slide'
                      : ''
                  } ${
                    selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                      ? 'selected'
                      : isHighlighted(rowIndex, colIndex)
                      ? 'highlighted'
                      : ''
                  }`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell && (
                    <img
                      src={cell === '福神様' ? fukuImage : oniImage}
                      alt={cell}
                      className="grid-image"
                    />
                  )}
                  {selectedCell?.row === rowIndex &&
                    selectedCell?.col === colIndex && (
                      <div className="arrows">
                        <button
                          className="arrow-button up"
                          onClick={(e) => handleArrowClick(e, 'up')}
                        >
                          ↑
                        </button>
                        <button
                          className="arrow-button down"
                          onClick={(e) => handleArrowClick(e, 'down')}
                        >
                          ↓
                        </button>
                        <button
                          className="arrow-button left"
                          onClick={(e) => handleArrowClick(e, 'left')}
                        >
                          ←
                        </button>
                        <button
                          className="arrow-button right"
                          onClick={(e) => handleArrowClick(e, 'right')}
                        >
                          →
                        </button>
                        <button
                          className="cancel-button"
                          onClick={(e) => handleCancelSelection(e)}
                        >
                          ×
                        </button>
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;