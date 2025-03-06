import { Player, MathProblem, Target } from './types/game';

//Game states
export const players = new Map<string, Player>();
export const playerTargets = new Map<string, Target[]>();
export const playerProblems = new Map<string, MathProblem>();

//Target Management
export const targetIntervals = new Map<string, NodeJS.Timeout>();
export const staggeredTargetTimers = new Map<string, NodeJS.Timeout[]>();