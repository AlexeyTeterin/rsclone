import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import '../css/keyboard.css';

import Swiper from 'swiper/bundle';
import swiperParams from './swiperParams';
import { onTabKeypress, runSettingsModalListeners } from './modal_settings';
import Storage from './Storage';
import {
  applySystemTheme, isDarkMode, runHeaderAnimationListeners,
  onThemeSwitchClick,
} from './theme';
import onLearnMoreClick from './modal_movieInfo';
import { top101observer } from './tab_top101';
import { onSearchButtonClick, onActiveIndexChange } from './search';
import { loadFavorites, favoritesObserver } from './tab_favorites';
import onMenuElementClick from './nav';
import Keyboard from '../js/keyboard';
import { onRatingBadgeClick, onFavButtonClick } from './movieSlide';
import loadUpcomingMovies from './tab_movies';
import {
  keyboardButton, top101, settingsButton, menu, searchBtn,
  searchInput, themeSwitch, favoritesWrapper,
} from './dom_elements';

const storage = new Storage();
const state = {
  page: 0,
  request: '',
  top101page: 1,
};
const swiper = {
  movies: new Swiper('.swiper-container.movies', swiperParams),
  favorites: new Swiper('.swiper-container.favorites', swiperParams),
};
const keyboard = new Keyboard();

const wait = (ms: number) => new Promise((resolve: any) => setTimeout(() => resolve(), ms));

const init = () => {
  const showControls = () => {
    settingsButton.classList.add('visible');
    themeSwitch.parentElement?.classList.add('visible');
  };

  if (!localStorage.VideoBox) storage.save();
  else storage.load();

  if (window.innerWidth < 400) {
    keyboardButton.classList.add('hidden');
  }
  keyboard.init();

  if (storage.darkModeAuto && isDarkMode()) themeSwitch.checked = false;
  if ((!storage.darkModeAuto && storage.darkMode)) themeSwitch.checked = false;
  onThemeSwitchClick();

  searchInput.focus();

  wait(1000).then(() => showControls());
};

const onEnterKeypress = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return;
  searchBtn.dispatchEvent(new Event('click', { bubbles: true }));
};

const onKeyboardButtonClick = () => {
  keyboardButton.classList.toggle('active');
  keyboard.toggleKeyboard();
};

init();
loadUpcomingMovies()
  .then(() => wait(150))
  .then(() => document.querySelector('#movies')!.classList.add('show'))
  .then(() => loadFavorites());

// window listeners
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);
window.addEventListener('resize', () => {
  if (window.innerWidth < 400) {
    keyboard.hideKeyboard();
    keyboardButton.classList.remove('active');
  }
});

// document listeners with event delegation
document.addEventListener('click', onLearnMoreClick);
document.addEventListener('click', onFavButtonClick);
document.addEventListener('click', onRatingBadgeClick);
document.addEventListener('keydown', onTabKeypress);

// element's listeners
themeSwitch.addEventListener('click', onThemeSwitchClick);
menu.addEventListener('click', onMenuElementClick);
searchInput.addEventListener('keypress', onEnterKeypress);
searchBtn.addEventListener('click', onSearchButtonClick);
runSettingsModalListeners();
runHeaderAnimationListeners();
keyboardButton.addEventListener('click', onKeyboardButtonClick);
document.querySelector('#off')!.addEventListener('click', () => keyboardButton.classList.remove('active'));
document.querySelector('#enter')!.addEventListener('click', () => searchBtn.dispatchEvent(new Event('click')));
swiper.movies.on('activeIndexChange', onActiveIndexChange);

// mutation observers
favoritesObserver.observe(favoritesWrapper as Node, { childList: true });
top101observer.observe(top101 as Node, { childList: true, attributes: true });

export {
  state, storage, swiper, settingsButton, onActiveIndexChange,
  loadFavorites, wait,
};
