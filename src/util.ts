export function waitForRAF() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      resolve();
    });
  });
}

export async function* tickRAF(c: AbortController) {
  while (!c.signal.aborted) {
    await waitForRAF();
    yield;
  }
}
