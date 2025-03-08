import { Player, MathProblem, Target } from './types/game';
import { players, playerTargets, playerProblems, targetIntervals, staggeredTargetTimers } from './gameState';
import { Server } from 'socket.io';

// Generate math equations
export function generateMathProblem(level: number): MathProblem {
  const operands = ['+', '-', '*'];
  const sign = operands[Math.floor(Math.random() * (level === 1 ? 2 : 3))];
  
  let num1: number, num2: number, answer: number;
  
  switch (sign) {
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
    question: `${num1} ${sign} ${num2}`,
    answer
  };
}

// Generate a wrong answer that's different from existing values
export function generate_wrong_answer(problem: MathProblem, existingValues: number[]): number {

  let no_of_attempts = 0;
  let value;
  
  do {
    //Wrong answer which are close to correct answers
    const offset = Math.floor(Math.random() * 10) + 1;
    value = Math.random() < 0.5 
      ? problem.answer + offset 
      : Math.max(1, problem.answer - offset);
    
    no_of_attempts++;
    // add larger offset values
    if (no_of_attempts > 10) {
      value = problem.answer + (Math.floor(Math.random() * 20) + 11) * (Math.random() < 0.5 ? 1 : -1);
    }
  } while (existingValues.includes(value) || value === problem.answer);
  
  return value;
}

// Generate target bubble
export function craeteBubble(player: Player, problem: MathProblem, forceCorrect: boolean = false, forceWrong: boolean = false): Target {
  const windowWidth = player.windowWidth || 800;
  const targets = playerTargets.get(player.id) || [];
  
  // Get all existing values to avoid duplicates
  const existingValues = targets.map(t => t.value);
  
 
  const isCorrect = targets.some(target => target.value === problem.answer);
  
  let value: number;
  if (forceCorrect || (!isCorrect && !forceWrong)) {
    
    value = problem.answer;
  } else {
    
    value = generate_wrong_answer(problem, existingValues);
  }

  //bubble preparation
  
  const size = 50; 
  const baseSpeed = 0.7; 
  const increment_speed_wrt_level = player.level * 0.2; 
  
  const rspeedvar = Math.random() * 0.5; 
  const speed = baseSpeed + increment_speed_wrt_level + rspeedvar;

  
  let x = 0;
  let over_lapping_bubbles = false;
  const maxAttempts = 10;
  let attempts = 0;
  
  do {
    attempts++;
    over_lapping_bubbles = false;
    x = Math.random() * (windowWidth - size * 2) + size;
    
   
    for (const target of targets) {
      const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(-size - target.y, 2));
      if (distance < (size + target.size)) {
        over_lapping_bubbles = true;
        break;
      }
    }
  } while (over_lapping_bubbles && attempts < maxAttempts);

  
  const y_value = -size - (Math.random() * 200);

  return {
    id: Math.random().toString(36).substring(7),
    x,
    y: y_value,
    value,
    speed,
    size
  };
}

// level up
export function checkLevelUp(player: Player): boolean {
  const shouldLevelUp = Math.floor(player.score / 500) + 1 > player.level;
  return shouldLevelUp;
}

// Target generation function
export function multiple_target_generation(io: Server, playerId: string) {
 
  if (targetIntervals.has(playerId)) {
    clearInterval(targetIntervals.get(playerId));
    targetIntervals.delete(playerId);
  }
  
 
  if (staggeredTargetTimers.has(playerId)) {
    staggeredTargetTimers.get(playerId)?.forEach(timer => clearTimeout(timer));
    staggeredTargetTimers.delete(playerId);
  }
  
  const player = players.get(playerId);
  const problem = playerProblems.get(playerId);
  
  if (!player || player.gameStatus !== 'playing' || !problem) {
    return;
  }
  
  // initially setting it to 6 bubbles
  const initialTimers: NodeJS.Timeout[] = [];
  const totalBubbles = 6; 
  
  
  const correctBubbleIndex = Math.floor(Math.random() * totalBubbles);
  
  //first time targets generation
  for (let i = 0; i < totalBubbles; i++) {
    const timer = setTimeout(() => {
      const currentPlayer = players.get(playerId);
      const currentProblem = playerProblems.get(playerId);
      
      if (!currentPlayer || currentPlayer.gameStatus !== 'playing' || !currentProblem) {
        return;
      }
      
      
      const isCorrectBubble = (i === correctBubbleIndex);
      
      const newTarget = craeteBubble(currentPlayer, currentProblem, isCorrectBubble, !isCorrectBubble);
      
      const targets = playerTargets.get(playerId) || [];
      playerTargets.set(playerId, [...targets, newTarget]);
      
      io.to(playerId).emit('newTarget', newTarget);
    }, 500 + (i * 400)); 
    
    initialTimers.push(timer);
  }
  
  staggeredTargetTimers.set(playerId, initialTimers);
  
  // bubble generation in every 2 seconds
  const interval = setInterval(() => {
    const currentPlayer = players.get(playerId);
    const currentProblem = playerProblems.get(playerId);
    
    if (!currentPlayer || currentPlayer.gameStatus !== 'playing' || !currentProblem) {
      clearInterval(interval);
      targetIntervals.delete(playerId);
      return;
    }
    
    const targets = playerTargets.get(playerId) || [];
    const minTargets = 5 + Math.min(3, currentPlayer.level); 
    
    
    if (targets.length < minTargets) {
      const hasCorrectBubble = targets.some(t => t.value === currentProblem.answer);
      
      const newTarget = craeteBubble(currentPlayer, currentProblem, !hasCorrectBubble, hasCorrectBubble);
      
      playerTargets.set(playerId, [...targets, newTarget]);
      io.to(playerId).emit('newTarget', newTarget);
    }
  }, 2000); 
  
  targetIntervals.set(playerId, interval);
}