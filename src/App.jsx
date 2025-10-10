import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

// Game constants
const BOARD_WIDTH = 20
const BOARD_HEIGHT = 20
const INITIAL_SPEED = 200

// Directions
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
}

function App() {
  const [gameState, setGameState] = useState({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: DIRECTIONS.RIGHT,
    gameOver: false,
    score: 0,
    isPlaying: false,
    isAIMode: false,
    gameSpeed: INITIAL_SPEED,
    aiDifficulty: 'smart', // 'basic', 'smart', 'expert'
    stats: {
      gamesPlayed: 0,
      bestScore: 0,
      totalFoodEaten: 0,
      averageScore: 0
    }
  })

  const gameLoopRef = useRef(null)
  const aiTimeoutRef = useRef(null)

  // AI Pathfinding using BFS
  const findPath = useCallback((start, target, obstacles) => {
    const queue = [{ pos: start, path: [] }]
    const visited = new Set()
    visited.add(`${start.x},${start.y}`)

    while (queue.length > 0) {
      const { pos, path } = queue.shift()

      if (pos.x === target.x && pos.y === target.y) {
        return path
      }

      // Check all 4 directions
      Object.values(DIRECTIONS).forEach(direction => {
        const newPos = {
          x: pos.x + direction.x,
          y: pos.y + direction.y
        }

        const key = `${newPos.x},${newPos.y}`
        
        // Check bounds
        if (newPos.x < 0 || newPos.x >= BOARD_WIDTH || 
            newPos.y < 0 || newPos.y >= BOARD_HEIGHT) {
          return
        }

        // Check if already visited or is obstacle
        if (visited.has(key) || obstacles.has(key)) {
          return
        }

        visited.add(key)
        queue.push({
          pos: newPos,
          path: [...path, direction]
        })
      })
    }

    return null // No path found
  }, [])

  // AI Decision Making with different difficulty levels
  const getAIMove = useCallback((snake, food, difficulty = 'smart') => {
    const obstacles = new Set()
    // Add snake body as obstacles (excluding head)
    snake.slice(1).forEach(segment => {
      obstacles.add(`${segment.x},${segment.y}`)
    })

    const head = snake[0]
    
    if (difficulty === 'basic') {
      // Basic AI: Just try to go towards food without advanced pathfinding
      const dx = food.x - head.x
      const dy = food.y - head.y
      
      // Simple heuristic: move towards food
      let preferredDirections = []
      if (dx > 0) preferredDirections.push(DIRECTIONS.RIGHT)
      if (dx < 0) preferredDirections.push(DIRECTIONS.LEFT)
      if (dy > 0) preferredDirections.push(DIRECTIONS.DOWN)
      if (dy < 0) preferredDirections.push(DIRECTIONS.UP)
      
      // Try preferred directions first
      for (const direction of preferredDirections) {
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        }
        
        if (newHead.x >= 0 && newHead.x < BOARD_WIDTH && 
            newHead.y >= 0 && newHead.y < BOARD_HEIGHT) {
          const key = `${newHead.x},${newHead.y}`
          if (!obstacles.has(key)) {
            return direction
          }
        }
      }
    }
    
    // Smart and Expert AI: Advanced pathfinding
    if (difficulty === 'smart' || difficulty === 'expert') {
      // Strategy 1: Try to find direct path to food
      const pathToFood = findPath(head, food, obstacles)
      
      if (pathToFood && pathToFood.length > 0) {
        // Check if taking this path will create a dead end
        const nextMove = pathToFood[0]
        const futureHead = {
          x: head.x + nextMove.x,
          y: head.y + nextMove.y
        }
        
        // Simulate future snake position
        const futureSnake = [futureHead, ...snake]
        const futureObstacles = new Set()
        futureSnake.slice(1).forEach(segment => {
          futureObstacles.add(`${segment.x},${segment.y}`)
        })
        
        // Check if there's still a path from future position to food
        const futurePath = findPath(futureHead, food, futureObstacles)
        if (futurePath && futurePath.length > 0) {
          return nextMove
        }
      }

      // Strategy 2: Find the move that gives the most space (avoid dead ends)
      const spaceScores = Object.values(DIRECTIONS).map(direction => {
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        }

        // Check bounds
        if (newHead.x < 0 || newHead.x >= BOARD_WIDTH || 
            newHead.y < 0 || newHead.y >= BOARD_HEIGHT) {
          return { direction, score: -1000 } // Invalid move
        }

        // Check collision with snake body
        const key = `${newHead.x},${newHead.y}`
        if (obstacles.has(key)) {
          return { direction, score: -1000 } // Collision
        }

        // Calculate accessible space from this position
        const futureSnake = [newHead, ...snake]
        const futureObstacles = new Set()
        futureSnake.slice(1).forEach(segment => {
          futureObstacles.add(`${segment.x},${segment.y}`)
        })

        // Count accessible cells using flood fill
        const accessibleCells = floodFill(newHead, futureObstacles)
        
        // Bonus for moving towards food
        const distanceToFood = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y)
        const foodBonus = Math.max(0, 20 - distanceToFood)

        return { 
          direction, 
          score: accessibleCells + foodBonus 
        }
      })

      // Sort by score and pick the best move
      spaceScores.sort((a, b) => b.score - a.score)
      
      if (spaceScores[0] && spaceScores[0].score > -1000) {
        return spaceScores[0].direction
      }
    }

    // Strategy 3: Last resort - try to avoid immediate collision
    const safeMoves = Object.values(DIRECTIONS).filter(direction => {
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      }

      if (newHead.x < 0 || newHead.x >= BOARD_WIDTH || 
          newHead.y < 0 || newHead.y >= BOARD_HEIGHT) {
        return false
      }

      const key = `${newHead.x},${newHead.y}`
      return !obstacles.has(key)
    })

    return safeMoves[0] || DIRECTIONS.RIGHT
  }, [findPath, floodFill])

  // Flood fill algorithm to count accessible cells
  const floodFill = useCallback((start, obstacles) => {
    const visited = new Set()
    const queue = [start]
    visited.add(`${start.x},${start.y}`)
    let count = 0

    while (queue.length > 0) {
      const current = queue.shift()
      count++

      Object.values(DIRECTIONS).forEach(direction => {
        const next = {
          x: current.x + direction.x,
          y: current.y + direction.y
        }

        const key = `${next.x},${next.y}`

        if (next.x >= 0 && next.x < BOARD_WIDTH && 
            next.y >= 0 && next.y < BOARD_HEIGHT &&
            !visited.has(key) && !obstacles.has(key)) {
          visited.add(key)
          queue.push(next)
        }
      })
    }

    return count
  }, [])

  // Game logic
  const moveSnake = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.isPlaying || prevState.gameOver) return prevState

      const newSnake = [...prevState.snake]
      const head = { ...newSnake[0] }
      
      // Move head
      head.x += prevState.direction.x
      head.y += prevState.direction.y

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_WIDTH || 
          head.y < 0 || head.y >= BOARD_HEIGHT) {
        return { ...prevState, gameOver: true, isPlaying: false }
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return { ...prevState, gameOver: true, isPlaying: false }
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        // Generate new food
        let newFood
        do {
          newFood = {
            x: Math.floor(Math.random() * BOARD_WIDTH),
            y: Math.floor(Math.random() * BOARD_HEIGHT)
          }
        } while (newSnake.some(segment => 
          segment.x === newFood.x && segment.y === newFood.y))

        const newScore = prevState.score + 10
        const newTotalFood = prevState.stats.totalFoodEaten + 1
        const newBestScore = Math.max(prevState.stats.bestScore, newScore)

        return {
          ...prevState,
          snake: newSnake,
          food: newFood,
          score: newScore,
          stats: {
            ...prevState.stats,
            totalFoodEaten: newTotalFood,
            bestScore: newBestScore
          }
        }
      } else {
        // Remove tail if no food eaten
        newSnake.pop()
        return { ...prevState, snake: newSnake }
      }
    })
  }, [])

  // AI Move
  const makeAIMove = useCallback(() => {
    if (!gameState.isAIMode || !gameState.isPlaying) return

    const aiDirection = getAIMove(gameState.snake, gameState.food, gameState.aiDifficulty)
    setGameState(prevState => ({
      ...prevState,
      direction: aiDirection
    }))
  }, [gameState.isAIMode, gameState.isPlaying, gameState.snake, gameState.food, gameState.aiDifficulty, getAIMove])

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      gameLoopRef.current = setInterval(moveSnake, gameState.gameSpeed)
      
      if (gameState.isAIMode) {
        aiTimeoutRef.current = setTimeout(makeAIMove, 50)
      }
    } else {
      clearInterval(gameLoopRef.current)
      clearTimeout(aiTimeoutRef.current)
    }

    return () => {
      clearInterval(gameLoopRef.current)
      clearTimeout(aiTimeoutRef.current)
    }
  }, [gameState.isPlaying, gameState.gameOver, gameState.gameSpeed, moveSnake, makeAIMove])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameState.isPlaying || gameState.isAIMode) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          setGameState(prev => ({ ...prev, direction: DIRECTIONS.UP }))
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          setGameState(prev => ({ ...prev, direction: DIRECTIONS.DOWN }))
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          setGameState(prev => ({ ...prev, direction: DIRECTIONS.LEFT }))
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          setGameState(prev => ({ ...prev, direction: DIRECTIONS.RIGHT }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.isPlaying, gameState.isAIMode])

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      gameOver: false,
      snake: [{ x: 10, y: 10 }],
      direction: DIRECTIONS.RIGHT,
      score: 0,
      stats: {
        ...prev.stats,
        gamesPlayed: prev.gameOver ? prev.stats.gamesPlayed + 1 : prev.stats.gamesPlayed
      }
    }))
  }

  const toggleAI = () => {
    setGameState(prev => ({
      ...prev,
      isAIMode: !prev.isAIMode,
      isPlaying: false,
      gameOver: false
    }))
  }

  const changeSpeed = (speed) => {
    setGameState(prev => ({ ...prev, gameSpeed: speed }))
  }

  const changeAIDifficulty = (difficulty) => {
    setGameState(prev => ({ ...prev, aiDifficulty: difficulty }))
  }

  return (
    <div className="game-container">
      <h1>Snake AI Agent</h1>
      
      <div className="game-controls">
        <div className="control-group">
          <button onClick={startGame} disabled={gameState.isPlaying}>
            {gameState.gameOver ? 'Restart' : 'Start Game'}
          </button>
          <button 
            onClick={toggleAI} 
            className={gameState.isAIMode ? 'ai-active' : ''}
          >
            {gameState.isAIMode ? 'AI Mode ON' : 'Manual Mode'}
          </button>
        </div>
        
        <div className="speed-controls">
          <label>Speed:</label>
          <button onClick={() => changeSpeed(300)} className={gameState.gameSpeed === 300 ? 'active' : ''}>Slow</button>
          <button onClick={() => changeSpeed(200)} className={gameState.gameSpeed === 200 ? 'active' : ''}>Medium</button>
          <button onClick={() => changeSpeed(100)} className={gameState.gameSpeed === 100 ? 'active' : ''}>Fast</button>
        </div>
        
        {gameState.isAIMode && (
          <div className="ai-difficulty-controls">
            <label>AI Level:</label>
            <button onClick={() => changeAIDifficulty('basic')} className={gameState.aiDifficulty === 'basic' ? 'active' : ''}>Basic</button>
            <button onClick={() => changeAIDifficulty('smart')} className={gameState.aiDifficulty === 'smart' ? 'active' : ''}>Smart</button>
            <button onClick={() => changeAIDifficulty('expert')} className={gameState.aiDifficulty === 'expert' ? 'active' : ''}>Expert</button>
          </div>
        )}
      </div>

      <div className="game-info">
        <div className="score">Score: {gameState.score}</div>
        <div className="mode">
          {gameState.isAIMode ? `🤖 AI Playing (${gameState.aiDifficulty})` : '🎮 Manual Control'}
        </div>
      </div>

      <div className="statistics">
        <h3>Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Games Played:</span>
            <span className="stat-value">{gameState.stats.gamesPlayed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Best Score:</span>
            <span className="stat-value">{gameState.stats.bestScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Food Eaten:</span>
            <span className="stat-value">{gameState.stats.totalFoodEaten}</span>
          </div>
        </div>
      </div>

      <div className="game-board">
        {Array.from({ length: BOARD_HEIGHT }, (_, y) =>
          Array.from({ length: BOARD_WIDTH }, (_, x) => {
            const isSnakeHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y
            const isSnakeBody = gameState.snake.slice(1).some(segment => segment.x === x && segment.y === y)
            const isFood = gameState.food.x === x && gameState.food.y === y

            return (
              <div
                key={`${x}-${y}`}
                className={`cell ${isSnakeHead ? 'snake-head' : ''} ${isSnakeBody ? 'snake-body' : ''} ${isFood ? 'food' : ''}`}
              />
            )
          })
        )}
      </div>

      <div className="instructions">
        <h3>Controls:</h3>
        <p>Manual Mode: Use Arrow Keys or WASD to control the snake</p>
        <p>AI Mode: Watch the AI agent play automatically using pathfinding algorithms</p>
        <p>Speed: Adjust game speed for different difficulty levels</p>
      </div>
    </div>
  )
}

export default App
