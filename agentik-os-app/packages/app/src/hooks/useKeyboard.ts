import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboard() {
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const lastKeyPressedRef = useRef<{ key: string; time: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in input, textarea or select
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const now = Date.now();

      // Help Modal — support both '?' and '¿' (Spanish keyboard Shift+/)
      if (event.key === '?' || event.key === '¿') {
        event.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      // Check sequence 'g' -> target key within 1 second
      if (lastKeyPressedRef.current && lastKeyPressedRef.current.key === 'g' && now - lastKeyPressedRef.current.time < 1000) {
        let matched = true;
        if (key === 'd') {
          navigate('/dashboard');
        } else if (key === 'i') {
          navigate('/iron-monkey');
        } else if (key === 'w') {
          navigate('/growing');
        } else if (key === 'm') {
          navigate('/memory');
        } else if (key === 's') {
          navigate('/settings');
        } else if (key === 'h') {
          navigate('/');
        } else {
          matched = false;
        }

        if (matched) {
          event.preventDefault();
          lastKeyPressedRef.current = null;
          return;
        }
      }

      if (key === 'g') {
        lastKeyPressedRef.current = { key: 'g', time: now };
      } else {
        lastKeyPressedRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return { showShortcuts, setShowShortcuts };
}
