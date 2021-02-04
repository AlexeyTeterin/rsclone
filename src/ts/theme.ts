import { storage } from './index';

export const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;

export const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const toggleElementClasses = (selectorName: string, ...classNames: Array<string>) => {
  classNames
    .forEach((className) => document.querySelector(selectorName)?.classList
      .toggle(className, !themeSwitch.checked));
};

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

export const textSpans = document.querySelectorAll('h1 span:not(:nth-child(2))');

export const onHeaderMouseover = () => {
  Array.from(textSpans).forEach((el) => {
    const span = el as HTMLElement;
    span.classList.add('glitch');
    span.dataset.text = span.textContent!;
  });
};

export const onHeaderMouseLeave = () => {
  Array.from(textSpans).forEach((el) => {
    const span = el as HTMLElement;
    span.classList.remove('glitch');
  });
};

export const runHeaderAnimationListeners = () => {
  document.querySelector('h1')!.addEventListener('mouseover', onHeaderMouseover);
  document.querySelector('h1')!.addEventListener('mouseleave', onHeaderMouseLeave);
};
