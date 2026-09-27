import confetti from 'canvas-confetti';

/**
 * Triggers a celebratory confetti spray from the edges of the viewport.
 */
export function triggerConfetti() {
  if (typeof window === 'undefined') return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#6366f1', '#8b5cf6', '#10b981'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#f59e0b', '#ec4899', '#3b82f6'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Triggers a golden trophy / streak celebration burst.
 */
export function triggerGoldCelebration() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#fbbf24', '#fef08a', '#d97706'],
    zIndex: 9999,
  });
}
