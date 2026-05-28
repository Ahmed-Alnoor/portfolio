import { createRoot } from 'react-dom/client';
import Lanyard from './Lanyard/Lanyard';

function mount() {
  const el = document.getElementById('lanyard-root');
  if (el) {
    createRoot(el).render(<Lanyard position={[0, 0, 27]} gravity={[0, -40, 0]} />);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
