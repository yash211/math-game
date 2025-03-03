import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Player,MathProblem,Target } from './src/types/game';


// Setup Express and Socket.io
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// Game states
const players = new Map<string, Player>();
const playerTargets = new Map<string, Target[]>();
const playerProblems = new Map<string, MathProblem>();

// Generate math equations
function generateMathProblem(level: number): MathProblem {
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * (level === 1 ? 2 : 3))];
  
  let num1: number, num2: number, answer: number;
  
  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * (10 * level)) + 1;
      num2 = Math.floor(Math.random() * (10 * level)) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * (10 * level)) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * (5 * level)) + 1;
      num2 = Math.floor(Math.random() * 5) + 1;
      answer = num1 * num2;
      break;
    default:
      num1 = 0;
      num2 = 0;
      answer = 0;
  }
  
  return {
    question: `${num1} ${operation} ${num2}`,
    answer
  };
}

// Generate target bubble
function generateTarget(player: Player, problem: MathProblem): Target {
  const windowWidth = player.windowWidth || 800;
  
  // wrong answers close to the correct answer
  const generateWrongAnswer = () => {
    const offset = Math.floor(Math.random() * 5) + 1;
    return Math.random() < 0.5 
      ? problem.answer + offset 
      : problem.answer - offset;
  };

  
  const targets = playerTargets.get(player.id) || [];
  const hasCorrectBubble = targets.some(target => 
    target.value === problem.answer
  );
  
  // If we already have a correct answer, only generate wrong answer
  const value = hasCorrectBubble ? generateWrongAnswer() : problem.answer;
  const size = 50; 
  const baseSpeed = 0.7; 
  const levelSpeedBonus = player.level * 0.2; 
  const randomSpeedVariation = Math.random() * 0.3; 
  const speed = baseSpeed + levelSpeedBonus + randomSpeedVariation;

  // Find a position that doesn't overlap with existing bubbles
  let x = 0;
  let overlapping = false;
  const maxAttempts = 10;
  let attempts = 0;
  
  do {
    attempts++;
    overlapping = false;
    x = Math.random() * (windowWidth - size * 2) + size;
    
    // Check for overlap with existing targets
    for (const target of targets) {
      const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(-size - target.y, 2));
      if (distance < (size + target.size)) {
        overlapping = true;
        break;
      }
    }
  } while (overlapping && attempts < maxAttempts);

  
  const valueExists = targets.some(target => target.value === value);
  

  let finalValue = value;
  if (valueExists && value !== problem.answer) {
    
    let uniqueValue = value;
    let valueAttempts = 0;
    while (targets.some(target => target.value === uniqueValue) && valueAttempts < 5) {
      uniqueValue = generateWrongAnswer();
      valueAttempts++;
    }
    
    // If we still have a duplicate after attempts, so adding random offset
    if (targets.some(target => target.value === uniqueValue)) {
      uniqueValue = value + Math.floor(Math.random() * 10) + 5;
    }
    
    finalValue = uniqueValue;
  }

  return {
    id: Math.random().toString(36).substring(7),
    x,
    y: -size,
    value: finalValue,
    speed,
    size
  };
}

// Check if player should level up
function checkLevelUp(player: Player): boolean {
  const shouldLevelUp = Math.floor(player.score / 500) + 1 > player.level;
  return shouldLevelUp;
}

// Socket connections
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  
  players.set(socket.id, {
    id: socket.id,
    score: 0,
    level: 1,
    gameStatus: 'idle'
  });
  
  playerTargets.set(socket.id, []);
  
  // initial game
  const problem = generateMathProblem(1);
  playerProblems.set(socket.id, problem);
  
  socket.emit('gameState', {
    player: players.get(socket.id),
    targets: [],
    problem
  });
  
  // Initialize game
  socket.on('initGame', ({ width }) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    player.windowWidth = width;
    player.gameStatus = 'playing';
    player.score = 0;
    player.level = 1;
    
    const problem = generateMathProblem(1);
    playerProblems.set(socket.id, problem);
    playerTargets.set(socket.id, []);
    
    socket.emit('gameState', {
      player,
      targets: [],
      problem
    });
    
    // Add Targets
    startTargetGeneration(socket.id);
  });
  
  // Stop game
  socket.on('stopGame', () => {
    const player = players.get(socket.id);
    if (!player) return;
    
    player.gameStatus = 'idle';
    playerTargets.set(socket.id, []);
    
    socket.emit('gameState', {
      player,
      targets: [],
      problem: playerProblems.get(socket.id) || { question: '', answer: 0 }
    });
  });
  
  // Handle target hit by player
  socket.on('targetHit', ({ id, correct }) => {
    const player = players.get(socket.id);
    if (!player || player.gameStatus !== 'playing') return;
    
    // Update score
    player.score = Math.max(0, player.score + (correct ? 100 : -50));
    socket.emit('scoreUpdate', player.score);
    
    // Remove hit target
    const targets = playerTargets.get(socket.id) || [];
    playerTargets.set(socket.id, targets.filter(t => t.id !== id));
    
    if (correct) {
      // Generate new problem when correct answer is hit
      const problem = generateMathProblem(player.level);
      playerProblems.set(socket.id, problem);
      socket.emit('newProblem', problem);
      
      // Check if player should level up
      if (checkLevelUp(player)) {
        player.level++;
        socket.emit('levelUpdate', player.level);
      }
    }
    
    // Send updated targets
    socket.emit('targetsUpdate', playerTargets.get(socket.id) || []);
  });
  
  // target miss
  socket.on('targetMiss', ({ id }) => {
    const player = players.get(socket.id);
    if (!player || player.gameStatus !== 'playing') return;
    
    
    const targets = playerTargets.get(socket.id) || [];
    const target = targets.find(t => t.id === id);
    
    //penalize player if target is missed
    if (target && target.value === playerProblems.get(socket.id)?.answer) {
      player.score = Math.max(0, player.score - 25);
      socket.emit('scoreUpdate', player.score);
    }
    
    playerTargets.set(socket.id, targets.filter(t => t.id !== id));
    
    
    if (player.score < 0) {
      player.gameStatus = 'gameOver';
      socket.emit('gameOver');
    }
  });
  
  
  socket.on('updateTargetPositions', (updatedTargets) => {
    const player = players.get(socket.id);
    if (!player || player.gameStatus !== 'playing') return;
    
    playerTargets.set(socket.id, updatedTargets);
  });
  
  // Level up request
  socket.on('levelUp', ({ level }: { level: number }) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    
    if (level <= player.level + 1) {
      player.level = level;
      socket.emit('levelUpdate', level);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    players.delete(socket.id);
    playerTargets.delete(socket.id);
    playerProblems.delete(socket.id);
  });
});

