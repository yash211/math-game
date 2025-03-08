import { Server, Socket } from 'socket.io';
import { players, playerTargets, playerProblems } from './gameState';
import { generateMathProblem, checkLevelUp, multiple_target_generation, craeteBubble } from './helper_function';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Player connected:', socket.id);
    
    players.set(socket.id, {
      id: socket.id,
      score: 0,
      level: 1,
      gameStatus: 'idle'
    });
    
    playerTargets.set(socket.id, []);
    
    // Initial game
    const problem = generateMathProblem(1);
    playerProblems.set(socket.id, problem);
    
    socket.emit('gameState', {
      player: players.get(socket.id),
      targets: [],
      problem
    });
    
    
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
      
      // Start the target generation with staggered timing
      multiple_target_generation(io, socket.id);
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
      const hitTarget = targets.find(t => t.id === id);
      playerTargets.set(socket.id, targets.filter(t => t.id !== id));
      
      if (correct) {
        // Generate new problem when correct answer is hit
        const problem = generateMathProblem(player.level);
        playerProblems.set(socket.id, problem);
        socket.emit('newProblem', problem);
        
        
        if (checkLevelUp(player)) {
          player.level++;
          socket.emit('levelUpdate', player.level);
        }
        
        //clear target after new problem has started
        playerTargets.set(socket.id, []);
        socket.emit('targetsUpdate', []);
        multiple_target_generation(io, socket.id);
      } else {
       
        setTimeout(() => {
          const currentPlayer = players.get(socket.id);
          const currentProblem = playerProblems.get(socket.id);
          
          if (!currentPlayer || currentPlayer.gameStatus !== 'playing' || !currentProblem) {
            return;
          }
          
          const currentTargets = playerTargets.get(socket.id) || [];
          const hasCorrectBubble = currentTargets.some(t => t.value === currentProblem.answer);
          
          // If the hit target was the correct answer and we need a new one
          const forceCorrect = hitTarget?.value === currentProblem.answer && !hasCorrectBubble;
          
          const newTarget = craeteBubble(currentPlayer, currentProblem, forceCorrect, !forceCorrect);
          
          playerTargets.set(socket.id, [...currentTargets, newTarget]);
          socket.emit('newTarget', newTarget);
        }, Math.random() * 500 + 200); // Random delay between 200-700ms
      }
      
      
      socket.emit('targetsUpdate', playerTargets.get(socket.id) || []);
    });
    
    // Target miss
    socket.on('targetMiss', ({ id }) => {
      const player = players.get(socket.id);
      if (!player || player.gameStatus !== 'playing') return;
      
      const targets = playerTargets.get(socket.id) || [];
      const target = targets.find(t => t.id === id);
      
      
      if (target && target.value === playerProblems.get(socket.id)?.answer) {
        player.score = Math.max(0, player.score - 25);
        socket.emit('scoreUpdate', player.score);
      }
      
      playerTargets.set(socket.id, targets.filter(t => t.id !== id));
      
      if (player.score < 0) {
        player.gameStatus = 'gameOver';
        socket.emit('gameOver');
      }
      
      //replacing target with slight delay
      setTimeout(() => {
        const currentPlayer = players.get(socket.id);
        const currentProblem = playerProblems.get(socket.id);
        
        if (!currentPlayer || currentPlayer.gameStatus !== 'playing' || !currentProblem) {
          return;
        }
        
        const currentTargets = playerTargets.get(socket.id) || [];
        const hasCorrectBubble = currentTargets.some(t => t.value === currentProblem.answer);
        
        // If the missed target was the correct answer and we need a new one
        const forceCorrect = target?.value === currentProblem.answer && !hasCorrectBubble;
        
        const newTarget = craeteBubble(currentPlayer, currentProblem, forceCorrect, !forceCorrect);
        
        playerTargets.set(socket.id, [...currentTargets, newTarget]);
        socket.emit('newTarget', newTarget);
      }, Math.random() * 500 + 300); 
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
}