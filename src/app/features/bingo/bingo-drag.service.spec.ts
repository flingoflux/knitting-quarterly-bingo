import { BingoDragService } from './bingo-drag.service';

describe('BingoDragService', () => {
  let service: BingoDragService;
  let projects: any[];
  let done: boolean[];

  beforeEach(() => {
    service = new BingoDragService();
    projects = [
      { title: 'A' },
      { title: 'B' },
      { title: 'C' },
      { title: 'D' }
    ];
    done = [false, false, false, false];
  });

  it('should set dragSourceIndex on dragStart', () => {
    service.dragStart(2);
    // @ts-expect-error: testing private property
    expect(service["dragSourceIndex"]).toBe(2);
  });

  it('should set dragTargetIndex on dragOver', () => {
    service.dragOver(1);
    expect(service.getDragTargetIndex()).toBe(1);
  });

  it('should reset dragTargetIndex on dragLeave', () => {
    service.dragOver(1);
    service.dragLeave(1);
    expect(service.getDragTargetIndex()).toBeNull();
  });

  it('should swap projects and done on drop', () => {
    service.dragStart(0);
    service.dragOver(2);
    const result = service.drop(2, projects, done);
    expect(result).not.toBeNull();
    expect(result!.projects[0].title).toBe('C');
    expect(result!.projects[2].title).toBe('A');
    expect(result!.done[0]).toBe(false);
    expect(result!.done[2]).toBe(false);
  });

  it('should return null if drop on same index', () => {
    service.dragStart(1);
    service.dragOver(1);
    const result = service.drop(1, projects, done);
    expect(result).toBeNull();
  });

  it('should reset indices on reset()', () => {
    service.dragStart(1);
    service.dragOver(2);
    service.reset();
    // @ts-expect-error: testing private property
    expect(service["dragSourceIndex"]).toBeNull();
    expect(service.getDragTargetIndex()).toBeNull();
  });
});
