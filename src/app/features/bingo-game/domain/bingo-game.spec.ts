import { describe, expect, it } from 'vitest';
import { BingoGame, ChallengeProgress, createPlanSignature } from './bingo-game';

// 4x4 Spielfeld:
//  0  1  2  3
//  4  5  6  7
//  8  9 10 11
// 12 13 14 15

function makeCells(length = 16, imageIds?: (string | undefined)[]) {
  return Array.from({ length }, (_, i) => ({
    name: `C${i}`,
    imageId: imageIds?.[i],
  }));
}

describe('BingoGame.fromDefinition', () => {
  it('should copy imageId as planningImageId when creating game from definition', () => {
    // given
    const cells = makeCells(16, ['img-0', undefined, 'img-2']);

    const game = BingoGame.fromDefinition('2026-Q2', cells);

    // when + then
    expect(game.challenges[0].planningImageId).toBe('img-0');
    expect(game.challenges[1].planningImageId).toBeUndefined();
    expect(game.challenges[2].planningImageId).toBe('img-2');
  });

  it('should initialize progressImageId as undefined when game is created', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16, ['img-0']));

    // when + then
    expect(game.challenges[0].progressImageId).toBeUndefined();
  });

  it('should mark all challenges as incomplete when game is created', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    // when + then
    expect(game.completed.every(c => !c)).toBe(true);
  });
});

describe('BingoGame.restore', () => {
  it('should restore planningImageId when saved progress contains it', () => {
    // given
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c): ChallengeProgress => ({
        name: c.name,
        planningImageId: 'saved-planning-img',
        progressImageId: undefined,
        completed: false,
      })),
      startedAt: new Date().toISOString(),
    };

    const game = BingoGame.restore(cells, saved);

    // when + then
    expect(game.challenges[0].planningImageId).toBe('saved-planning-img');
  });

  it('should fallback to definition imageId when saved planningImageId is missing', () => {
    // given
    const cells = makeCells(16, ['definition-img']);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: undefined,
        completed: false,
      })),
      startedAt: new Date().toISOString(),
    };

    const game = BingoGame.restore(cells, saved);

    // when + then
    expect(game.challenges[0].planningImageId).toBe('definition-img');
  });

  it('should keep progressImageId when restoring from saved progress', () => {
    // given
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c, i): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: i === 0 ? 'progress-photo' : undefined,
        completed: false,
      })),
      startedAt: new Date().toISOString(),
    };

    const game = BingoGame.restore(cells, saved);

    // when + then
    expect(game.challenges[0].progressImageId).toBe('progress-photo');
    expect(game.challenges[1].progressImageId).toBeUndefined();
  });

  it('should start a fresh game when saved signature does not match', () => {
    // given
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: 'outdated-signature',
      challenges: cells.map((c): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: undefined,
        completed: true,
      })),
      startedAt: new Date().toISOString(),
    };

    const game = BingoGame.restore(cells, saved);

    // when + then
    expect(game.completed.every(c => !c)).toBe(true);
  });
});

describe('BingoGame.toggle', () => {
  it('should mark challenge as completed when toggled once', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const toggled = game.toggle(0);

    // when + then
    expect(toggled.completed[0]).toBe(true);
  });

  it('should restore original completion state when toggled twice', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const result = game.toggle(0).toggle(0);

    // when + then
    expect(result.completed[0]).toBe(false);
  });

  it('should keep other challenges unchanged when toggling one challenge', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const toggled = game.toggle(5);

    // when + then
    expect(toggled.completed[4]).toBe(false);
    expect(toggled.completed[6]).toBe(false);
  });

  it('should ignore update when index is out of range', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const result = game.toggle(99);

    // when + then
    expect(result.completed).toEqual(game.completed);
  });
});

describe('BingoGame.resetProgress', () => {
  it('should clear all completed flags when resetting progress', () => {
    // given
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: undefined,
        completed: true,
      })),
      startedAt: new Date().toISOString(),
    };
    const game = BingoGame.restore(cells, saved);

    const reset = game.resetProgress();

    // when + then
    expect(reset.completed.every(c => !c)).toBe(true);
  });

  it('should keep planning and progress image ids when resetting progress', () => {
    // given
    const cells = makeCells(16, ['plan-img']);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c, i): ChallengeProgress => ({
        name: c.name,
        planningImageId: i === 0 ? 'plan-img' : undefined,
        progressImageId: i === 0 ? 'progress-img' : undefined,
        completed: true,
      })),
      startedAt: new Date().toISOString(),
    };
    const game = BingoGame.restore(cells, saved);

    const reset = game.resetProgress();

    // when + then
    expect(reset.challenges[0].planningImageId).toBe('plan-img');
    expect(reset.challenges[0].progressImageId).toBe('progress-img');
  });
});

