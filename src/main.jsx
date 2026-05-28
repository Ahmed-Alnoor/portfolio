import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Lanyard from './Lanyard/Lanyard';

const el = document.getElementById('lanyard-root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <Lanyard position={[0, 0, 27]} gravity={[0, -40, 0]} />
    </StrictMode>
  );
}
