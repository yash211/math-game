
import React from 'react';
import { Target, Crosshair, Square } from 'lucide-react';
import useGameStore from '../store/gameStore';

const Home = () => {
  const { score, level, currentProblem, gameStatus, initGame, stopGame } = useGameStore();

  const styles = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
    },
    group: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    },
    scoreBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(59, 130, 246, 0.3)',
      padding: '8px 16px',
      borderRadius: '8px',
      color: 'white',
    },
    levelBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(59, 130, 246, 0.3)',
      padding: '8px 16px',
      borderRadius: '8px',
      color: 'white',
    },
    questionBox: {
      background: 'rgba(79, 70, 229, 0.6)',
      padding: '8px 16px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '20px',
    },
    stopButton: {
      background: 'rgba(239, 68, 68, 0.8)',
      color: 'white',
      border: 'none',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    gameOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(198, 236, 239, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
    },
    gameCard: {
      background: 'rgba(34, 185, 235, 0.86)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      maxWidth: '400px',
      width: '100%',
      color: 'white',
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: 'black',
    },
    startButton: {
      background: 'linear-gradient(to right,rgb(185, 16, 145), #059669)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
    }
  };

  if (gameStatus === 'idle' || gameStatus === 'gameOver') {
    return (
      <div style={styles.gameOverlay}>
        <div style={styles.gameCard}>
          <h1 style={styles.title}>Math Bubble Blaster</h1>
          {gameStatus === 'gameOver' && (
            <>
              <p style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px'}}>Game Over!</p>
              <p style={{fontSize: '18px', marginBottom: '20px'}}>Final Score: {score}</p>
            </>
          )}
          {gameStatus === 'idle' && (
            <p style={{fontSize: '16px', marginBottom: '20px'}}>Pop the bubble with the correct answer!</p>
          )}
          <button
            onClick={initGame}
            style={styles.startButton}
          >
            {gameStatus === 'gameOver' ? 'Play Again' : 'Start Game'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.header}>
      <div style={styles.group}>
        <div style={styles.scoreBox}>
          <Target size={20} color="#4ADE80" />
          <span style={{fontSize: '20px', fontWeight: 'bold'}}>{score}</span>
        </div>
        <div style={styles.levelBox}>
          <Crosshair size={20} color="#60A5FA" />
          <span style={{fontSize: '16px', fontWeight: 'bold'}}>Level {level}</span>
        </div>
      </div>
      <div style={styles.group}>
        <div style={styles.questionBox}>
          {currentProblem.question} = ?
        </div>
        <button
          onClick={stopGame}
          style={styles.stopButton}
          title="Stop Game"
        >
          <Square size={20} />
        </button>
      </div>
    </div>
  );
};

export default Home;