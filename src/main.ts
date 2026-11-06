import './styles.css';
import { AppController } from './ui/app';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (root) {
    new AppController(root);
  }
});
