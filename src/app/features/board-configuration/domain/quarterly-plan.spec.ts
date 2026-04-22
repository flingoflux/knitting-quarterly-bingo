import { describe, expect, it } from 'vitest';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { type Challenge } from '../../../shared/domain/challenge';
import { QuarterlyPlan } from './quarterly-plan';

function createChallenges(length = 4): Challenge[] {
  return Array.from({ length }, (_, index) => ({ name: `Challenge ${index}` }));
}

describe('QuarterlyPlan', () => {
  it('createDefault verwendet die Default-Challenges', () => {
    const plan = QuarterlyPlan.createDefault('2026-Q3');

    expect(plan.id).toBe('2026-Q3');
    expect(plan.challenges).toEqual(DEFAULT_CHALLENGES);
  });

  it('fromChallenges kopiert die Eingabeliste', () => {
    const input = createChallenges(4);
    const plan = QuarterlyPlan.fromChallenges(input, 'board-id');

    input[0] = { name: 'Mutated after create' };
    expect(plan.challenges[0]?.name).toBe('Challenge 0');
  });

  it('reorder vertauscht zwei Einträge und bleibt immutable', () => {
    const plan = QuarterlyPlan.fromChallenges(createChallenges(4), 'board-id');

    const reordered = plan.reorder(0, 3);

    expect(plan.challenges[0]?.name).toBe('Challenge 0');
    expect(reordered.challenges[0]?.name).toBe('Challenge 3');
    expect(reordered.challenges[3]?.name).toBe('Challenge 0');
  });

  it('reorder mit ungültigem Index behält Daten unverändert', () => {
    const plan = QuarterlyPlan.fromChallenges(createChallenges(4), 'board-id');

    const reordered = plan.reorder(-1, 2);

    expect(reordered).not.toBe(plan);
    expect(reordered.challenges).toEqual(plan.challenges);
  });

  it('update ersetzt die Challenge an gültigem Index immutable', () => {
    const plan = QuarterlyPlan.fromChallenges(createChallenges(4), 'board-id');

    const updated = plan.update(1, { name: 'Updated', imageId: 'img-1' });

    expect(plan.challenges[1]?.name).toBe('Challenge 1');
    expect(updated.challenges[1]).toEqual({ name: 'Updated', imageId: 'img-1' });
  });

  it('toPersistable liefert Plain-Objekt mit id und challenges', () => {
    const plan = QuarterlyPlan.fromChallenges(createChallenges(2), 'board-id');

    expect(plan.toPersistable()).toEqual({
      id: 'board-id',
      challenges: createChallenges(2),
    });
  });
});
