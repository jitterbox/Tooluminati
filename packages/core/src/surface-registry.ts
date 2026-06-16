export type ContextSurfaceKind = 'tool' | 'resource';

export interface ContextSurfaceSnapshot<T = unknown> {
  kind: ContextSurfaceKind;
  name: string;
  read: () => T | Promise<T>;
  debounceMs?: number;
}

export interface ContextSurfaceRegistry {
  registerSurface(surface: ContextSurfaceSnapshot): () => void;
  listSurfaces(): ContextSurfaceSnapshot[];
}

export function createContextSurfaceRegistry(): ContextSurfaceRegistry {
  const surfaces = new Map<string, ContextSurfaceSnapshot>();

  return {
    registerSurface(surface) {
      surfaces.set(surface.name, surface);
      return () => surfaces.delete(surface.name);
    },
    listSurfaces() {
      return [...surfaces.values()];
    },
  };
}
