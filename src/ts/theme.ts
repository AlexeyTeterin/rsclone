import { storage } from './index';

const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;

const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const toggleElementClasses = (selectorName: string, ...classNames: Array<string>) => classNames
  .forEach((className) => document.querySelector(selectorName)?.classList
    .toggle(className, !themeSwitch.checked));

const toggleTheme = () => {
  toggleElementClasses('html', 'bg-dark');
  toggleElementClasses('header', 'text-light');
  toggleElementClasses('#modal .modal-content', 'dark', 'text-light');
  toggleElementClasses('#settingsModal .modal-content', 'dark', 'text-light');
  toggleElementClasses('#top101', 'text-light');
  toggleElementClasses('.film', 'invert');
  toggleElementClasses('footer', 'text-muted');

  storage.load();
  storage.darkMode = !themeSwitch.checked;
  storage.save();
};

const applySystemTheme = () => {
  if (!storage.darkModeAuto) return;
  if (isDarkMode() !== storage.darkMode) {
    themeSwitch.checked = !themeSwitch.checked;
    toggleTheme();
  }
};

export {
  isDarkMode, themeSwitch, toggleTheme, applySystemTheme,
};