// Target generation interval 
const targetIntervals = new Map<string, NodeJS.Timeout>();
const multiTargetIntervals = new Map<string, NodeJS.Timeout[]>();

function startTargetGeneration(playerId: string) {
  
  if (targetIntervals.has(playerId)) {
    clearInterval(targetIntervals.get(playerId));
    targetIntervals.delete(playerId);
  }
  
  
  if (multiTargetIntervals.has(playerId)) {
    multiTargetIntervals.get(playerId)?.forEach(interval => clearInterval(interval));
    multiTargetIntervals.delete(playerId);
  }
  
  
  const player = players.get(playerId);
  const problem = playerProblems.get(playerId);
  
  if (!player || player.gameStatus !== 'playing' || !problem) {
    return; 
  }
  
  // Base interval creates one target at a time
  const baseInterval = setInterval(() => {
    
    const currentPlayer = players.get(playerId);
    const currentProblem = playerProblems.get(playerId);
    
    if (!currentPlayer || currentPlayer.gameStatus !== 'playing' || !currentProblem) {
      clearInterval(baseInterval);
      targetIntervals.delete(playerId);
      return;
    }
    
    // Generate new target
    const newTarget = generateTarget(currentPlayer, currentProblem);
    const targets = playerTargets.get(playerId) || [];
    
    playerTargets.set(playerId, [...targets, newTarget]);
    
    io.to(playerId).emit('newTarget', newTarget);
  }, 2000 - Math.min(1500, player.level * 100));
  
  targetIntervals.set(playerId, baseInterval);
  
  updateLevelBasedTargets(playerId);
}

// Function to update intervals based on level
function updateLevelBasedTargets(playerId: string) {
  const player = players.get(playerId);
  if (!player || player.gameStatus !== 'playing') return;
  
 
  if (multiTargetIntervals.has(playerId)) {
    multiTargetIntervals.get(playerId)?.forEach(interval => clearInterval(interval));
  }
  
  const newIntervals: NodeJS.Timeout[] = [];
  
  // For each level above 1, add an additional target generator
  // with slower interval to avoid overwhelming the player
  for (let i = 1; i < player.level; i++) {
    // Each level adds another target generator, but with increasing delay
    // This creates more targets at higher levels but without flooding the screen
    const levelInterval = setInterval(() => {
      const currentPlayer = players.get(playerId);
      const problem = playerProblems.get(playerId);
      
      if (!currentPlayer || currentPlayer.gameStatus !== 'playing' || !problem) {
        clearInterval(levelInterval);
        return;
      }
      
      // Max number of simultaneous targets on screen increases with level
      const maxTargets = 5 + (currentPlayer.level * 2);
      const currentTargets = playerTargets.get(playerId) || [];
      
      if (currentTargets.length >= maxTargets) return;
      
      // Generate new target
      const newTarget = generateTarget(currentPlayer, problem);
      
     
      playerTargets.set(playerId, [...currentTargets, newTarget]);
      
      io.to(playerId).emit('newTarget', newTarget);
    }, 3000 + (i * 500)); 
    
    newIntervals.push(levelInterval);
  }
  
  multiTargetIntervals.set(playerId, newIntervals);
}

io.on('connection', (socket) => {
  socket.on('levelUp', ({ level }) => {
    // When level changes, update the multi-target generators
    updateLevelBasedTargets(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});