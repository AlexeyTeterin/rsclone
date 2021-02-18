import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import '../css/keyboard.css';

import React from 'react';
import ReactDom from 'react-dom';
import Swiper from 'swiper/bundle';
import swiperParams from './swiperParams';
import Keyboard from '../js/keyboard';
import Storage from './Storage';
import onNavLinkClick from './menu';
import { onTabKeypress, runSettingsModalListeners } from './settingsModal';
import { onSearchButtonClick, onActiveIndexChange, onEnterKeypress } from './search';
import {
  loadFavorites, favoritesObserver, loadUpcomingMovies, top101observer, wait, showControls,
} from './utils';
import {
  onSystemThemeChange, onThemeSwitchClick, isAppDarkMode, onHeaderMouseLeave, onHeaderMouseover,
} from './theme';
import {
  keyboardIcon, top101Tab, menu, searchBtn,
  searchInput, themeSwitch, favoritesWrapper, h1, footerEl,
} from './dom_elements';
import {
  onFavButtonClick, onKeyboardIconClick,
  onLearnMoreClick,
  onRatingBadgeClick, onWindowResize, showMoviesTab,
} from './dom_utils';
import Footer from './Footer';

const storage = new Storage();
const keyboard = new Keyboard();
const swiper = {
  movies: new Swiper('.swiper-container.movies', swiperParams),
  favorites: new Swiper('.swiper-container.favorites', swiperParams),
};
const state = {
  page: 0,
  request: '',
  top101page: 1,
};

const init = () => {
  keyboard.init();
  searchInput.focus();

  if (!localStorage.VideoBox) {
    storage.save();
  } else {
    storage.load();
  }

  if (isAppDarkMode()) {
    themeSwitch.checked = false;
  }

  ReactDom.render(<Footer year={2021} />, footerEl);
  onThemeSwitchClick();
  wait(1000).then(() => showControls());
};

init();
loadUpcomingMovies()
  .then(() => showMoviesTab())
  .then(() => loadFavorites());

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onSystemThemeChange);
window.addEventListener('resize', onWindowResize);

document.addEventListener('click', onLearnMoreClick);
document.addEventListener('click', onFavButtonClick);
document.addEventListener('click', onRatingBadgeClick);
document.addEventListener('keydown', onTabKeypress);

runSettingsModalListeners();
h1.addEventListener('mouseover', onHeaderMouseover);
h1.addEventListener('mouseleave', onHeaderMouseLeave);
themeSwitch.addEventListener('click', onThemeSwitchClick);
menu.addEventListener('click', onNavLinkClick);
searchInput.addEventListener('keypress', onEnterKeypress);
searchBtn.addEventListener('click', onSearchButtonClick);
keyboardIcon.addEventListener('click', onKeyboardIconClick);
swiper.movies.on('activeIndexChange', onActiveIndexChange);

favoritesObserver.observe(favoritesWrapper as Node, { childList: true });
top101observer.observe(top101Tab as Node, { childList: true, attributes: true });

export {
  state, storage, swiper, keyboard,
};
