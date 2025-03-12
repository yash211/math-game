import { create } from 'zustand';
import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');
const socket = io(import.meta.env.VITE_BACKEND_URL);


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

  // Target clciked handler
  handleTargetClick: (id, value) => {
    const { currentProblem } = get();
    const correct = value === currentProblem.answer;
    
    socket.emit('targetHit', { id, correct });
    
    
    set(state => ({
      targets: state.targets.filter(target => target.id !== id)
    }));
  },

  //Target off-screen handler
  handleTargetMiss: (id) => {
    socket.emit('targetMiss', { id });
    
    set(state => ({
      targets: state.targets.filter(target => target.id !== id)
    }));
  },
  
  //state management
  setScore: (score) => set({ score }),
  setLevel: (level) => set({ level }),
  setGameStatus: (gameStatus) => set({ gameStatus }),
  setTargets: (targets) => set({ targets }),
  setProblem: (problem) => set({ currentProblem: problem }),

  //level change request
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