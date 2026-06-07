import { useState, useEffect } from 'react';

const TOUR_DONE_KEY = 'app-tour-completed';

export function useAppTour() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_DONE_KEY);
    if (!done) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    setOpen(false);
    localStorage.setItem(TOUR_DONE_KEY, 'true');
  };

  const restart = () => {
    localStorage.removeItem(TOUR_DONE_KEY);
    setOpen(true);
  };

  return { open, finish, restart };
}
