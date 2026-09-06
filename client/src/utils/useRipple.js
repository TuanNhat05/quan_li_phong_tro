import { useEffect } from 'react';

/**
 * useRipple - Adds a material-design ripple wave to every .btn element on click.
 * Works globally: no need to modify individual button components.
 */
export default function useRipple() {
  useEffect(() => {
    const handleClick = (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      // Create the wave span
      const ripple = document.createElement('span');
      ripple.classList.add('btn-ripple-wave');

      // Position at click point relative to button
      const rect = btn.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top  = `${e.clientY - rect.top}px`;

      btn.appendChild(ripple);

      // Remove after animation ends (600ms)
      setTimeout(() => {
        ripple.remove();
      }, 650);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
