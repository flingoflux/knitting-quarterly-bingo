export interface QuarterRolloverCursor {
  activeQuarterId: string;
}

export function createQuarterRolloverCursor(activeQuarterId: string): QuarterRolloverCursor {
  return {
    activeQuarterId,
  };
}

export function isQuarterRolloverCursor(value: unknown): value is QuarterRolloverCursor {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<QuarterRolloverCursor>;
  return typeof candidate.activeQuarterId === 'string';
}
