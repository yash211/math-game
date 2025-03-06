import { Player, MathProblem, Target } from './types/game';
import { players, playerTargets, playerProblems, targetIntervals, staggeredTargetTimers } from './gameState';
import { Server } from 'socket.io';

// Generate math equations
export function generateMathProblem(level: number): MathProblem {
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

// Generate a wrong answer that's different from existing values
export function generateUniqueWrongAnswer(problem: MathProblem, existingValues: number[]): number {
  // Generate values within a reasonable range of the correct answer
  const min = Math.max(1, problem.answer - 10);
  const max = problem.answer + 10;
  
  let attempts = 0;
  let value;
  
  do {
    // Create a wrong answer that's reasonably close to the correct one
    const offset = Math.floor(Math.random() * 10) + 1;
    value = Math.random() < 0.5 
      ? problem.answer + offset 
      : Math.max(1, problem.answer - offset);
    
    attempts++;
    // If we can't find a unique value after many attempts, just add a larger offset
    if (attempts > 10) {
      value = problem.answer + (Math.floor(Math.random() * 20) + 11) * (Math.random() < 0.5 ? 1 : -1);
    }
  } while (existingValues.includes(value) || value === problem.answer);
  
  return value;
}

// Generate target bubble
export function generateTarget(player: Player, problem: MathProblem, forceCorrect: boolean = false, forceWrong: boolean = false): Target {
  const windowWidth = player.windowWidth || 800;
  const targets = playerTargets.get(player.id) || [];
  
  // Get all existing values to avoid duplicates
  const existingValues = targets.map(t => t.value);
  
  // Decide if this target should have the correct answer
  const hasCorrectBubble = targets.some(target => target.value === problem.answer);
  
  let value: number;
  if (forceCorrect || (!hasCorrectBubble && !forceWrong)) {
    // This will be our one correct answer bubble
    value = problem.answer;
  } else {
    // Generate a wrong answer that's not a duplicate
    value = generateUniqueWrongAnswer(problem, existingValues);
  }
  
  const size = 50; 
  const baseSpeed = 0.7; 
  const levelSpeedBonus = player.level * 0.2; 
  // Add more variation to speeds so bubbles don't move together
  const randomSpeedVariation = Math.random() * 0.5; 
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

  // Add some variation to starting Y position to stagger the bubbles
  const startingY = -size - (Math.random() * 200);

  return {
    id: Math.random().toString(36).substring(7),
    x,
    y: startingY,
    value,
    speed,
    size
  };
}

// Check if player should level up
export function checkLevelUp(player: Player): boolean {
  const shouldLevelUp = Math.floor(player.score / 500) + 1 > player.level;
  return shouldLevelUp;
}

// Target generation function
export function startTargetGeneration(io: Server, playerId: string) {
  // Clear any existing intervals
  if (targetIntervals.has(playerId)) {
    clearInterval(targetIntervals.get(playerId));
    targetIntervals.delete(playerId);
  }
  
  // Clear any existing timers
  if (staggeredTargetTimers.has(playerId)) {
    staggeredTargetTimers.get(playerId)?.forEach(timer => clearTimeout(timer));
    staggeredTargetTimers.delete(playerId);
  }
  
  const player = players.get(playerId);
  const problem = playerProblems.get(playerId);
  
  if (!player || player.gameStatus !== 'playing' || !problem) {
    return;
  }
  
  // Create an initial set of bubbles with staggered appearance
  const initialTimers: NodeJS.Timeout[] = [];
  const totalBubbles = 6; // Start with 6 bubbles
  
  // Randomly decide which bubble will have the correct answer
  const correctBubbleIndex = Math.floor(Math.random() * totalBubbles);
  
  // Create all bubbles with staggered timing
  for (let i = 0; i < totalBubbles; i++) {
    const timer = setTimeout(() => {
      const currentPlayer = players.get(playerId);
      const currentProblem = playerProblems.get(playerId);
      
      if (!currentPlayer || currentPlayer.gameStatus !== 'playing' || !currentProblem) {
        return;
      }
      
      // This bubble should be the correct answer if it matches the random index
      const isCorrectBubble = (i === correctBubbleIndex);
      
      const newTarget = generateTarget(currentPlayer, currentProblem, isCorrectBubble, !isCorrectBubble);
      
      const targets = playerTargets.get(playerId) || [];
      playerTargets.set(playerId, [...targets, newTarget]);
      
      io.to(playerId).emit('newTarget', newTarget);
    }, 500 + (i * 400)); // Stagger each bubble by 400ms
    
    initialTimers.push(timer);
  }
  
  staggeredTargetTimers.set(playerId, initialTimers);
  
  // Maintain bubble count over time
  const interval = setInterval(() => {
    const currentPlayer = players.get(playerId);
    const currentProblem = playerProblems.get(playerId);
    
    if (!currentPlayer || currentPlayer.gameStatus !== 'playing' || !currentProblem) {
      clearInterval(interval);
      targetIntervals.delete(playerId);
      return;
    }
    
    const targets = playerTargets.get(playerId) || [];
    const minTargets = 5 + Math.min(3, currentPlayer.level); // 5-8 bubbles depending on level
    
    // If we need more bubbles
    if (targets.length < minTargets) {
      const hasCorrectBubble = targets.some(t => t.value === currentProblem.answer);
      
      // Create a new bubble (correct if needed, otherwise wrong)
      const newTarget = generateTarget(currentPlayer, currentProblem, !hasCorrectBubble, hasCorrectBubble);
      
      playerTargets.set(playerId, [...targets, newTarget]);
      io.to(playerId).emit('newTarget', newTarget);
    }
  }, 2000); // Check every 2 seconds
  
  targetIntervals.set(playerId, interval);
}