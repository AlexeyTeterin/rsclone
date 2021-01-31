import { storage } from './index';

const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;

const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const toggleTheme = () => {
  console.log('theme toggle');
  const toggleElementClasses = (selectorName: string, ...classNames: Array<string>) => classNames
    .forEach((className) => document.querySelector(selectorName)?.classList
      .toggle(className, !themeSwitch.checked));

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

export { isDarkMode, themeSwitch, toggleTheme };
