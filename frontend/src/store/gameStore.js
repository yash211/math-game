// import { create } from 'zustand';
// import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');

// const useGameStore = create((set, get) => ({
//   score: 0,
//   level: 1,
//   targets: [],
//   currentProblem: { question: '', answer: 0 },
//   gameStatus: 'idle',
//   socket: socket, // Expose socket instance

//   initGame: () => {
//     set({
//       score: 0,
//       level: 1,
//       targets: [],
//       gameStatus: 'playing',
//     });
//     socket.emit('windowSize', { width: window.innerWidth });
//   },

//   stopGame: () => {
//     set({
//       gameStatus: 'idle',
//       targets: []
//     });
//   },

//   addTarget: () => {
//     const state = get();
//     if (state.gameStatus !== 'playing') return;
    
//     // Generate wrong answers that are close to the correct answer
//     const generateWrongAnswer = () => {
//       const offset = Math.floor(Math.random() * 5) + 1;
//       return Math.random() < 0.5 
//         ? state.currentProblem.answer + offset 
//         : state.currentProblem.answer - offset;
//     };

//     // Check if we already have a correct answer bubble
//     const hasCorrectBubble = state.targets.some(target => 
//       target.value === state.currentProblem.answer
//     );
    
//     // If we already have a correct answer, only generate wrong answers
//     const value = hasCorrectBubble ? generateWrongAnswer() : state.currentProblem.answer;

//     // Increase base size but keep it consistent to avoid overlap issues
//     const size = 50; // Fixed size to reduce overlap

//     // Reduce speed to make the game more playable
//     const baseSpeed = 0.7; // Reduced speed
//     const levelSpeedBonus = state.level * 0.2; // Reduced speed increase per level
//     const randomSpeedVariation = Math.random() * 0.3; // Reduced variation
//     const speed = baseSpeed + levelSpeedBonus + randomSpeedVariation;

//     // Find a position that doesn't overlap with existing bubbles
//     let x, overlapping;
//     const maxAttempts = 10;
//     let attempts = 0;
    
//     do {
//       attempts++;
//       overlapping = false;
//       x = Math.random() * (window.innerWidth - size * 2) + size;
      
//       // Check for overlap with existing targets
//       for (const target of state.targets) {
//         const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(-size - target.y, 2));
//         if (distance < (size + target.size)) {
//           overlapping = true;
//           break;
//         }
//       }
//     } while (overlapping && attempts < maxAttempts);

//     // Check if the value already exists in targets (to prevent duplicate values)
//     const valueExists = state.targets.some(target => target.value === value);
    
//     // If the value already exists and it's not the correct answer, generate a different value
//     if (valueExists && value !== state.currentProblem.answer) {
//       // Try to generate a unique value
//       let uniqueValue = value;
//       let attempts = 0;
//       while (state.targets.some(target => target.value === uniqueValue) && attempts < 5) {
//         uniqueValue = generateWrongAnswer();
//         attempts++;
//       }
      
//       // If we still have a duplicate after attempts, add a random offset
//       if (state.targets.some(target => target.value === uniqueValue)) {
//         uniqueValue = value + Math.floor(Math.random() * 10) + 5;
//       }
      
//       value = uniqueValue;
//     }

//     const newTarget = {
//       id: Math.random().toString(36).substring(7),
//       x,
//       y: -size,
//       value,
//       speed,
//       size
//     };

//     set(state => ({
//       targets: [...state.targets, newTarget]
//     }));
//   },

//   updateTargets: () => {
//     set(state => ({
//       targets: state.targets.map(target => ({
//         ...target,
//         y: target.y + target.speed
//       }))
//     }));
//   },

//   removeTarget: (id) => {
//     set(state => ({
//       targets: state.targets.filter(target => target.id !== id)
//     }));
//   },

//   setScore: (score) => {
//     set({ score });
//   },
  
//   setLevel: (level) => {
//     set({ level });
//     socket.emit('levelUp', { level });
//   },
  
//   setGameStatus: (gameStatus) => set({ gameStatus }),
  
//   setTargets: (targets) => set({ targets }),
  
//   setProblem: (problem) => set({ currentProblem: problem }),
  
//   generateNewProblem: () => {
//     const level = get().level;
//     const operations = ['+', '-', '*'];
//     const operation = operations[Math.floor(Math.random() * (level === 1 ? 2 : 3))];
    
