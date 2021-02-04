import { headerTextSpans, themeSwitch, toggleElementClasses } from './dom_elements';
import { storage } from './index';

export const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const onThemeSwitchClick = () => {
  toggleElementClasses('html', 'bg-dark');
  toggleElementClasses('header', 'text-light');
  toggleElementClasses('#modal .modal-content', 'dark', 'text-light');
  toggleElementClasses('#settingsModal .modal-content', 'dark', 'text-light');
  toggleElementClasses('#top101', 'text-light');
  toggleElementClasses('.film', 'invert');
  toggleElementClasses('footer', 'text-muted');
  toggleElementClasses('.keyboard', 'bg-dark');

  storage.load();
  storage.darkMode = !themeSwitch.checked;
  storage.save();
};

export const applySystemTheme = () => {
  if (!storage.darkModeAuto) return;
  if (isDarkMode() !== storage.darkMode) {
    themeSwitch.checked = !themeSwitch.checked;
    onThemeSwitchClick();
  }
};

export const onHeaderMouseover = () => {
  Array.from(headerTextSpans).forEach((el) => {
    const span = el as HTMLElement;
    span.classList.add('glitch');
    span.dataset.text = span.textContent!;
  });
};

export const onHeaderMouseLeave = () => {
  Array.from(headerTextSpans).forEach((el) => {
    const span = el as HTMLElement;
    span.classList.remove('glitch');
  });
};

export const runHeaderAnimationListeners = () => {
  document.querySelector('h1')!.addEventListener('mouseover', onHeaderMouseover);
  document.querySelector('h1')!.addEventListener('mouseleave', onHeaderMouseLeave);
};
