/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "fabric-history-v6" {
  export interface HistoryCanvas {
    undo(callback?: () => void): void;
    redo(callback?: () => void): void;
    canUndo(): boolean;
    canRedo(): boolean;
    clearHistory(): void;
    onHistory(): void;
    offHistory(): void;
    saveInitialState(): void;
    _historyInit(): void;
    _historyDispose(): void;
  }

  export function HistoryMixin<T extends new (...args: any[]) => any>(
    Base: T
  ): T & {
    new (...args: any[]): InstanceType<T> & HistoryCanvas;
  };

  export class CanvasWithHistory {
    constructor(element: string | HTMLCanvasElement, options?: any);
    undo(callback?: () => void): void;
    redo(callback?: () => void): void;
    canUndo(): boolean;
    canRedo(): boolean;
    clearHistory(): void;
    onHistory(): void;
    offHistory(): void;
    saveInitialState(): void;
    dispose(): void;
  }

  export class StaticCanvasWithHistory {
    constructor(element: string | HTMLCanvasElement, options?: any);
    undo(callback?: () => void): void;
    redo(callback?: () => void): void;
    canUndo(): boolean;
    canRedo(): boolean;
    clearHistory(): void;
    onHistory(): void;
    offHistory(): void;
    saveInitialState(): void;
    dispose(): void;
  }
}
