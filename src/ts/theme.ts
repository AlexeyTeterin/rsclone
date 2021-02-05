import { storage } from './index';
import { headerTextSpans, themeSwitch } from './dom_elements';
import { toggleElementClasses } from './dom_utils';

export const isSystemDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const isAppDarkMode = () => (storage.darkModeAuto ? isSystemDarkMode() : storage.darkMode);

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

export const onSystemThemeChange = () => {
  if (!storage.darkModeAuto) return;
  if (isSystemDarkMode() !== storage.darkMode) {
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
