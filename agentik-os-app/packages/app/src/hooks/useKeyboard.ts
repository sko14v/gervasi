import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboard() {
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<{ key: string; time: number } | null>(null);

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

      // Help Modal
      if (event.key === '?') {
        event.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      // Check sequence 'g' -> target key within 1 second
      if (lastKeyPressed && lastKeyPressed.key === 'g' && now - lastKeyPressed.time < 1000) {
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
          setLastKeyPressed(null);
          return;
        }
      }

      if (key === 'g') {
        setLastKeyPressed({ key: 'g', time: now });
      } else {
        setLastKeyPressed(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastKeyPressed, navigate]);

  return { showShortcuts, setShowShortcuts };
}
