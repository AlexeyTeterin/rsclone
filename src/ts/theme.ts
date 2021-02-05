import { storage } from './index';
import { toggleElementClasses } from './dom_utils';
import { headerTextSpans, themeSwitch, themeSwithableElements } from './dom_elements';

export const isSystemDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const isAppDarkMode = () => (storage.darkModeAuto ? isSystemDarkMode() : storage.darkMode);

export const onThemeSwitchClick = () => {
  themeSwithableElements.forEach((element) => {
    toggleElementClasses(element.selector, ...element.classes);
  });

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
