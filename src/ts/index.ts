import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import '../css/keyboard.css';

import Swiper from 'swiper/bundle';
import swiperParams from './swiperParams';
import Keyboard from '../js/keyboard';
import Storage from './Storage';
import onLearnMoreClick from './movieModal';
import onMenuElementClick from './menu';
import { onTabKeypress, runSettingsModalListeners } from './settingsModal';
import { onSearchButtonClick, onActiveIndexChange, onEnterKeypress } from './search';
import {
  loadFavorites, favoritesObserver, loadUpcomingMovies, top101observer, wait,
} from './utils';
import {
  applySystemTheme, isDarkMode, runHeaderAnimationListeners, onThemeSwitchClick,
} from './theme';
import {
  keyboardButton, top101Tab, settingsButton, menu, searchBtn,
  searchInput, themeSwitch, favoritesWrapper,
} from './dom_elements';
import {
  onFavButtonClick, onKeyboardButtonClick, onRatingBadgeClick, showMoviesTab,
} from './dom_utils';

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

init();
loadUpcomingMovies()
  .then(() => wait(150))
  .then(() => showMoviesTab())
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
top101observer.observe(top101Tab as Node, { childList: true, attributes: true });

export {
  state, storage, swiper, keyboard, wait,
};
