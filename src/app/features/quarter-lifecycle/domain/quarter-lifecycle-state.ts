export interface QuarterLifecycleState {
  activeQuarterId: string;
  lastRolloverAt: string;
}

export function createQuarterLifecycleState(activeQuarterId: string, nowIso: string): QuarterLifecycleState {
  return {
    activeQuarterId,
    lastRolloverAt: nowIso,
  };
}

export function isQuarterLifecycleState(value: unknown): value is QuarterLifecycleState {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<QuarterLifecycleState>;
  return typeof candidate.activeQuarterId === 'string' && typeof candidate.lastRolloverAt === 'string';
}
