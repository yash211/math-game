
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
        <div style={{
          ...styles.gameCard,
          backgroundColor: '#f0f8ff',
          borderRadius: '16px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
          padding: '25px',
          border: '3px solid #3498db'
        }}>
          <h1 style={{
            ...styles.title,
            color: '#2c3e50',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>Math Bubble Blaster</h1>
          
          {gameStatus === 'gameOver' && (
            <div style={{
              backgroundColor: '#ffebee', 
              padding: '15px', 
              borderRadius: '12px',
              border: '2px solid #ff5252',
              marginBottom: '20px'
            }}>
              <p style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#d32f2f'}}>Game Over!</p>
              <p style={{fontSize: '20px', marginBottom: '10px', color: '#333'}}>Final Score: <span style={{fontWeight: 'bold', color: '#2196f3'}}>{score}</span></p>
            </div>
          )}
          
          {gameStatus === 'idle' && (
            <>
              <p style={{fontSize: '18px', marginBottom: '20px', color: '#444'}}>Pop the bubble with the correct answer!</p>
              
              <div style={{
                backgroundColor: '#e8f5e9',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '25px',
                border: '2px solid #66bb6a'
              }}>
                <h3 style={{
                  textAlign: 'center', 
                  marginTop: '0',
                  marginBottom: '15px', 
                  color: '#2e7d32',
                  fontSize: '20px',
                  borderBottom: '1px solid #a5d6a7',
                  paddingBottom: '8px'
                }}>GAME RULES</h3>
                
                <ul style={{
                  paddingLeft: '20px',
                  marginBottom: '0',
                  fontSize: '15px',
                  color: '#1b5e20',
                  listStyleType: 'none'
                }}>
                  <li style={{marginBottom: '8px'}}>Click the bubble with the correct answer</li>
                  <li style={{marginBottom: '8px'}}>Don't let bubbles reach the red line at the bottom</li>
                  <li style={{marginBottom: '0'}}>Clicking a wrong bubble ends the game</li>
                </ul>
              </div>
            </>
          )}
          
          <button
            onClick={initGame}
            style={{
              ...styles.startButton,
              backgroundColor: '#2196f3',
              padding: '12px 25px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '30px',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(33, 150, 243, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1976d2'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2196f3'}
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