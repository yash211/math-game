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

 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 30;
      //To notify abt the screen window size
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
      
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 5);
      ctx.lineTo(canvas.width, canvas.height - 5);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.stroke();

      // every target
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

        // Bubble implementation
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

      //animation loop
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
     //target click store
      handleTargetClick(clickedTarget.id, clickedTarget.value);
      
      // end game is wrong target is clicked
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