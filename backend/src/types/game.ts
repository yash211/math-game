export interface Player {
    id: string;
    score: number;
    level: number;
    gameStatus: 'idle' | 'playing' | 'paused' | 'gameOver';
    windowWidth?: number;
    // lives: number;
  }
  
  export interface Target {
    id: string;
    x: number;
    y: number;
    value: number;
    speed: number;
    size: number;
  }
  
  export interface MathProblem {
    question: string;
    answer: number;
  }