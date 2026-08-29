'use client';

import { useEffect, useState } from 'react';

export default function Horloge() {
  const [heure, setHeure] = useState('--:--:--');

  useEffect(() => {
    const tick = () => setHeure(new Date().toLocaleTimeString('fr-FR'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <div className="font-mono text-lg">{heure}</div>;
}
