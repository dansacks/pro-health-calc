import '@testing-library/jest-dom/vitest';

// Charts measure their container; jsdom has no layout engine or ResizeObserver.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
