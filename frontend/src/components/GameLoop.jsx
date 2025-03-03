// import React, { useEffect, useRef } from 'react';
// import useGameStore from '../store/gameStore';

// const GameLoop = () => {
//   const { 
//     gameStatus, 
//     level, 
//     updateTargets, 
//     addTarget 
//   } = useGameStore();
  
//   const frameCount = useRef(0);
//   const bubbleInterval = useRef(null);

//   // Main game loop
//   useEffect(() => {
//     if (gameStatus !== 'playing') return;

//     const gameLoop = setInterval(() => {
//       updateTargets();
//     }, 1000 / 60); 

//     return () => clearInterval(gameLoop);
//   }, [gameStatus, updateTargets]);

//   // Bubble generation loop
//   useEffect(() => {
//     if (gameStatus !== 'playing') {
//       if (bubbleInterval.current) {
//         clearInterval(bubbleInterval.current);
//         bubbleInterval.current = null;
//       }
//       return;
//     }

//     // Generate bubbles at a rate dependent on level
//     // Higher levels = more bubbles but with a reasonable cap
//     const interval = Math.max(250, 500 - (level * 30)); 
    
//     bubbleInterval.current = setInterval(() => {
//       addTarget();
//       frameCount.current += 1;
//     }, interval);

//     return () => {
//       if (bubbleInterval.current) {
//         clearInterval(bubbleInterval.current);
//         bubbleInterval.current = null;
//       }
//     };
//   }, [gameStatus, level, addTarget]);

//   return null;
// };

// export default GameLoop;

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

    // Update targets at 60fps
    const gameLoop = setInterval(() => {
      updateTargets();
    }, 1000 / 60); 

    return () => clearInterval(gameLoop);
  }, [gameStatus, updateTargets]);

  
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    // Optional: Send heartbeat to server to ensure game state is in sync
    const heartbeatInterval = setInterval(() => {
      socket.emit('heartbeat', { frameCount: frameCount.current });
      frameCount.current += 1;
    }, 5000); // Every 5 seconds

    return () => clearInterval(heartbeatInterval);
  }, [gameStatus, socket]);

  return null;
};

export default GameLoop;