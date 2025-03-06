
import React, { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';

const GameLoop = () => {
  const { 
    gameStatus, 
    level, 
    updateTargets,
    socket
  } = useGameStore();
  
  const frameCount = useRef(0);
  
  // Main game loop for updating target positions
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    // targets at 60fps
    const gameLoop = setInterval(() => {
      updateTargets();
    }, 1000 / 60); 

    return () => clearInterval(gameLoop);
  }, [gameStatus, updateTargets]);

  
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    
    const heartbeatInterval = setInterval(() => {
      socket.emit('heartbeat', { frameCount: frameCount.current });
      frameCount.current += 1;
    }, 5000);

    return () => clearInterval(heartbeatInterval);
  }, [gameStatus, socket]);

  return null;
};

export default GameLoop;