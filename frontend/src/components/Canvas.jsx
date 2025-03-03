

// import React, { useRef, useEffect } from 'react';
// import useGameStore from '../store/gameStore';

// const Canvas = () => {
//   const canvasRef = useRef(null);
//   const {
//     targets,
//     currentProblem,
//     score,
//     level,
//     gameStatus,
//     removeTarget,
//     setScore,
//     setLevel,
//     setGameStatus,
//     generateNewProblem,
//     socket
//   } = useGameStore();

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const handleResize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight - 30;
//       socket.emit('windowSize', { width: window.innerWidth });
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);

//     return () => window.removeEventListener('resize', handleResize);
//   }, [socket]);

//   // Initialize game with first problem
//   useEffect(() => {
//     if (gameStatus === 'playing' && !currentProblem.question) {
//       generateNewProblem();
//     }
//   }, [gameStatus, currentProblem, generateNewProblem]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas || gameStatus !== 'playing') return;

//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // Draw bottom red line
//       ctx.beginPath();
//       ctx.moveTo(0, canvas.height - 5);
//       ctx.lineTo(canvas.width, canvas.height - 5);
//       ctx.lineWidth = 5;
//       ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
//       ctx.stroke();

//       targets.forEach(target => {
//         // Check if target has reached the bottom and is the correct answer
//         if (target.y + target.size > canvas.height - 5) {
//           if (target.value === currentProblem.answer) {
//             setGameStatus('gameOver');
//             return;
//           } else {
//             // Remove incorrect bubbles that hit the bottom
//             removeTarget(target.id);
//             return;
//           }
//         }

//         // Draw bubble - same color for all bubbles
//         const gradient = ctx.createRadialGradient(
//           target.x, target.y, 0,
//           target.x, target.y, target.size
//         );

//         // Use the same color for all bubbles
//         gradient.addColorStop(0, 'rgba(46, 131, 183, 0.8)');
//         gradient.addColorStop(1, 'rgba(37, 235, 123, 0.6)');

//         ctx.beginPath();
//         ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
//         ctx.fillStyle = gradient;
//         ctx.fill();

//         // Add shine effect
//         ctx.beginPath();
//         ctx.arc(target.x - target.size * 0.3, target.y - target.size * 0.3, target.size * 0.2, 0, Math.PI * 2);
//         ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
//         ctx.fill();

//         // Draw number
//         ctx.fillStyle = 'white';
//         ctx.font = `bold ${Math.max(20, target.size / 2)}px Arial`;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.fillText(target.value.toString(), target.x, target.y);
//       });
//     };

//     const animation = requestAnimationFrame(draw);
//     return () => cancelAnimationFrame(animation);
//   }, [targets, gameStatus, setGameStatus, currentProblem, removeTarget]);

//   const handleClick = (e) => {
//     if (gameStatus !== 'playing') return;

//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     // Find the topmost bubble at the click position
//     let clickedTarget = null;
//     let minDistance = Infinity;

//     targets.forEach(target => {
//       const distance = Math.sqrt(
//         Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
//       );

//       if (distance < target.size && distance < minDistance) {
//         clickedTarget = target;
//         minDistance = distance;
//       }
//     });

//     if (clickedTarget) {
//       const correct = clickedTarget.value === currentProblem.answer;
//       removeTarget(clickedTarget.id);

//       if (correct) {
//         setScore(score + 100);
//         socket.emit('targetHit', { targetId: clickedTarget.id, correct });
//         generateNewProblem();

//         // Level up every 500 points
//         if (score > 0 && score % 500 === 0) {
//           setLevel(level + 1);
//         }
//       } else {
//         // Game over on incorrect answer
//         socket.emit('targetHit', { targetId: clickedTarget.id, correct: false });
//         setGameStatus('gameOver');
//       }
//     }
//   };

//   return (
//     <canvas
//       ref={canvasRef}
//       onClick={handleClick}
//       className="inset-0 z-10"
//       style={{ position: 'absolute', top: 5 }}
//     />
//   );
// };

// export default Canvas;

import React, { useRef, useEffect } from 'react';
import useGameStore from '../store/gameStore';

const Canvas = () => {
  const canvasRef = useRef(null);
  const {
    targets,
    currentProblem,
    gameStatus,
    setGameStatus,
    updateTargets,
    handleTargetClick,
    handleTargetMiss,
    socket
  } = useGameStore();

  // Set up canvas and handle window resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 30;
      // Notify server about window size when resizing
      socket.emit('windowSize', { width: window.innerWidth });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [socket]);

  // Game animation loop
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    
    const render = () => {
      // Update target positions
      updateTargets();
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bottom red line
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 5);
      ctx.lineTo(canvas.width, canvas.height - 5);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.stroke();

      // Draw each target
      targets.forEach(target => {
        // Check if target has reached the bottom
        if (target.y + target.size > canvas.height - 5) {
          // Handle target hitting the bottom
          if (target.value === currentProblem.answer) {
            // Game over if correct answer hits bottom
            setGameStatus('gameOver');
          } else {
            // Remove incorrect bubbles that hit the bottom
            handleTargetMiss(target.id);
          }
          return;
        }

        // Draw bubble with gradient
        const gradient = ctx.createRadialGradient(
          target.x, target.y, 0,
          target.x, target.y, target.size
        );

        gradient.addColorStop(0, 'rgba(46, 131, 183, 0.8)');
        gradient.addColorStop(1, 'rgba(37, 235, 123, 0.6)');

        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Add shine effect
        ctx.beginPath();
        ctx.arc(target.x - target.size * 0.3, target.y - target.size * 0.3, target.size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // Draw number
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.max(20, target.size / 2)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(target.value.toString(), target.x, target.y);
      });

      // Continue animation loop
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    gameStatus, 
    targets, 
    currentProblem, 
    updateTargets, 
    handleTargetMiss, 
    setGameStatus
  ]);

  // Handle click on canvas
  const handleClick = (e) => {
    if (gameStatus !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find the topmost bubble at the click position
    let clickedTarget = null;
    let minDistance = Infinity;

    targets.forEach(target => {
      const distance = Math.sqrt(
        Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
      );

      if (distance < target.size && distance < minDistance) {
        clickedTarget = target;
        minDistance = distance;
      }
    });

    if (clickedTarget) {
      // Handle target click through the store
      handleTargetClick(clickedTarget.id, clickedTarget.value);
      
      // If clicked on wrong answer, end the game
      if (clickedTarget.value !== currentProblem.answer) {
        setGameStatus('gameOver');
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="inset-0 z-10"
      style={{ position: 'absolute', top: 5 }}
    />
  );
};

export default Canvas;