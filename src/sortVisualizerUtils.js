export const INITIAL_SIZE = 25;

export function generateArray(size = INITIAL_SIZE) {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * 90) + 10
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForStep({ isCancelled, pauseRef, speedRef }) {
  let elapsed = 0;
  let previousTime = performance.now();

  while (!isCancelled()) {
    while (pauseRef.current && !isCancelled()) {
      await wait(20);
      previousTime = performance.now();
    }

    if (isCancelled() || elapsed >= speedRef.current) return;

    await wait(Math.min(20, speedRef.current - elapsed));

    const currentTime = performance.now();

    if (!pauseRef.current) {
      elapsed += currentTime - previousTime;
    }

    previousTime = currentTime;
  }
}
