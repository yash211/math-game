import { Player, Target, MathProblem } from '../types/game';

//Game class implementation
//Player CRUD and Score calculation methods

export class Game {
  private players: Map<string, Player> = new Map();
  private targets: Map<string, Target[]> = new Map();

  addPlayer(playerId: string): Player {
    const player: Player = {
      id: playerId,
      score: 0,
      level: 1,
      // lives: 3,
      gameStatus: 'idle'
    };
    this.players.set(playerId, player);
    this.targets.set(playerId, []);
    return player;
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
    this.targets.delete(playerId);
  }
  

  updateTargets(playerId: string): Target[] {
    const playerTargets = this.targets.get(playerId) || [];
    const updatedTargets = playerTargets.map(target => ({
      ...target,
      y: target.y + target.speed
    }));
    this.targets.set(playerId, updatedTargets);
    return updatedTargets;
  }

  removeTarget(playerId: string, targetId: string): void {
    const playerTargets = this.targets.get(playerId) || [];
    this.targets.set(
      playerId,
      playerTargets.filter(target => target.id !== targetId)
    );
  }

  updateScore(playerId: string, points: number): number {
    const player = this.players.get(playerId);
    if (!player) throw new Error('Player not found');

    player.score = Math.max(0, player.score + points);
    return player.score;
  }


  updateLevel(playerId: string, level: number): number {
    const player = this.players.get(playerId);
    if (!player) throw new Error('Player not found');

    player.level = level;
    return player.level;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getTargets(playerId: string): Target[] {
    return this.targets.get(playerId) || [];
  }
}