//     let num1, num2, answer;
    
//     switch (operation) {
//       case '+':
//         num1 = Math.floor(Math.random() * (10 * level)) + 1;
//         num2 = Math.floor(Math.random() * (10 * level)) + 1;
//         answer = num1 + num2;
//         break;
//       case '-':
//         num1 = Math.floor(Math.random() * (10 * level)) + 1;
//         num2 = Math.floor(Math.random() * num1) + 1;
//         answer = num1 - num2;
//         break;
//       case '*':
//         num1 = Math.floor(Math.random() * (5 * level)) + 1;
//         num2 = Math.floor(Math.random() * 5) + 1;
//         answer = num1 * num2;
//         break;
//       default:
//         num1 = 0;
//         num2 = 0;
//         answer = 0;
//     }

//     set({
//       currentProblem: {
//         question: `${num1} ${operation} ${num2}`,
//         answer
//       }
//     });
//   }
// }));

// // Socket event listeners
// socket.on('gameState', ({ player, targets, problem }) => {
//   useGameStore.setState({
//     score: player.score,
//     level: player.level,
//     targets,
//     currentProblem: problem
//   });
// });

// socket.on('newTarget', (target) => {
//   useGameStore.setState(state => ({
//     targets: [...state.targets, target]
//   }));
// });

// socket.on('targetsUpdate', (targets) => {
//   useGameStore.setState({ targets });
// });

// socket.on('newProblem', (problem) => {
//   useGameStore.setState({ currentProblem: problem });
// });

// socket.on('scoreUpdate', (score) => {
//   useGameStore.setState({ score });
// });

// socket.on('levelUpdate', (level) => {
//   useGameStore.setState({ level });
// });

// socket.on('gameOver', () => {
//   useGameStore.setState({ gameStatus: 'gameOver' });
// });

// export default useGameStore;

import { create } from 'zustand';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const useGameStore = create((set, get) => ({
  score: 0,
  level: 1,
  targets: [],
  currentProblem: { question: '', answer: 0 },
  gameStatus: 'idle',
  socket: socket, // Expose socket instance

  initGame: () => {
    set({
      score: 0,
      level: 1,
      targets: [],
      gameStatus: 'playing',
    });
    socket.emit('initGame', { width: window.innerWidth });
  },

  stopGame: () => {
    socket.emit('stopGame');
    set({
      gameStatus: 'idle',
      targets: []
    });
  },

  
  updateTargets: () => {
    set(state => ({
      targets: state.targets.map(target => ({
        ...target,
        y: target.y + target.speed
      }))
    }));
    
    
    socket.emit('updateTargetPositions', get().targets);
  },

  // Handle when a target is clicked by the player
  handleTargetClick: (id, value) => {
    const { currentProblem } = get();
    const correct = value === currentProblem.answer;
    
    socket.emit('targetHit', { id, correct });
    
    
    set(state => ({
      targets: state.targets.filter(target => target.id !== id)
    }));
  },

  // Handle when a target goes off-screen
  handleTargetMiss: (id) => {
    socket.emit('targetMiss', { id });
    
    set(state => ({
      targets: state.targets.filter(target => target.id !== id)
    }));
  },
  
  // Helper methods for state management
  setScore: (score) => set({ score }),
  setLevel: (level) => set({ level }),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  setTargets: (targets) => set({ targets }),
  setProblem: (problem) => set({ currentProblem: problem }),

  // Request a level change
  requestLevelUp: () => {
    const newLevel = get().level + 1;
    socket.emit('levelUp', { level: newLevel });
  }
}));


socket.on('gameState', ({ player, targets, problem }) => {
  useGameStore.setState({
    score: player.score,
    level: player.level,
    targets,
    currentProblem: problem,
    gameStatus: player.gameStatus
  });
});

socket.on('newTarget', (target) => {
  useGameStore.setState(state => ({
    targets: [...state.targets, target]
  }));
});

socket.on('targetsUpdate', (targets) => {
  useGameStore.setState({ targets });
});

socket.on('newProblem', (problem) => {
  useGameStore.setState({ currentProblem: problem });
});

socket.on('scoreUpdate', (score) => {
  useGameStore.setState({ score });
});

socket.on('levelUpdate', (level) => {
  useGameStore.setState({ level });
});

socket.on('gameOver', () => {
  useGameStore.setState({ gameStatus: 'gameOver' });
});

export default useGameStore;