describe('BingoGame.updateProgressImage', () => {
  it('should update progressImageId when valid challenge index is provided', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const updated = game.updateProgressImage(0, 'new-photo');

    // when + then
    expect(updated.challenges[0].progressImageId).toBe('new-photo');
  });

  it('should not modify planningImageId when updating progress image', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16, ['plan-img']));

    const updated = game.updateProgressImage(0, 'new-photo');

    // when + then
    expect(updated.challenges[0].planningImageId).toBe('plan-img');
  });

  it('should allow clearing progressImageId when undefined is provided', () => {
    // given
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c, i): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: i === 0 ? 'old-photo' : undefined,
        completed: false,
      })),
      startedAt: new Date().toISOString(),
    };
    const game = BingoGame.restore(cells, saved);

    const updated = game.updateProgressImage(0, undefined);

    // when + then
    expect(updated.challenges[0].progressImageId).toBeUndefined();
  });

  it('should ignore update when index is out of range', () => {
    // given
    const game = BingoGame.fromDefinition('2026-Q2', makeCells(16));

    const result = game.updateProgressImage(99, 'photo');

    // when + then
    expect(result.challenges).toEqual(game.challenges);
  });
});

describe('BingoGame.bingoCells', () => {
  function makeCompleted(trueIndices: number[], total = 16): boolean[] {
    return Array.from({ length: total }, (_, i) => trueIndices.includes(i));
  }

  function gameWithCompleted(trueIndices: number[]): BingoGame {
    const cells = makeCells(16);
    const saved = {
      quarterId: '2026-Q2',
      planSignature: createPlanSignature(cells),
      challenges: cells.map((c, i): ChallengeProgress => ({
        name: c.name,
        planningImageId: undefined,
        progressImageId: undefined,
        completed: trueIndices.includes(i),
      })),
      startedAt: new Date().toISOString(),
    };
    return BingoGame.restore(cells, saved);
  }

  it('should return empty bingo set when no bingo line exists', () => {
    // given
    const game = gameWithCompleted([0, 1, 2]);

    // when + then
    expect(game.bingoCells.size).toBe(0);
  });

  it('should detect bingo cells when first column is completed', () => {
    // given
    // Spalte 0: Indices 0, 4, 8, 12
    const game = gameWithCompleted([0, 4, 8, 12]);

    // when + then
    expect([0, 4, 8, 12].every(i => game.bingoCells.has(i))).toBe(true);
    expect(game.bingoCells.has(1)).toBe(false);
  });

  it('should detect bingo cells when second row is completed', () => {
    // given
    // Zeile 1: Indices 4, 5, 6, 7
    const game = gameWithCompleted([4, 5, 6, 7]);

    // when + then
    expect([4, 5, 6, 7].every(i => game.bingoCells.has(i))).toBe(true);
    expect(game.bingoCells.has(0)).toBe(false);
  });

  it('should detect bingo cells when main diagonal is completed', () => {
    // given
    // Hauptdiagonale: 0, 5, 10, 15
    const game = gameWithCompleted([0, 5, 10, 15]);

    // when + then
    expect([0, 5, 10, 15].every(i => game.bingoCells.has(i))).toBe(true);
    expect(game.bingoCells.has(1)).toBe(false);
  });

  it('should detect bingo cells when anti diagonal is completed', () => {
    // given
    // Nebendiagonale: 3, 6, 9, 12
    const game = gameWithCompleted([3, 6, 9, 12]);

    // when + then
    expect([3, 6, 9, 12].every(i => game.bingoCells.has(i))).toBe(true);
    expect(game.bingoCells.has(0)).toBe(false);
  });

  it('should include indices from multiple bingo lines when overlaps exist', () => {
    // given
    // Zeile 0 + Spalte 0 → Index 0 ist in beiden
    const game = gameWithCompleted([0, 1, 2, 3, 4, 8, 12]);

    // when + then
    expect([0, 1, 2, 3].every(i => game.bingoCells.has(i))).toBe(true);
    expect([0, 4, 8, 12].every(i => game.bingoCells.has(i))).toBe(true);
  });
});
