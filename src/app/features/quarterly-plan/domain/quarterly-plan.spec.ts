import { describe, expect, it } from 'vitest';
import { QuarterId } from '../../../core/domain';
import { DEFAULT_CHALLENGES } from '../../../shared/domain/default-challenges';
import { type Challenge } from '../../../shared/domain/challenge';
import { QuarterlyPlan } from './quarterly-plan';

function createChallenges(length = 4): Challenge[] {
  return Array.from({ length }, (_, index) => ({ name: `Challenge ${index}` }));
}

describe('QuarterlyPlan', () => {
  it('should createDefault verwendet die Default-Challenges', () => {
    // given
    const plan = QuarterlyPlan.createDefault('2026-Q3');

    // when + then
    expect(plan.quarterId.equals(QuarterId.parse('2026-Q3'))).toBe(true);
    expect(plan.challenges).toEqual(DEFAULT_CHALLENGES);
  });

  it('should fromChallenges kopiert die Eingabeliste', () => {
    // given
    const input = createChallenges(4);
    const plan = QuarterlyPlan.fromChallenges(input, '2026-Q2');

    input[0] = { name: 'Mutated after create' };
    // when + then
    expect(plan.challenges[0]?.name).toBe('Challenge 0');
  });

  it('should reorder vertauscht zwei Einträge und bleibt immutable', () => {
    // given
    const plan = QuarterlyPlan.fromChallenges(createChallenges(4), '2026-Q2');

    const reordered = plan.reorder(0, 3);

    // when + then
    expect(plan.challenges[0]?.name).toBe('Challenge 0');
    expect(reordered.challenges[0]?.name).toBe('Challenge 3');
    expect(reordered.challenges[3]?.name).toBe('Challenge 0');
  });

  it('should reorder mit ungültigem Index behält Daten unverändert', () => {
    // given
    const plan = QuarterlyPlan.fromChallenges(createChallenges(4), '2026-Q2');

    const reordered = plan.reorder(-1, 2);

    // when + then
    expect(reordered).not.toBe(plan);
    expect(reordered.challenges).toEqual(plan.challenges);
  });

  it('should update ersetzt die Challenge an gültigem Index immutable', () => {
    // given
    const plan = QuarterlyPlan.fromChallenges(createChallenges(4), '2026-Q2');

    const updated = plan.update(1, { name: 'Updated', imageId: 'img-1' });

    // when + then
    expect(plan.challenges[1]?.name).toBe('Challenge 1');
    expect(updated.challenges[1]).toEqual({ name: 'Updated', imageId: 'img-1' });
  });

  it('should toPersistable liefert Plain-Objekt mit quarterId und challenges', () => {
    // given
    const plan = QuarterlyPlan.fromChallenges(createChallenges(2), '2026-Q2');

    // when + then
    expect(plan.toPersistable()).toEqual({
      quarterId: '2026-Q2',
      challenges: createChallenges(2),
    });
  });
});
